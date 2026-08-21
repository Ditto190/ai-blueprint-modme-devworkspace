import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";

import { parseHistoryItem, readHistory } from "../lib/history.js";

test("parseHistoryItem reads completed Blueprint work", () => {
  assert.deepEqual(
    parseHistoryItem(
      `# Feature: Live dashboard

**From build-plan:** feature 12a
**Status:** complete
`,
      "feature",
      "features/12a-live-dashboard.md"
    ),
    {
      type: "feature",
      title: "Live dashboard",
      buildPlanItem: "12a",
      status: "complete",
      file: "features/12a-live-dashboard.md"
    }
  );
});

test("readHistory reads feature, fix, and rollback archives", async (t) => {
  const projectRoot = await createProject(t);

  const history = await readHistory(projectRoot);

  assert.equal(history.total, 3);
  assert.deepEqual(
    history.items.map((item) => ({ type: item.type, title: item.title })),
    [
      { type: "feature", title: "Second feature" },
      { type: "feature", title: "First feature" },
      { type: "fix", title: "Repair navigation" }
    ]
  );
});

test("readHistory does not follow a symbolic-link history directory", async (t) => {
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), "blueprint-history-project-"));
  const outsideRoot = await fs.mkdtemp(path.join(os.tmpdir(), "blueprint-history-outside-"));
  t.after(() => fs.rm(projectRoot, { recursive: true, force: true }));
  t.after(() => fs.rm(outsideRoot, { recursive: true, force: true }));

  await fs.mkdir(path.join(outsideRoot, "features"), { recursive: true });
  await fs.writeFile(
    path.join(outsideRoot, "features", "secret.md"),
    "# Feature: Outside work\n"
  );
  await fs.mkdir(path.join(projectRoot, "blueprint"), { recursive: true });
  await fs.symlink(outsideRoot, path.join(projectRoot, "blueprint", "history"));

  assert.deepEqual(await readHistory(projectRoot), { items: [], total: 0 });
});

async function createProject(t: TestContext): Promise<string> {
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), "blueprint-history-"));
  t.after(() => fs.rm(projectRoot, { recursive: true, force: true }));

  for (const directory of ["features", "fixes", "rollbacks"]) {
    await fs.mkdir(path.join(projectRoot, "blueprint", "history", directory), {
      recursive: true
    });
    await fs.writeFile(
      path.join(projectRoot, "blueprint", "history", directory, "README.md"),
      `# ${directory}\n`
    );
  }

  await fs.writeFile(
    path.join(projectRoot, "blueprint", "history", "features", "01-first-feature.md"),
    "# Feature: First feature\n\n**From build-plan:** feature 1\n**Status:** complete\n"
  );
  await fs.writeFile(
    path.join(projectRoot, "blueprint", "history", "features", "02-second-feature.md"),
    "# Feature: Second feature\n\n**From build-plan:** feature 2\n**Status:** complete\n"
  );
  await fs.writeFile(
    path.join(projectRoot, "blueprint", "history", "fixes", "repair-navigation.md"),
    "# Fix: Repair navigation\n\n**Status:** complete\n"
  );

  return projectRoot;
}
