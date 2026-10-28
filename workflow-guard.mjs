import { customPolicies, allow, deny } from "failproofai";

const WORKFLOW_PATH = /(^|\/)\.github\/workflows(\/|$)/i;

customPolicies.add({
  name: "block-agent-workflow-edits",
  description:
    "Blocks AI agent Write and Edit operations targeting GitHub Actions workflow files, requiring human review of CI/CD workflow changes.",
  category: "CI/CD Security",
  defaultEnabled: true,
  match: {
    events: ["PreToolUse"],
    tools: ["Write", "Edit"],
  },
  fn: async (ctx) => {
    const toolName = String(ctx.toolName ?? "");

    if (!["Write", "Edit"].includes(toolName)) {
      return allow();
    }

    const filePath = String(ctx.toolInput?.file_path ?? "")
      .replace(/\\/g, "/");

    if (!WORKFLOW_PATH.test(filePath)) {
      return allow();
    }

    return deny(
      "Blocked: Do not create or edit GitHub Actions workflow files. " +
      "Explain the required change and ask a human maintainer to make " +
      "or review it manually. Continue with unrelated tasks."
    );
  },
});
