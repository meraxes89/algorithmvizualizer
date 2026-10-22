# Releasing

This is the maintainer checklist for cutting a release. The project uses semantic version tags and GitHub Releases. It does not use Changesets: at this size, a version bump, a tag and generated release notes are enough.

The repository version lives in `package.json`. A release tag must match that version with a leading `v`, for example `v1.2.0`.

## Before the first release

PR #2 is the first candidate for a tagged release once it is merged. At the time of writing, no release tag exists yet.

Do not tag a feature branch or an unmerged commit. A release starts from `main`, after the checks workflow has passed for the exact commit being tagged.

## Release checklist

1. **Choose the version.** Use semantic versioning:
   - `patch` for fixes that do not change behaviour or add features;
   - `minor` for backwards-compatible features;
   - `major` for an intentional breaking change to a public surface.
2. **Update the version if needed.** Set `VERSION` to the target release. If `package.json` already contains that version, skip this step and keep the same value for the tag commands below. Otherwise run:
   ```bash
   VERSION=1.0.0
   git switch main
   git pull --ff-only github main
   pnpm version "$VERSION" --no-git-tag-version
   git add package.json
   git commit -m "chore(release): $VERSION"
   ```
3. **Verify the exact commit.**
   ```bash
   pnpm install --frozen-lockfile
   pnpm lint
   pnpm typecheck
   pnpm test:coverage
   GITHUB_PAGES=true pnpm build
   pnpm size
   ```
   CI must also be green for this commit. Do not tag a local commit that CI has not seen.
4. **Create an annotated tag.**
   ```bash
   git tag -a "v$VERSION" -m "Algorithm Visualizer v$VERSION"
   ```
5. **Push the commit and the tag to GitHub only.**
   ```bash
   git push github main
   git push github "v$VERSION"
   ```
   Tags and releases are cut on GitHub. Do not push release tags to the GitLab mirror.
6. **Create the GitHub Release.**
   ```bash
   gh release create "v$VERSION" --verify-tag --generate-notes --title "Algorithm Visualizer v$VERSION"
   ```
   The generated notes use merged pull requests and commit history. Edit the release body if a user-facing change needs more context. If `gh` is not authenticated, create the release from the GitHub UI after pushing the tag.
7. **Re-sync the mirror commit, not the tag.**
   ```bash
   git push origin main:refs/heads/main
   ```
   GitLab is a read-only mirror. Release tags stay on GitHub.

## Release notes

A useful release note answers three questions:

- What can a user do now that they could not do before?
- What changed for contributors or deployers?
- What should someone upgrade carefully?

Use the generated notes as a starting point, then add a short summary at the top. Link to the relevant ADR when a structural decision affects behaviour.

## If something goes wrong

- **The tag points at the wrong commit and nothing was published.** Delete the tag locally and on GitHub, fix the commit, and tag again.
- **The release is already published.** Do not move or reuse the tag. Cut a new patch release with the fix. Published tags are immutable.
- **A dependency update breaks the build.** Revert the dependency PR, keep the release branch green, and open a focused follow-up. Dependabot will keep the update available.

## Related documents

- [ADR 0004: pnpm](adr/0004-pnpm.md) for the toolchain and lockfile policy
- [Contributing](CONTRIBUTING.md) for the general verification matrix
- [Architecture](ARCHITECTURE.md) for the release and deploy shape
- [`.github/dependabot.yml`](../.github/dependabot.yml) for the dependency update schedule
