# Changelog

Notable changes to AI Blueprint are documented here. Release dates reflect the
published `create-ai-blueprint` package.

## Unreleased

## [1.4.0] - 2026-09-01

### Added

- Added `/doctor` context-size diagnostics for Claude imports and skill
  descriptions, plus a reproducible benchmark and two before-and-after charts.

### Changed

- Reduced Claude Code startup context by auto-importing only the core project
  instructions, overview, and active spec. Coding standards and interaction
  rules now load when relevant.
- Shortened all skill descriptions while preserving distinct routing terms and
  added a regression budget to prevent description bloat.
- Changed new-project defaults to one feature-level implementation review packet
  with step checkpoint commits disabled. Existing user-owned configuration is
  preserved during updates. Per-step approval remains available with
  `stepReview: "every"`; matching the previous checkpoint experience also
  requires `checkpointCommits: "enabled"`.
- Added Efficient, Guided, and Custom onboarding choices that write those two
  existing settings without introducing another persistent workflow mode.

## [1.3.0] - 2026-09-01

### Added

- Added a first-run `/overview` handoff that offers a reviewed local commit for
  Blueprint setup and planning before Feature 1, while skipping local-only
  installations and refusing to mix unrelated work into the baseline.

## [1.2.0] - 2026-08-31

### Added

- Added `/audit independent current` as a two-session review workflow with
  detected adapter and model selection, checkpoint-bound handoff records,
  durable reviewer receipts, staleness detection, completion blocking, and
  archived review evidence.
- Added `independentReview` policies to regular and Continuous quality gates,
  defaulting to `manual` alongside the existing gates.

## [1.1.0] - 2026-08-28

### Added

- Added the optional `/browser-tests` and `$browser-tests` setup skill for
  creating or normalizing a repository-owned browser harness that Feature,
  Implement, Check, and Continuous Mode can reuse.

## [1.0.1] - 2026-08-26

### Changed

- Reworked the npm package README to lead with Blueprint's product purpose and
  core feature loop, with specialized capabilities such as release readiness
  documented later.

## [1.0.0] - 2026-08-26

AI Blueprint 1.0 establishes the installer, shared workflow, project
configuration, and local status dashboard as the stable public baseline.

### Changed

- Redesigned the local dashboard around the next action, current work, roadmap,
  project state, findings, completion readiness, and completed history.
- Required `/rollback` to record full 40-character commit and parent SHA values
  for single-parent targets, and to stop before writing a spec when the target
  is a merge commit.
- Required `/implement` to validate both recorded SHAs, confirm a single parent,
  confirm the target is an ancestor of `HEAD`, and require a clean tree before
  reverse-applying a rollback patch.
- Stopped `/complete` from archiving or removing a `fixed` finding at any
  severity, so repaired findings remain in the ledger for a later `/audit`
  re-review.

### Added

- Added live command activity to the dashboard and status output, including the
  active command, mode, gates, progress, resume command, and recovery state.
- Added immediate dashboard refreshes when Blueprint or project files change.
- Added `npm run link:local` and `npm run unlink:local` for building, preparing,
  and globally linking the installer from a local checkout, so `create-ai-blueprint`
  and `blueprint` run from local files with no network access.

### Fixed

- Pinned the canonical `current-feature.md` and `findings.md` stubs so
  `/complete` can no longer reset them to paraphrased content.
- Fixed installer package root resolution so a source checkout finds its own
  `template/` directory. The documented local testing path failed because the
  installer looked one directory above the package.
- Reported the Blueprint config path as `blueprint/config.json` in warnings and
  status output on every platform, instead of leaking the Windows separator.

## [0.14.0] - 2026-08-25

### Added

- Added deterministic project configuration for review cadence, checkpoint
  commits, branch prefixes, verification strictness, regular and Continuous
  quality gates, and Continuous Mode limits.
- Added the explicit `/continuous` and `$continuous` workflow for completing
  remaining planned features serially with local branches, verification,
  archives, and one local main commit per feature without pushing.

### Fixed

- Made onboarding adapter choices name Codex, Claude Code, GitHub Copilot, and
  OpenCode accurately when recommending which shared skill trees to keep.

## [0.13.0] - 2026-08-23

### Added

- Added OpenCode support and a checkbox-based installer that can select multiple
  adapters. OpenCode reuses compatible skill files instead of installing a
  duplicate `.opencode/skills/` tree.
