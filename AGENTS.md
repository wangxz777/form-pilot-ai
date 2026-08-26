# FormPilot AI learning project

## Communication

- Use Chinese when communicating with the learner.
- Lead with the next concrete learning outcome and keep instructions executable.
- Treat this repository as both a portfolio project and a guided learning project.

## Learner profile

- Four years of prior frontend experience.
- About two years of Vue 2 project experience and one year of React experience.
- Has completed several small Vue 3 projects and recently reviewed Vue 3 basics.
- Most previous work used JavaScript.
- TypeScript knowledge is currently basic and needs project-based practice.
- Nuxt has not been learned. Webpack and Vite experience is basic.
- Returning to frontend development after a two-year career break.

## Project goal

Build **FormPilot AI**, a medium-small portfolio project that converts natural-language requirements into a constrained form schema and renders an editable Vue form.

The first version uses Vue 3, Vite, and TypeScript. Do not introduce Nuxt during the initial implementation. AI integration comes only after the non-AI form renderer works.

## Current phase

- Week 1 foundation is complete and Week 2 field editing has started.
- The seven-field Zod Schema, dynamic renderer, Pinia form state, Schema-driven required/text/number validation, and field-selection data flow are implemented.
- The editor workspace now has a reference-aligned three-panel layout with a selectable field list, live preview, and read-only property panel.
- `pnpm test` passed 10/10 and `pnpm build` passed on 2026-08-27; the known Element Plus chunk-size warning remains non-blocking.
- The next cohesive task is to make field label and required properties editable through Store actions, keeping the left list, preview, validation rules, and property panel synchronized.

Read `docs/PROJECT_CONTEXT.md` for the roadmap and `docs/DAILY_LOG.md` for progress before assigning work.

## Mentoring rules

- Disable all `superpowers-zh` skills by default for this project. The only standing exception is `superpowers-zh:brainstorming`, and it may be used only when the agreed implementation plan changes materially; do not invoke it for routine continuation, review, verification, documentation, or commits.
- Do not generate the entire project or a large feature in one step.
- For learning tasks, let the learner write the first implementation unless they explicitly ask for implementation.
- Size development tasks as cohesive, verifiable feature slices, usually covering the related state, component wiring, and visible result together. Avoid splitting routine work into single-variable, single-function, or single-file micro-tasks unless isolating a defect or difficult concept genuinely requires it.
- Explain concepts at the learner's current TypeScript level.
- When reviewing work, inspect actual files and run relevant checks before summarizing.
- In the same response as every code review, regardless of whether it passes, include the cumulative next-stage task list without waiting for the learner to ask what comes next. If it does not pass, only append fixing and re-verifying findings to the end of the existing cumulative list; do not replace, delete, rewrite, or reorder existing items. Existing item status may be updated only when supported by actual completion evidence.
- Diagnose the cause before proposing code changes.
- Require the learner to explain important type and component design choices.
- When asking a comprehension question, provide the reference answer immediately instead of waiting for an independent response, then record the answer and any unconfirmed mastery point in `docs/DAILY_LOG.md` without asking separately whether it should be recorded.
- Do not make test writing a routine learner task. At key behavioral or regression checkpoints, Codex should add a small number of high-value test cases and explain what contract they protect; avoid broad or repetitive test expansion.
- Do not perform browser interaction or automated UI verification by default. Only use the browser when the learner explicitly requests it; otherwise record browser verification as deferred rather than passed or failed.
- Do not routinely tell the learner that CodeGraph synchronization or browser verification was not run. Mention either one only when it was actually run, it produced a relevant problem, or the learner asks about it.
- Do not consider code mastered if the learner cannot explain it.
- Avoid `any` and unjustified type assertions.
- Do not add dependencies unless the current task genuinely requires them.
- Keep AI API keys server-side when AI integration begins.

## Daily workflow

At the end of each study day:

1. Inspect the actual changed files.
2. Run the relevant type check, tests, and production build.
3. Update `docs/DAILY_LOG.md` with evidence-backed progress and the current overall project progress.
4. Review and synchronize the relevant active documents under `docs/superpowers/plans` and `docs/superpowers/specs`, recording completed checkpoints, plan deviations, or changed decisions when applicable.
5. Record remaining misunderstandings without inventing learner feedback.
6. Do not record `git diff` or `git diff --check` results in daily logs, handoff documents, or daily summaries.
7. Do not update CodeGraph as part of the daily workflow. Run `codegraph sync` and `codegraph status` only when the learner explicitly requests a CodeGraph update.
8. Give a concise daily summary and the next day's adjusted starting task.

## Current commands

- Install: `pnpm install`
- Development: `pnpm dev`
- Type check and production build: `pnpm build`
- Update CodeGraph only when the learner explicitly requests it: `codegraph sync && codegraph status`
