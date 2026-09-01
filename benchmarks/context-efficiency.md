# Context Efficiency Benchmark

AI Blueprint 1.3.0 was tested against AI Blueprint 1.4.0 on 2026-09-01. The
benchmark measures startup context and one small three-step feature
implementation in Claude Code.

![Fresh-session startup context](../assets/context-startup-tokens.svg)

![Three-step feature implementation](../assets/context-feature-loop-tokens.svg)

## Results

| Measurement | Blueprint 1.3.0 | Blueprint 1.4.0 | Savings |
| --- | ---: | ---: | ---: |
| Fresh-session startup input | 52,135 | 45,198 | 6,937 (13.3%) |
| Implementation cumulative input | 1,624,621 | 1,449,599 | 175,022 (10.8%) |
| Final implementation context | 74,805 | 67,256 | 7,549 (10.1%) |
| CLI estimated list cost | $0.7403 | $0.4871 | $0.2532 (34.2%) |

The same Claude Code setup without Blueprint started at 44,148 tokens. This was
the maintainer's configured environment, not a clean installation or a general
Claude Code baseline. The Blueprint 1.4.0 fixture was 1,050 tokens above that
same-environment comparison.

Claude Code's `/context all` estimate attributed the 44,148 tokens to a 9.4k
system prompt, 21k active system tools, 557 tokens of custom agents, 3.1k of
memory files, 7.8k of skills, and 2.3k of messages. About 5k of the skill tokens
came from maintainer-installed skills and 2.7k from built-in skills. Deferred
system tools were listed separately and were not part of the 44,148-token live
total.

## What changed

| Change | Blueprint 1.3.0 | Blueprint 1.4.0 |
| --- | --- | --- |
| Claude auto-imports | AGENTS, overview, coding standards, interaction rules, active spec | AGENTS, overview, active spec |
| Skill descriptions | 1,920 words | 847 words with routing terms preserved |
| Implementation review | Approval after every step | One feature-level review packet |
| Step checkpoints | Enabled | Disabled |
| Context diagnosis | Manual investigation | `/doctor` reports import and description size, then points to `/context all` |

`coding-standards.md` and `ai-interaction.md` remain in every project. Project
instructions and workflow skills read them when the task needs them instead of
carrying both files through every turn.

Per-step review and checkpoint commits remain available through
`blueprint/config.json`. They are useful for teaching, close pairing, and
high-risk changes, but feature-level review is the lower-context default for new
projects. Setting only `stepReview` to `every` restores per-step approval pauses.
Matching the previous workflow, including optional checkpoint prompts after an
approved step, requires `stepReview: "every"` and
`checkpointCommits: "enabled"` together.

## Method

- Claude Code 2.1.252
- `claude-sonnet-5`, medium effort, 1,000,000-token context window
- Chrome disabled and an empty strict MCP configuration
- Same machine and global Claude configuration for every fixture, including the
  maintainer's installed skills, memory files, and custom agents
- Minimal Node task-tracker app, demo plans, and Claude-only adapter
- `/onboard`, `/overview`, `/feature 1`, and `/implement`
- No dev server or browser check
- Fresh sessions for onboarding, overview, and feature planning
- Blueprint 1.3.0 resumed the same implementation session after each of three
  step reviews; the 1.4.0 run used one feature-level review handoff

Input totals are the CLI's reported `input_tokens`,
`cache_creation_input_tokens`, and `cache_read_input_tokens`. Estimated cost is
the CLI's list-cost estimate, not a prediction of Claude subscription quota use.

## Limits

This is one controlled fixture, not a universal savings guarantee or a measure
of a clean Claude Code installation. The 44,148-token no-Blueprint result is
specific to the maintainer's global Claude configuration. Tool output, project
size, global skills, plugins, model behavior, and the work itself can change
both context growth and cost. The same environment across all fixtures makes
the Blueprint 1.3.0 versus 1.4.0 comparison useful, but the generated specs and
implementations were not byte-for-byte identical.
