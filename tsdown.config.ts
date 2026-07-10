import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'], // dist/index.mjs (ESM) + dist/index.cjs (CJS)
	dts: false, // declarations emitted via `tsc --emitDeclarationOnly`
	clean: true,
	platform: 'node',
	sourcemap: false,
	outputOptions: { exports: 'named' }, // mixed default+named exports; CJS namespace like the old tsc build
});
