# Reforged Challenge Submission

- **Full name:** Shreyansh Gupta
- **College email:** [ENTER YOUR COLLEGE EMAIL]
- **Repository link:** https://github.com/ShreyanshGupta205/workflow-guard
- **Release link:** https://github.com/ShreyanshGupta205/workflow-guard/releases/tag/v1.0.0
- **Install command:** `failproofai policies add ShreyanshGupta205/workflow-guard`
- **Policy name:** `block-agent-workflow-edits`
- **Category:** `CI/CD Security`
- **What it blocks:** Prevents Claude Code's Write and Edit tools from modifying files inside `.github/workflows/`, keeping CI/CD workflow changes under human review.
- **Proof:** [ACTUAL DASHBOARD DENIAL OR CLAUDE CODE DENIAL SCREENSHOT]
  > Open `http://localhost:8020` in your web browser to view the live dashboard recording the 12 denials for `pack/ShreyanshGupta205/workflow-guard@v1.0.0/block-agent-workflow-edits` and `custom/block-agent-workflow-edits`. Alternatively, run Claude Code in a test project and ask it to write to `.github/workflows/ci.yml` to capture the tool rejection screenshot.
