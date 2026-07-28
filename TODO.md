# TODO

- [x] Patch protected-route wrapper (`apps/web/src/lib/api/route-wrapper.ts`) to prevent module-level dependency failures from breaking route registration (no more 404).
- [ ] Restart Next dev server and verify `GET /api/industry-agriculture/seasonal-labor/workers` returns 401/403/200 (never 404).
- [ ] Reload the Seasonal Labor page to confirm workers load.
