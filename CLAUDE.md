# AI Assistant Context

This file defines the context and operating rules for AI agents working in this repository.

## Ground Rules

### General
- **Commits**: Follow [Conventional Commits](file:///.agent/workflows/commit-conventions.md) (v1.0.0).
- **Deployment**: Use [Graphite CLI (gt)](file:///.agent/workflows/graphite-usage.md) for stacked PRs.
- **Documentation Sync**: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, and `WARP.md` MUST be kept strictly in sync. Core guidelines and best practices MUST be identical across all files, while agent-specific instructions (e.g., for commands) should be handled in their respective files.
- **Project Structure**: Do NOT add new root-level uppercase `.md` files. Root-level uppercase `.md` files are strictly reserved for AI Assistant Context (AGENTS, CLAUDE, GEMINI, WARP).

### JavaScript / TypeScript
- **Dependency Management**: Use `npm`.

### Commands
- **Execution**: When a user provides a keyword command (e.g., `deploy`), follow the corresponding command definition in `.agent/commands/`.

---

## AI Coding Best Practices

### General Principles
- **Readability**: Produce human-readable code.
    - Small Functions: Aim for functions <= 20 lines.
    - Intuitive naming.
- **Isolate Side-Effects**: Confine I/O to specific boundary functions.
- **Testing**: Mandatory [TDD Workflow](file:///.agent/workflows/tdd-workflow.md).
- **Parallel Development**: Use [Nested Worktrees](file:///.agent/workflows/parallel-development.md) in `.worktrees/`.
- **Architecture**: The Backend is the source of truth for all state mutations. Frontend refetches state.

### JavaScript / TypeScript Guidelines
- **Naming**:
  - Files/Folders: `kebab-case`.
  - Classes/Types/Interfaces: `PascalCase`.
  - Functions/Variables: `camelCase`.
- **Organization**:
  - Components: React components in `components/`.
  - Hooks: Custom hooks in `hooks/`.
  - Types: Global types in `types/`.

