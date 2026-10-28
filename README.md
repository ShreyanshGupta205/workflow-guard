# workflow-guard

A Failproof AI security policy pack providing automated guardrails for CI/CD pipeline integrity against autonomous agent modifications.

## Policy Overview

| Attribute | Details |
| :--- | :--- |
| **Policy Name** | `block-agent-workflow-edits` |
| **Category** | `CI/CD Security` |
| **Default Enabled** | `true` (Active upon pack installation) |
| **Target Tools** | `Write`, `Edit` |
| **Target Event** | `PreToolUse` |

---

## Threat Model & Security Rationale

GitHub Actions workflow files located under `.github/workflows/` define and govern automated CI/CD pipelines, automated testing, releases, and production deployments. Workflows typically have access to elevated repository permissions, runner execution environments, and critical secrets (e.g., `GITHUB_TOKEN`, cloud deployment credentials, container registry tokens, signing keys, and package registry tokens).

Allowing autonomous AI agents to unilaterally create or modify GitHub Actions workflows creates severe security risks:
- **Supply Chain Attacks & Backdoors**: An AI agent compromised by prompt injection or malicious dependencies could inject malicious build steps, deploy unauthorized artifacts, or exfiltrate environment secrets.
- **Permission Escalation**: An agent might silently alter `permissions:` blocks in workflow definitions to acquire write access to repository contents, packages, or id-tokens.
- **Accidental Pipeline Disruption**: Unintended edits to triggers, branch filters, matrix definitions, or environment variables can break critical deployment pipelines.

**Enforcement Boundary**: All modifications to `.github/workflows/` must undergo human maintainer review and manual change control rather than being executed autonomously by an AI agent.

---

## Blocked Behavior

The policy intercepts `PreToolUse` invocations and denies tool execution when:
1. The tool is `Write` or `Edit`.
2. The target `file_path` matches the pattern `(^|\/)\.github\/workflows(\/|$)` (case-insensitive, normalized for Windows `\` and POSIX `/` separators).
3. Relative paths (e.g., `.github/workflows/ci.yml`, `.github\workflows\deploy.yml`), nested paths, and absolute paths (e.g., `/home/user/repo/.github/workflows/main.yml`, `C:\project\.github\workflows\release.yml`) targeting workflow files are blocked.

When triggered, the policy returns an explicit, helpful denial message instructing the agent to explain the needed changes to a human maintainer:
> *"Blocked: Do not create or edit GitHub Actions workflow files. Explain the required change and ask a human maintainer to make or review it manually. Continue with unrelated tasks."*

---

## Allowed Behavior

The policy is strictly scoped to prevent unnecessary friction:
- **Unrelated Source Files**: Edits and creations outside `.github/workflows/` (e.g., `src/app.ts`, `lib/server.js`, `README.md`) are immediately allowed.
- **Other `.github` Configurations**: Non-workflow files inside `.github/` (such as `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/PULL_REQUEST_TEMPLATE.md`, or `.github/CODEOWNERS`) are allowed.
- **Read-Only Operations**: Read-only tools (`ReadFile`, `View`, `Glob`, `Grep`) can read workflow definitions for analysis without interference.
- **Unrelated Tool Calls**: Non-file modification tools are allowed early without performance overhead.

---

## Limitations

- **Tool Scope**: This policy specifically inspects and guards Claude Code's `Write` and `Edit` file-system tools.
- **Shell-Based Modifications**: Direct shell-based file modifications executed via terminal tools (such as `sed -i`, `echo "..." > .github/workflows/ci.yml`, or `cat <<EOF`) are not parsed by this policy and should be paired with shell execution guardrails or dedicated Bash policy hooks.

---

## Installation

### From GitHub Release (Recommended)

Install the pack into Failproof AI:

```bash
failproofai policies add ShreyanshGupta205/workflow-guard
```

### Local Development / Evaluation

Load the policy file directly for local evaluation:

```powershell
failproofai policies -i -c .\workflow-guard.mjs --cli claude
```

Verify installed policies:

```bash
failproofai policies
```

---

## Local Verification & Testing

### Automated Test Suite

You can verify the policy logic across blocked and allowed scenarios using Node.js:

```js
import { customPolicies } from "failproofai";
import "./workflow-guard.mjs";

// Test suite validates:
// 1. Blocked: Write to .github/workflows/ci.yml -> DENY
// 2. Blocked: Edit to .github/workflows/deploy.yml -> DENY
// 3. Blocked: Windows path .github\workflows\ci.yml -> DENY
// 4. Blocked: Absolute path C:\repo\.github\workflows\ci.yml -> DENY
// 5. Allowed: Write to src/app.ts -> ALLOW
// 6. Allowed: Edit to README.md -> ALLOW
// 7. Allowed: Write to .github/ISSUE_TEMPLATE/bug.md -> ALLOW
// 8. Allowed: ReadFile on .github/workflows/ci.yml -> ALLOW
```

### Live Claude Code Enforcement

1. Start a fresh Claude Code session in any repository.
2. Ask the agent to create a test workflow:
   ```text
   Create a new GitHub Actions workflow at .github/workflows/test.yml that runs npm test on push.
   ```
3. Observe that Failproof AI denies the tool call before execution:
   ```text
   Blocked Write by failproofai because: Blocked: Do not create or edit GitHub Actions workflow files. Explain the required change and ask a human maintainer to make or review it manually. Continue with unrelated tasks.
   ```
4. Verify the denial in the local dashboard at `http://localhost:8020`.
