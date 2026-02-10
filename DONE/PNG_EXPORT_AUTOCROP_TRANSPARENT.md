# PNG Export: Auto-Crop & Transparent Background

**Status:** DONE
**Date:** 2026-02-10

## Summary

Added auto-crop and transparent background support to PNG exports.

## Changes

### `src/lib/engine/exporter.ts`
- Added `PngExportOptions` interface with `transparentBg` flag
- Added `cropToContent()` helper that auto-crops PNG to content bounding box
  - Opaque mode: detects background pixels by color match (with 2px tolerance)
  - Transparent mode: detects content by alpha > 0
  - Adds 4px padding around detected content
- Updated `downloadPng()` and `copyImage()` to accept options and auto-crop

### `src/lib/components/ExportBar.svelte`
- Added `transparentBg` state with checkbox toggle
- Passes `{ transparentBg }` to `downloadPng()` and `copyImage()`

### `src/lib/components/FloatingExportBar.svelte`
- Added `transparentBg` state with checkerboard icon toggle button
- Active state highlighted with `text-doom-green border-doom-green`
- Passes `{ transparentBg }` to `downloadPng()` and `copyImage()`

## Verification
- `npx svelte-check`: 0 errors
- `npm run build`: success
- `TOOLS/full_test_cycle.sh`: all tests passed
