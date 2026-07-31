# Rant: Skeuomorphism — photorealistic physical-product-as-UI

## Verbatim

> [The Casio calculator rendering] — the actual one is meant to be used in person. Next to a notebook. Where you're holding it up, typing, and getting results. It does not exist in a locked space, with a background, etc. It's comically stupid to take that object and turn it into the basis for a digital calculator.

## What the rant is actually about

Skeuomorphism as a category isn't refused; skeuomorphism-as-default is. The specific failure: when an LLM is asked to design an app for a function that has a physical counterpart, the reflex is to produce a photorealistic rendering of the physical counterpart and call it the UI. This is copying, not designing.

The argument underneath has two layers:

1. **Functional incoherence**: the physical object was designed for its physical context. A Casio calculator is held in the hand, looked down at, used next to a notebook, pressed with fingers. None of that is true for a digital calculator, which floats in a screen viewport alongside other windows, is clicked with a mouse or tapped on a touchscreen, and is used in an entirely different posture. Copying the form copies the wrong context.

2. **Category error**: the LLM confused "looks like a thing" with "designing for the thing's function." Photorealistic calculator ≠ designing a calculator. It's tracing a physical object. The function — quick arithmetic on-screen — has nothing to do with LCD screens, plastic buttons, or 1980s industrial design. The function is "calculate, show result, move on." Everything else is ornament.

## The category of refused moves

Photorealistic / high-fidelity skeuomorphism of:

- **Physical calculators** (Casio, TI, HP — any of them)
- **Paper notebooks** (lined pages, spiral binding, leather covers, pen-on-paper textures)
- **Physical cameras** (lens dials, viewfinders, film-roll indicators)
- **Vinyl records / turntables** (for music apps)
- **Piano keyboards** (realistic keys for music apps that aren't literally piano-teaching)
- **Physical dials / knobs / sliders** (for control UI)
- **Radio chassis** (for audio apps)
- **Physical notebooks / index cards** (for note apps)
- **Typewriters** (for writing apps)
- **Film cameras with rolls visible** (for photo apps)

Any of these as the central UI metaphor is refused unless the project's aesthetic.md explicitly claims skeuomorphic-nostalgia as a deliberate design position (rare and usually better executed by real designers, not LLMs).

## Detection — heuristic, not regex

| Signal | Detection |
|---|---|
| LCD-style display fonts on non-retro interfaces | Font families: `DSEG`, `Digital-7`, `Seven Segment`, `Orbitron` (when used as display font, not accent); catches the "calculator/scoreboard" retro digit look |
| Photorealistic product-photography embedded as UI | `<img>` of a rendered physical device serving as the primary interaction surface (not as a marketing asset) |
| CSS-stacked fake 3D physical device | Multiple layered `box-shadow` (5+ shadow values) + `linear-gradient` + `border` + `border-radius` on a container, with nested elements positioned like physical buttons; signature of someone simulating a physical device |
| Floating device in viewport | A single calculator/camera/radio-shaped UI positioned centered in a viewport with solid background (gradient or otherwise), no other functional UI present — the device presented as an object on display rather than as a tool in use |
| Green-on-black LCD / amber-on-black rectangles | Small display-area rectangles with green (`#00ff00` or `#4cff00` family) or amber (`#ffbf00`) text on pure black backgrounds, styled to mimic LCD displays |

## The "what the object actually does" test

When the LLM is about to reach for a physical-product metaphor, it should stop and answer:

1. What is the physical object designed FOR? (The Casio calculator: in-hand arithmetic next to a notebook.)
2. What is the DIGITAL equivalent designed FOR? (A digital calculator: on-screen arithmetic while other windows are visible, click or keyboard input, result stays available.)
3. Are these the same? (No. The physical calculator is a portable single-purpose tool. The digital calculator is a lightweight utility in a multi-window environment.)
4. What form does the DIGITAL context want? (A minimal on-screen keypad, results visible, keyboard-first input, probably small and positioned conveniently — nothing about this requires rubber buttons or an LCD display.)

If the digital context's form requirements don't match the physical object's form, refuse the skeuomorphism. If they genuinely do match (rare — example: an emulator app intentionally recreating a physical device), allow it but with high standards.

## When skeuomorphism is OK

Explicit nostalgia projects. Emulators. Deliberate retro-aesthetic products (a 1980s-style calculator app as a concept piece). Education tools where the physical-object reference is the learning point. In all these cases, skeuomorphism is the thesis, not the default.

The refusal is categorically of skeuomorphism-as-lazy-default, not skeuomorphism as a considered move.

## Companion principle (voice-anchor candidate)

> "It's comically stupid to take that object and turn it into the basis for a digital calculator."

Generalizes to: **copy the function, not the form.** The form a physical object took was driven by its physical constraints. Those constraints don't travel to the screen. Designing for the screen means asking what the function looks like in THIS context, not what the object looked like in the previous context.
