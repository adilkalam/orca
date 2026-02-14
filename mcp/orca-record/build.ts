/**
 * Build script for orca-record CLI.
 * Compiles TypeScript source into a single self-contained binary via Bun.
 */
import { $ } from "bun";

console.log("Building orca-record...");
await $`bun build --compile src/index.ts --outfile dist/orca-record`;
console.log("Build complete: dist/orca-record");
