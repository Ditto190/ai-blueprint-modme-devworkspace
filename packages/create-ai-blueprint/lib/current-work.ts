import fs from "node:fs/promises";
import path from "node:path";

type CurrentWorkState = "active" | "idle" | "malformed";
type CurrentWorkType = "feature" | "fix" | "rollback";

interface CurrentWorkStep {
  checked: boolean;
  line: number;
  title: string;
}

type CurrentWorkWarningCode =
  | "empty_current_work"
  | "invalid_current_work_path"
  | "malformed_current_work"
  | "missing_current_work"
  | "unsafe_current_work_path";

interface CurrentWorkWarning {
  code: CurrentWorkWarningCode;
  message: string;
}

interface CurrentWorkSummary {
  state: CurrentWorkState;
  type: CurrentWorkType | null;
  title: string | null;
  status: string | null;
  buildPlanItem: string | null;
  steps: CurrentWorkStep[];
  completed: number;
  remaining: number;
  total: number;
  nextStep: CurrentWorkStep | null;
  warnings: CurrentWorkWarning[];
}

const CURRENT_WORK_PATH = path.join(
  "blueprint",
  "context",
  "current-feature.md"
);
const RESET_MARKER = "_Nothing in progress.";
const CHECKBOX_PATTERN = /^\s*-\s+\[([ xX])\]\s+(.+?)\s*$/;

async function readCurrentWork(projectRoot: string): Promise<CurrentWorkSummary> {
  const currentWorkPath = path.join(projectRoot, CURRENT_WORK_PATH);

  try {
    const stats = await fs.lstat(currentWorkPath);

    if (stats.isSymbolicLink()) {
      return malformedSummary({
        code: "unsafe_current_work_path",
        message: "Current work file is a symbolic link and was not read."
      });
    }

    if (!stats.isFile()) {
      return malformedSummary({
        code: "invalid_current_work_path",
        message: "Current work path is not a regular file."
      });
    }

    return parseCurrentWork(await fs.readFile(currentWorkPath, "utf8"));
  } catch (error: unknown) {
    if (getErrorCode(error) === "ENOENT") {
      return malformedSummary({
        code: "missing_current_work",
        message: "Current work file is missing."
      });
    }

    throw error;
  }
}

function parseCurrentWork(markdown: string): CurrentWorkSummary {
  if (markdown.trim() === "") {
    return malformedSummary({
      code: "empty_current_work",
      message: "Current work file is empty."
    });
  }

  if (markdown.includes(RESET_MARKER)) {
    return idleSummary();
  }

  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || null;
  const headingIdentity = heading?.match(/^(Feature|Fix|Rollback):\s*(.+)$/i);
  const fieldIdentity = markdown.match(
    /^\*\*(Feature|Fix|Rollback):\*\*\s*(.+)$/im
  );
  const explicitType = markdown.match(
    /^\*\*Type:\*\*\s*(Feature|Fix|Rollback)\s*$/im
  )?.[1];
  const typeLabel = explicitType || headingIdentity?.[1] || fieldIdentity?.[1] || null;
  const type = normalizeWorkType(typeLabel);
  const fieldValue = fieldIdentity?.[2]?.trim() || null;
  const fieldFeatureIdentity = type === "feature"
    ? fieldValue?.match(/^([0-9]+[a-z]?)\.?(?:\s+|$)(.*)$/i)
    : null;
  const title = headingIdentity?.[2]?.trim() ||
    fieldFeatureIdentity?.[2]?.trim() ||
    fieldValue ||
    heading;
  const status = markdown.match(/^\*\*Status:\*\*\s*(.+)$/im)?.[1]?.trim() || null;
  const explicitBuildPlanItem = markdown.match(
    /^\*\*From build-plan:\*\*\s*feature\s+([0-9]+[a-z]?)\b/im
  )?.[1]?.toLowerCase() || null;
  const buildPlanItem = explicitBuildPlanItem ||
    fieldFeatureIdentity?.[1]?.toLowerCase() ||
    null;
  const steps = parseBuildSteps(markdown);
  const warnings: CurrentWorkWarning[] = [];

  if (
    !type ||
    !title ||
    steps === null ||
    steps.length === 0 ||
    (type === "feature" && !buildPlanItem)
  ) {
    warnings.push({
      code: "malformed_current_work",
      message: "Current work does not contain a recognizable type, title, and build-step checklist."
    });
  }

  const normalizedSteps = steps || [];
  const completed = normalizedSteps.filter((step) => step.checked).length;

  return {
    state: warnings.length > 0 ? "malformed" : "active",
    type,
    title,
    status,
    buildPlanItem,
    steps: normalizedSteps,
    completed,
    remaining: normalizedSteps.length - completed,
    total: normalizedSteps.length,
    nextStep: normalizedSteps.find((step) => !step.checked) || null,
    warnings
  };
}

function parseBuildSteps(markdown: string): CurrentWorkStep[] | null {
  const lines = markdown.split(/\r?\n/);
  const sectionIndex = lines.findIndex((line) => /^##\s+Build steps\s*$/i.test(line));

  if (sectionIndex === -1) {
    return null;
  }

  const candidates: Array<CurrentWorkStep & { depth: number }> = [];

  for (let index = sectionIndex + 1; index < lines.length; index += 1) {
    const line = lines[index] || "";

    if (/^##\s+/.test(line)) {
      break;
    }

    const match = line.match(CHECKBOX_PATTERN);
    if (!match) {
      continue;
    }

    const marker = match[1] || "";
    const content = match[2] || "";
    const indent = line.match(/^(\s*)/)?.[1] || "";
    candidates.push({
      checked: marker.toLowerCase() === "x",
      depth: indent.replaceAll("\t", "  ").length,
      line: index + 1,
      title: parseStepTitle(content)
    });
  }

  const minimumDepth = Math.min(...candidates.map((step) => step.depth));
  return candidates
    .filter((step) => step.depth === minimumDepth)
    .map(({ depth: _depth, ...step }) => step);
}

function parseStepTitle(content: string): string {
  const boldTitle = content.match(/^(?:\d+\.\s*)?\*\*(.+?)\*\*/)?.[1];
  const label = boldTitle || content.split(/\s+-\s+/, 1)[0] || content;
  return label.replace(/^Step\s+\d+\s*[-:]\s*/i, "").trim();
}

function normalizeWorkType(value: string | null): CurrentWorkType | null {
  const normalized = value?.toLowerCase();

  if (normalized === "feature" || normalized === "fix" || normalized === "rollback") {
    return normalized;
  }

  return null;
}

function idleSummary(): CurrentWorkSummary {
  return {
    state: "idle",
    type: null,
    title: null,
    status: null,
    buildPlanItem: null,
    steps: [],
    completed: 0,
    remaining: 0,
    total: 0,
    nextStep: null,
    warnings: []
  };
}

function malformedSummary(warning: CurrentWorkWarning): CurrentWorkSummary {
  return {
    ...idleSummary(),
    state: "malformed",
    warnings: [warning]
  };
}

function getErrorCode(error: unknown): string | undefined {
  return typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
    ? error.code
    : undefined;
}

export { CURRENT_WORK_PATH, parseCurrentWork, readCurrentWork };

export type {
  CurrentWorkState,
  CurrentWorkStep,
  CurrentWorkSummary,
  CurrentWorkType,
  CurrentWorkWarning,
  CurrentWorkWarningCode
};
