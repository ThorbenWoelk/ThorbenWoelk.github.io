# AI Assistant Context

This file defines the context and operating rules for AI agents working in this repository.

**Purpose**: `ai-frameworks-arena` serves as the central hub for **best practice files** and **workflows**. It is responsible for syncing these standards to all other repositories in `/Users/thorben.woelk/repos/`. Additionally, it hosts a **Dashboard App** to inspect the status and health of those repositories.

## Ground Rules

### 0. General rules
- **Readability**: Small functions (<= 20 lines), intuitive naming.
- **Side-Effects**: Isolate I/O to boundaries.
- **Verification**: NEVER mark a task as done without verifying.
    - **Rust**: Always run `cargo check`.
    - **Frontend**: Check for hydration/runtime errors. Manually verify the feature or run Playwright.
- **Deployment**: Use [Graphite CLI (gt)](file:///.agent/workflows/graphite-usage.md) for stacked PRs.
- **Testing**: Mandatory [TDD Workflow](file:///.agent/workflows/tdd-workflow.md).
- **Parallel Development**: Use [Nested Worktrees](file:///.agent/workflows/parallel-development.md) in `.worktrees/`.

### 1. Version Control & Deployment (Graphite)
**CRITICAL RULE**: ALWAYS use `gt` (Graphite). NEVER use `git` or `gh` CLI commands directly for branching, committing, or pushing.

**Workflow: Trunk-Based Stacking**
1.  **Sync**: `gt sync --no-interactive` (Pull trunk, clean up merged branches, restack)
2.  **Make changes** to the repo.
3.  **Commit/Branch**: `gt create -a -m "type(scope): message" --no-interactive` (Stages all, creates branch, commits)
    - Follow [Conventional Commits](file:///.agent/workflows/commit-conventions.md).
4.  **Submit**: `gt ss -p --no-interactive` (Submit branches to stack and publish PR)
5.  **Iterate**:
    - Make changes.
    - Amend: `gt modify -a --no-interactive` (Stage and amend to current branch)
    - Submit: `gt ss -p --no-interactive`
6.  **Merge**: `gt stack merge --no-interactive` (Merge PR)

**Golden Rules**:
- **NEVER** use `git` commands for workflow operations.
- **ALWAYS** use `--no-interactive` to prevent hangs.
- Break large features into small, dependent stacks.

### 2. General Project Rules
- **Documentation Sync**: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `WARP.md` MUST be kept strictly in sync. Core guidelines and best practices MUST be identical across all files, while agent-specific instructions (e.g., for commands) should be handled in their respective files.
- **Project Structure**: Do NOT add new root-level uppercase `.md` files. Reserved for Context files only.
- **Startup**: Entry point MUST be `start_app.sh` in the root.
    - It MUST kill any existing processes on the ports it intends to use before starting.
    - It MUST ensure no orphan processes are left behind on termination (use `trap` and process groups).
- **Tracking**: `TODO.md` is the EXCLUSIVE source of truth for tracking. Do NOT create `task.md` in repo root.
- **Command Execution**: Follow definitions in `.agent/commands/` for keyword commands (e.g., `deploy`).
- **Repo Creation**: To create a new repository, ALWAYS use the [Create Repo Workflow](file:///.agent/workflows/create-repo.md). NEVER create a folder manually.
- **Workflow**: `cargo run --manifest-path backend/repo-creator/Cargo.toml -- <name> "<description>"`

### 3. Language Standards

#### Python
- **Manager**: `uv`
- **Linting**: `ruff`
- **Guidelines**: PEP 8, snake_case modules/funcs, PascalCase classes. Minimal `app.py`, logic in `services/`.

#### JavaScript / TypeScript (Web)
- **Manager**: `bun` (prefer over `npm`)
- **Stack**: Svelte + Vite, `shadcn-svelte`, `tailwindcss`.
- **Guidelines**: `kebab-case` files, `PascalCase` components/types, `camelCase` funcs.
- **Best Practices**:
  - Leave no form unfilled. Use structured outputs and whatever context you have on the user to do a best-effort pre-fill.
  - **Keyboard Shortcuts**: Where suitable, set up intuitive keyboard shortcuts to navigate and control the UI. Added a subtle keyboard map registry in the upper right corner.

#### Rust
- **Manager**: `cargo`
- **Linting**: `cargo fmt`, `cargo clippy`
- **Guidelines**: `snake_case` crates/mods, `PascalCase` types. Minimal `main.rs`, logic in `lib.rs`. Use `anyhow`/`thiserror`.
- **Architecture**: Prefer Dependency Injection (DI) over global/thread-local state for configuration to ensure safe concurrency.