- Added a Blueprint visibility choice to `/adopt` so brownfield projects can
  commit workflow files or keep them local, contributed by
  [@sushantrahate](https://github.com/sushantrahate).

## [0.12.1] - 2026-08-21

### Fixed

- Kept optional CLI details subordinate to fresh-project onboarding and made
  `onboard` the final installation next step.
- Stopped installing the public repository README inside consumer projects and
  removed unchanged legacy copies during updates.

## [0.12.0] - 2026-08-21

### Changed

- Renamed the canonical live dashboard command to `blueprint dashboard` and
  kept `blueprint ui` as a deprecated compatibility alias.
- Clarified that the optional global `blueprint` CLI only provides shorter
  commands and that status and dashboard remain available through npx.

## [0.11.1] - 2026-08-21

### Changed

- Clarified dashboard health, Git, findings, connection, and active build-plan
  labels, balanced the top layout with a compact project and Git status stack,
  moved actionable state ahead of completed history, improved muted-text contrast
  and progress semantics, and removed the misleading initial progress animation.

## [0.11.0] - 2026-08-21

### Added

- Added `blueprint ui`, an on-demand read-only dashboard that binds to
  `127.0.0.1`, displays the build-plan roadmap, active work, completed history,
  findings, Git state, and next action, refreshes every second, and stops with
  the CLI process.
- Added the optional global CLI prompt to interactive Blueprint updates so
  existing users can install or refresh `blueprint ui` with the npx package
  version they just used. Matching installed versions skip the prompt.

## [0.10.0] - 2026-08-21

### Added

- Added GitHub Copilot support through the shared `AGENTS.md` and `.agents/skills/`
  adapter files.

### Changed

- Added `--all` as the default installer mode. Kept `--both` as a deprecated
  alias for `--all`.

## [0.9.1] - 2026-08-20

### Changed

- Limited the optional global `blueprint` command to read-only project status.
  Installation and updates remain under `npx create-ai-blueprint@latest`.

## [0.9.0] - 2026-08-20

### Added

- Added read-only `status` and `status --json` commands with project discovery,
  workflow progress, findings blockers, Git state, drift warnings, completion
  readiness, and deterministic next-action reporting.
- Added the `blueprint` installed binary as a shorter alias for the existing
  `create-ai-blueprint` package command.
- Added an opt-in post-install prompt for installing the exact package version
  globally so the shorter `blueprint` command is available.

## [0.8.0] - 2026-08-19

### Changed

- Migrated the installer, validation scripts, evaluations, and tests from
  JavaScript to strictly checked TypeScript with compiled ESM package output.
- Raised the supported Node.js version from 18 to 22 and added Node.js 22 and
  24 validation coverage.

## [0.7.0] - 2026-08-17

### Added

- Added repository licenses, security and support policies, issue forms, a pull
  request template, branded assets, and a custom social preview.
- Added generated GitHub Releases after successful tagged npm publications.
- Added deterministic routing evaluations for all Blueprint skills and
  opt-in live-agent scenarios for high-risk workflow boundaries.
- Added the read-only `/debug` and `$debug` workflow for reproducing failures,
  isolating root causes, and handing confirmed repairs to `/fix` or `/implement`.
- Added focused `quality`, `security`, `performance`, and `tests` lenses to
  `/audit` and `$audit`, independently selectable from the audit scope.
- Added the optional `/discovery` and `$discovery` workflow for developing
  detailed project plans through a deep, adaptive conversation, with full draft
  review and explicit approval before either user-owned plan is written.

### Changed

- Reworked the repository and npm README presentation around faster setup,
  clearer tool support, package badges, and contribution links.
- Expanded npm metadata and repository validation for the public trust surface.
- Added routing evaluations to the automatic repository gate while keeping all
  maintainer evaluation files out of the published package.
- Clarified that users may write plans directly or develop them through any AI
  conversation, and that `/discovery` never changes the existing manual path or
  becomes a prerequisite for `/overview`.

## [0.6.0] - 2026-07-26

### Added

- Added the explicit `/ci` and `$ci` workflow for defining one stack-aware
  Verify command and aligning GitHub verification with checks a project already
  has.

### Changed

- Updated onboarding, adoption, implementation, testing, completion, doctor,
  and autopilot guidance to reuse Verify without forcing CI or tests.
- Expanded repository validation to cover the new CI workflow and adapter
  contracts.

## [0.5.2] - 2026-07-23

### Added

- Added tag-triggered npm trusted publishing with package validation before
  release.

### Changed

- Surfaced the findings gate in the README introduction.

## [0.5.1] - 2026-07-23

### Added

- Added a live-agent end-to-end harness for the findings-ledger merge gate.

### Changed

- Required explicit risk acknowledgement before live-agent end-to-end runs.
- Tightened the canonical findings-ledger stub and invalidation evidence.

## [0.5.0] - 2026-07-22

### Added

- Added the durable findings ledger with stable IDs, severity, status, and
  resolution history.
- Made open or fixed P0 and P1 findings block `/complete` until they are closed,
  explicitly accepted, or invalidated with evidence.

## [0.4.0] - 2026-07-19

### Changed

- Moved installer state, backups, and manifest data from the project root to
  `blueprint/.state/`.
- Expanded package smoke tests to prove the new state path and the absence of
  the legacy root directory.

## [0.3.0] - 2026-07-19

### Added

- Added safe managed-file updates with conflict detection, dry runs, backups,
  and adapter-aware manifests.
- Added the reviewed rollback workflow for completed features.
- Added the repository validation gate and support for ongoing feature planning.

## [0.1.0] - 2026-07-07

### Added

- Published the initial `create-ai-blueprint` installer.
- Added Codex and Claude Code adapters for the file-backed planning, feature,
  implementation, checking, audit, and completion workflow.

[0.12.1]: https://github.com/aiblueprinthq/ai-blueprint/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/aiblueprinthq/ai-blueprint/compare/v0.11.1...v0.12.0
[0.11.1]: https://github.com/aiblueprinthq/ai-blueprint/compare/v0.11.0...v0.11.1
[0.11.0]: https://github.com/aiblueprinthq/ai-blueprint/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/aiblueprinthq/ai-blueprint/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/aiblueprinthq/ai-blueprint/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/aiblueprinthq/ai-blueprint/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/aiblueprinthq/ai-blueprint/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/aiblueprinthq/ai-blueprint/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/aiblueprinthq/ai-blueprint/compare/v0.5.2...v0.6.0
[0.5.2]: https://github.com/aiblueprinthq/ai-blueprint/commits/v0.5.2
[0.5.1]: https://www.npmjs.com/package/create-ai-blueprint/v/0.5.1
[0.5.0]: https://www.npmjs.com/package/create-ai-blueprint/v/0.5.0
[0.4.0]: https://www.npmjs.com/package/create-ai-blueprint/v/0.4.0
[0.3.0]: https://www.npmjs.com/package/create-ai-blueprint/v/0.3.0
[0.1.0]: https://www.npmjs.com/package/create-ai-blueprint/v/0.1.0
