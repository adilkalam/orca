"""
STL analysis and comparison tools for the OpenSCAD MCP server.

Provides analyze_stl and compare_stl tools using trimesh for mesh analysis
and manifold3d for boolean difference operations.
"""

import time
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np
import trimesh

from .server import mcp


# ============================================================================
# Helper Functions
# ============================================================================


def _load_stl(stl_path: str) -> trimesh.Trimesh:
    """Load and validate an STL file.

    Args:
        stl_path: Absolute path to the STL file.

    Returns:
        Loaded trimesh object.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If the file cannot be parsed as STL.
    """
    path = Path(stl_path)
    if not path.exists():
        raise FileNotFoundError(stl_path)
    if not path.is_file():
        raise FileNotFoundError(stl_path)

    try:
        mesh = trimesh.load(str(path), force="mesh")
    except Exception as exc:
        raise ValueError(f"Cannot parse as STL: {path.name} ({exc})")

    if not isinstance(mesh, trimesh.Trimesh):
        raise ValueError(f"Cannot parse as STL: {path.name} (loaded as {type(mesh).__name__})")

    return mesh


def _error_response(message: str, error_code: str) -> Dict[str, Any]:
    """Build a structured error response matching the existing server pattern."""
    return {
        "success": False,
        "error": message,
        "error_code": error_code,
    }


