## Summary

Explain the problem, the approach, and anything a reviewer should look at first.

## Verification

- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm test:coverage`
- [ ] `pnpm build`
- [ ] `pnpm size`
- [ ] `pnpm e2e` for UI, route, keyboard or accessibility changes

## Checklist

- [ ] The change is focused and the pull request explains the trade-offs.
- [ ] New behaviour has tests, including edge cases.
- [ ] New routes or overlays are included in the Playwright scan.
- [ ] No new plain `.js` or `.jsx` source file was added under `src/`.
- [ ] No raw hex colour was added outside `src/theme/`.
- [ ] The Step Trace Contract and architecture docs are updated if a shared shape changed.
- [ ] An ADR was added or updated for a structural decision.
- [ ] A screenshot or recording is included for a visible change.
