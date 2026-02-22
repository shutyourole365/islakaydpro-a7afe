### Summary

Increase Vite's `build.chunkSizeWarningLimit` to 1000 KB to reduce noisy chunk-size warnings while we optimize manualChunks.

### Changes
- `vite.config.ts`: set `chunkSizeWarningLimit: 1000`
- `CHANGELOG.md`: added entry

### Testing
- Local `npm run build` should no longer warn about typical chunk sizes.

### Notes
If you'd prefer a different limit, suggest the KB value and I'll update the PR.