def _compute_basics(mesh: trimesh.Trimesh) -> Dict[str, Any]:
    """Compute basic geometry metrics."""
    bounds = mesh.bounds  # [[min_x, min_y, min_z], [max_x, max_y, max_z]]
    bounds_min = bounds[0].tolist()
    bounds_max = bounds[1].tolist()
    dimensions = (bounds[1] - bounds[0]).tolist()

    is_watertight = bool(mesh.is_watertight)
    is_volume = bool(mesh.is_volume) if hasattr(mesh, "is_volume") else is_watertight

    volume = float(mesh.volume) if is_watertight else None
    surface_area = float(mesh.area)
    center_of_mass = mesh.center_mass.tolist() if is_watertight else None

    # Topology
    euler = int(mesh.euler_number)
    genus = None
    if is_watertight:
        # genus = 1 - euler/2 for closed surfaces
        genus = int(1 - euler // 2)

    return {
        "bounds_min": [round(v, 3) for v in bounds_min],
        "bounds_max": [round(v, 3) for v in bounds_max],
        "dimensions_mm": [round(v, 3) for v in dimensions],
        "volume_mm3": round(volume, 3) if volume is not None else None,
        "surface_area_mm2": round(surface_area, 3),
        "center_of_mass": [round(v, 3) for v in center_of_mass] if center_of_mass else None,
        "is_watertight": is_watertight,
        "is_volume": is_volume,
        "face_count": len(mesh.faces),
        "vertex_count": len(mesh.vertices),
        "euler_number": euler,
        "genus": genus,
    }


def _compute_thickness(
    mesh: trimesh.Trimesh,
    method: str = "ray",
    max_samples: int = 500,
) -> Dict[str, Any]:
    """Estimate wall thickness using ray casting from face centers along inverted normals.

    Shoots a ray from each sampled face center inward (opposite of face normal).
    The distance to the first intersection approximates local wall thickness.
    """
    face_count = len(mesh.faces)

    # Subsample if needed (fixed seed for reproducibility)
    if face_count > max_samples:
        rng = np.random.RandomState(42)
        indices = rng.choice(face_count, size=max_samples, replace=False)
    else:
        indices = np.arange(face_count)

    # Face centers and inward normals
    centers = mesh.triangles_center[indices]
    normals = mesh.face_normals[indices]

    # Offset origins slightly inward to avoid self-intersection
    origins = centers + normals * 1e-4
    directions = -normals

    # Cast rays
    locations, index_ray, index_tri = mesh.ray.intersects_location(
        ray_origins=origins,
        ray_directions=directions,
        multiple_hits=False,
    )

    if len(locations) == 0:
        return {
            "min_mm": None,
            "max_mm": None,
            "mean_mm": None,
            "percentile_5_mm": None,
            "percentile_95_mm": None,
            "method": method,
            "sample_count": len(indices),
            "warning": "No ray intersections found -- mesh may be a single surface.",
        }

    # Compute distances
    distances = np.linalg.norm(locations - origins[index_ray], axis=1)

    # Filter out near-zero hits (self-intersections)
    valid = distances > 0.01
    distances = distances[valid]

    if len(distances) == 0:
        return {
            "min_mm": None,
            "max_mm": None,
            "mean_mm": None,
            "percentile_5_mm": None,
            "percentile_95_mm": None,
            "method": method,
            "sample_count": len(indices),
            "warning": "All ray hits were self-intersections.",
        }

    return {
        "min_mm": round(float(np.min(distances)), 3),
        "max_mm": round(float(np.max(distances)), 3),
        "mean_mm": round(float(np.mean(distances)), 3),
        "percentile_5_mm": round(float(np.percentile(distances, 5)), 3),
        "percentile_95_mm": round(float(np.percentile(distances, 95)), 3),
        "method": method,
        "sample_count": int(len(indices)),
    }


def _compute_cross_sections(
    mesh: trimesh.Trimesh,
    axis: str = "all",
    heights: Optional[List[float]] = None,
) -> List[Dict[str, Any]]:
    """Compute cross-section profiles at specified heights.

    Default: auto-slice at 25%, 50%, 75% per axis.
    Maximum 30 sections per call.
    """
    bounds = mesh.bounds
    axes_map = {"x": 0, "y": 1, "z": 2}

    if axis == "all":
        axes_to_process = [0, 1, 2]
    elif axis in axes_map:
        axes_to_process = [axes_map[axis]]
    else:
        raise ValueError(f"Invalid axis '{axis}'. Must be 'x', 'y', 'z', or 'all'.")

    sections = []

    for ax in axes_to_process:
        axis_name = ["x", "y", "z"][ax]
        lo = float(bounds[0][ax])
        hi = float(bounds[1][ax])
        span = hi - lo

        if span < 1e-6:
            continue

        if heights is not None:
            slice_heights = heights
        else:
            # Auto-slice at 25%, 50%, 75%
            slice_heights = [
                lo + span * 0.25,
                lo + span * 0.50,
                lo + span * 0.75,
            ]

        for h in slice_heights:
            if len(sections) >= 30:
                break

            # Build the slicing plane
            origin = [0.0, 0.0, 0.0]
            normal = [0.0, 0.0, 0.0]
            origin[ax] = h
            normal[ax] = 1.0

            try:
                section = mesh.section(
                    plane_origin=origin,
                    plane_normal=normal,
                )
            except Exception:
                continue

            if section is None:
                continue

            # Convert to 2D path
            try:
                planar, _transform = section.to_planar()
            except Exception:
                continue

            area = float(planar.area) if hasattr(planar, "area") else 0.0
            perimeter = float(planar.length) if hasattr(planar, "length") else 0.0

            # Count polygons and holes
            polygon_count = 0
            hole_count = 0
            if hasattr(planar, "polygons_full"):
                polys = planar.polygons_full
                polygon_count = len(polys)
                for poly in polys:
                    if hasattr(poly, "interiors"):
                        hole_count += len(list(poly.interiors))
            elif hasattr(planar, "polygons_closed"):
                polygon_count = len(planar.polygons_closed)

            sections.append({
                "axis": axis_name,
                "height_mm": round(h, 3),
                "area_mm2": round(area, 3),
                "perimeter_mm": round(perimeter, 3),
                "polygon_count": polygon_count,
                "hole_count": hole_count,
            })

        if len(sections) >= 30:
            break

    return sections


# ============================================================================
# MCP Tools
# ============================================================================


@mcp.tool
async def analyze_stl(
    stl_path: str,
    measurements: Optional[List[str]] = None,
    cross_section_axis: str = "all",
    cross_section_heights: Optional[List[float]] = None,
    thickness_method: str = "ray",
) -> Dict[str, Any]:
    """Analyze an STL file to extract geometry measurements.

    Extracts dimensions, volume, surface area, topology, cross-sections,
    and wall thickness from STL meshes using trimesh.

    Args:
        stl_path: Absolute path to the STL file.
        measurements: Which profiles to run. Options: "basics", "thickness",
            "cross_sections". Default: ["basics"].
        cross_section_axis: Axis for cross-sections: "x", "y", "z", or "all".
            Default: "all".
        cross_section_heights: Explicit heights in mm for cross-sections.
            Default: auto-slice at 25%, 50%, 75%.
        thickness_method: Thickness estimation method: "ray" (default, fast).

    Returns:
        Dict with file name plus requested measurement profiles.
    """
    if measurements is None:
        measurements = ["basics"]

    # Validate measurements
    valid_profiles = {"basics", "thickness", "cross_sections"}
    invalid = set(measurements) - valid_profiles
    if invalid:
        return _error_response(
            f"Invalid measurement profiles: {invalid}. Valid: {valid_profiles}",
            "INVALID_PARAMETERS",
        )

    # Validate cross-section cap
    if cross_section_heights and len(cross_section_heights) > 30:
        return _error_response(
            f"Too many cross-section heights ({len(cross_section_heights)}). Maximum is 30.",
            "INVALID_PARAMETERS",
        )

    # Load mesh
    try:
        mesh = _load_stl(stl_path)
    except FileNotFoundError:
        return _error_response(f"STL file not found: {stl_path}", "FILE_NOT_FOUND")
    except ValueError as exc:
        return _error_response(str(exc), "INVALID_STL")

    result: Dict[str, Any] = {
        "file": Path(stl_path).name,
    }

    if "basics" in measurements:
        result["basics"] = _compute_basics(mesh)

    if "thickness" in measurements:
        result["thickness"] = _compute_thickness(mesh, method=thickness_method)

    if "cross_sections" in measurements:
        try:
            result["cross_sections"] = _compute_cross_sections(
                mesh,
                axis=cross_section_axis,
                heights=cross_section_heights,
            )
        except ValueError as exc:
            return _error_response(str(exc), "INVALID_PARAMETERS")

    return result


@mcp.tool
async def compare_stl(
    reference_path: str,
    generated_path: str,
) -> Dict[str, Any]:
    """Compare two STL files to quantify dimensional and volumetric differences.

    Primary comparison uses boolean difference via manifold3d when both meshes
    are watertight. Falls back to dimension and volume comparison only when
    either mesh is non-watertight.

    Args:
        reference_path: Absolute path to the reference STL file.
        generated_path: Absolute path to the generated STL file.

    Returns:
        Dict with dimension_comparison, volume_comparison, boolean_difference,
        and topology sections.
    """
    # Load meshes
    try:
        ref_mesh = _load_stl(reference_path)
    except FileNotFoundError:
        return _error_response(f"STL file not found: {reference_path}", "FILE_NOT_FOUND")
    except ValueError as exc:
        return _error_response(str(exc), "INVALID_STL")

    try:
        gen_mesh = _load_stl(generated_path)
    except FileNotFoundError:
        return _error_response(f"STL file not found: {generated_path}", "FILE_NOT_FOUND")
    except ValueError as exc:
        return _error_response(str(exc), "INVALID_STL")

    # Dimension comparison
    ref_dims = (ref_mesh.bounds[1] - ref_mesh.bounds[0]).tolist()
    gen_dims = (gen_mesh.bounds[1] - gen_mesh.bounds[0]).tolist()
    diff_dims = [round(g - r, 3) for r, g in zip(ref_dims, gen_dims)]
    max_dim_error = round(max(abs(d) for d in diff_dims), 3)

    dimension_comparison = {
        "reference_dimensions_mm": [round(v, 3) for v in ref_dims],
        "generated_dimensions_mm": [round(v, 3) for v in gen_dims],
        "difference_mm": diff_dims,
        "max_dimension_error_mm": max_dim_error,
    }

    # Volume comparison
    ref_watertight = bool(ref_mesh.is_watertight)
    gen_watertight = bool(gen_mesh.is_watertight)
    both_watertight = ref_watertight and gen_watertight

    ref_volume = float(ref_mesh.volume) if ref_watertight else None
    gen_volume = float(gen_mesh.volume) if gen_watertight else None

    volume_comparison: Dict[str, Any] = {
        "reference_volume_mm3": round(ref_volume, 3) if ref_volume is not None else None,
        "generated_volume_mm3": round(gen_volume, 3) if gen_volume is not None else None,
    }

    if ref_volume is not None and gen_volume is not None:
        vol_diff = gen_volume - ref_volume
        vol_pct = (vol_diff / ref_volume * 100) if ref_volume != 0 else None
        volume_comparison["difference_mm3"] = round(vol_diff, 3)
        volume_comparison["difference_percent"] = round(vol_pct, 2) if vol_pct is not None else None
    else:
        volume_comparison["difference_mm3"] = None
        volume_comparison["difference_percent"] = None

    # Topology
    topology = {
        "reference_watertight": ref_watertight,
        "generated_watertight": gen_watertight,
        "both_watertight": both_watertight,
    }

    # Boolean difference (only when both watertight)
    boolean_difference = None
    if both_watertight:
        try:
            boolean_difference = _boolean_difference_with_timeout(ref_mesh, gen_mesh, timeout=30)
        except TimeoutError:
            boolean_difference = {
                "warning": "Boolean difference exceeded 30-second timeout. "
                           "Dimension and volume comparison are still available.",
                "method": "manifold3d",
            }
        except Exception as exc:
            boolean_difference = {
                "warning": f"Boolean difference failed: {exc}. "
                           "Dimension and volume comparison are still available.",
                "method": "manifold3d",
            }
    else:
        non_wt = []
        if not ref_watertight:
            non_wt.append("reference")
        if not gen_watertight:
            non_wt.append("generated")
        boolean_difference = {
            "warning": f"Boolean difference unavailable: {', '.join(non_wt)} mesh is not watertight. "
                       "Falling back to dimension and volume comparison only.",
        }

    return {
        "reference": Path(reference_path).name,
        "generated": Path(generated_path).name,
        "dimension_comparison": dimension_comparison,
        "volume_comparison": volume_comparison,
        "boolean_difference": boolean_difference,
        "topology": topology,
    }


def _boolean_difference_with_timeout(
    ref_mesh: trimesh.Trimesh,
    gen_mesh: trimesh.Trimesh,
    timeout: int = 30,
) -> Dict[str, Any]:
    """Compute boolean difference volumes using manifold3d.

    Returns excess_volume (in generated but not reference) and
    missing_volume (in reference but not generated).
    """
    import manifold3d

    start = time.monotonic()

    def _to_manifold(mesh: trimesh.Trimesh) -> "manifold3d.Manifold":
        """Convert trimesh to manifold3d Manifold."""
        m_mesh = manifold3d.Mesh(
            vert_properties=np.array(mesh.vertices, dtype=np.float32),
            tri_verts=np.array(mesh.faces, dtype=np.uint32),
        )
        return manifold3d.Manifold(m_mesh)

    ref_manifold = _to_manifold(ref_mesh)
    gen_manifold = _to_manifold(gen_mesh)

    if time.monotonic() - start > timeout:
        raise TimeoutError("Manifold conversion exceeded timeout")

    # excess = generated - reference (material in generated but not reference)
    excess = gen_manifold - ref_manifold
    try:
        excess_mesh = excess.to_mesh()
        excess_trimesh = trimesh.Trimesh(
            vertices=np.array(excess_mesh.vert_properties[:, :3]),
            faces=np.array(excess_mesh.tri_verts),
        )
        excess_vol = float(excess_trimesh.volume) if excess_trimesh.is_watertight else 0.0
    except Exception:
        excess_vol = 0.0

    if time.monotonic() - start > timeout:
        raise TimeoutError("Boolean difference exceeded timeout")

    # missing = reference - generated (material in reference but not generated)
    missing = ref_manifold - gen_manifold
    try:
        missing_mesh = missing.to_mesh()
        missing_trimesh = trimesh.Trimesh(
            vertices=np.array(missing_mesh.vert_properties[:, :3]),
            faces=np.array(missing_mesh.tri_verts),
        )
        missing_vol = float(missing_trimesh.volume) if missing_trimesh.is_watertight else 0.0
    except Exception:
        missing_vol = 0.0

    return {
        "excess_volume_mm3": round(abs(excess_vol), 3),
        "missing_volume_mm3": round(abs(missing_vol), 3),
        "method": "manifold3d",
    }
