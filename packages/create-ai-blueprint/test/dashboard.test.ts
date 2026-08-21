import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { type TestContext } from "node:test";
import { promisify } from "node:util";

import {
  DASHBOARD_HOST,
  startDashboardServer
} from "../lib/dashboard.js";

const execFileAsync = promisify(execFile);

test("dashboard serves live read-only project status on loopback", async (t) => {
  const projectRoot = await createProject(t);
  const dashboard = await startDashboardServer(projectRoot);
  t.after(() => dashboard.close());

  assert.match(dashboard.url, new RegExp(`^http://${DASHBOARD_HOST}:\\d+$`));

  const pageResponse = await fetch(dashboard.url);
  const page = await pageResponse.text();
  assert.equal(pageResponse.status, 200);
  assert.match(pageResponse.headers.get("content-type") || "", /^text\/html/);
  assert.match(pageResponse.headers.get("content-security-policy") || "", /connect-src 'self'/);
  assert.equal(pageResponse.headers.get("cache-control"), "no-store");
  assert.match(page, /Blueprint Dashboard/);
  assert.match(page, /--paper: #f5f6f3/);
  assert.match(page, /--blue: #155eef/);
  assert.match(page, /class="brand-mark"/);
  assert.match(page, /id="build-list"/);
  assert.match(page, /id="work-list"/);
  assert.match(page, /id="history-list"/);
  assert.doesNotMatch(page, /https:\/\//);
  assert.match(page, /setInterval\(refresh, 1000\)/);

  const firstStatus = await readStatus(dashboard.url);
  assert.equal(firstStatus.project.name, "dashboard-project");
  assert.deepEqual(firstStatus.plans.build, {
    completed: 1,
    remaining: 1,
    total: 2,
    nextItem: { id: "2", title: "Dashboard" },
    splitParents: [],
    items: [
      { id: "1", title: "Foundation", checked: true },
      { id: "2", title: "Dashboard", checked: false }
    ]
  });
  assert.deepEqual(firstStatus.currentWork, {
    state: "active",
    type: "feature",
    title: "Dashboard",
    status: "in progress",
    buildPlanItem: "2",
    completed: 1,
    remaining: 1,
    total: 2,
    nextStep: { title: "Render live state" },
    steps: [
      { checked: true, title: "Read project status" },
      { checked: false, title: "Render live state" }
    ]
  });
  assert.deepEqual(firstStatus.history, {
    total: 1,
    items: [{
      type: "feature",
      title: "Foundation",
      buildPlanItem: "1",
      status: "complete"
    }]
  });

  await fs.writeFile(
    path.join(projectRoot, "blueprint", "build-plan.md"),
    `# Build Plan

- [x] 1. **Foundation** - establish the project
- [x] 2. **Dashboard** - show live project state
`
  );

  const updatedStatus = await readStatus(dashboard.url);
  assert.equal(updatedStatus.plans.build.completed, 2);
  assert.equal(updatedStatus.plans.build.remaining, 0);

  await fs.writeFile(
    path.join(projectRoot, "blueprint", "context", "current-feature.md"),
    `# Feature: Dashboard

**From build-plan:** feature 2
**Status:** implemented

## Build steps

- [x] **Step 1 - Read project status** - use the existing engine.
- [x] **Step 2 - Render live state** - update the browser.
`
  );

  const completedWorkStatus = await readStatus(dashboard.url);
  assert.equal(completedWorkStatus.currentWork.completed, 2);
  assert.equal(completedWorkStatus.currentWork.remaining, 0);

  await fs.writeFile(
    path.join(projectRoot, "blueprint", "history", "features", "02-dashboard.md"),
    "# Feature: Dashboard\n\n**From build-plan:** feature 2\n**Status:** complete\n"
  );

  const historyStatus = await readStatus(dashboard.url);
  assert.equal(historyStatus.history.total, 2);
  assert.equal(historyStatus.history.items[0]?.title, "Dashboard");

  const postResponse = await fetch(`${dashboard.url}/api/status`, {
    method: "POST"
  });
  assert.equal(postResponse.status, 405);
  assert.equal(postResponse.headers.get("allow"), "GET, HEAD");

  const missingResponse = await fetch(`${dashboard.url}/source-file.ts`);
  assert.equal(missingResponse.status, 404);
});

test("dashboard closes its server cleanly", async (t) => {
  const projectRoot = await createProject(t);
  const dashboard = await startDashboardServer(projectRoot);
  await dashboard.close();

  await assert.rejects(fetch(`${dashboard.url}/api/status`));
});

interface DashboardStatus {
  project: { name: string };
  plans: {
    build: {
      completed: number;
      remaining: number;
      total: number;
      nextItem: { id: string; title: string } | null;
      splitParents: Array<{ id: string; title: string }>;
      items: Array<{ id: string | null; title: string; checked: boolean }>;
    };
  };
  currentWork: {
    state: string;
    type: string | null;
    title: string | null;
    status: string | null;
    buildPlanItem: string | null;
    completed: number;
    remaining: number;
    total: number;
    nextStep: { title: string } | null;
    steps: Array<{ checked: boolean; title: string }>;
  };
  history: {
    total: number;
    items: Array<{
      type: string;
      title: string;
      buildPlanItem: string | null;
      status: string | null;
    }>;
  };
}

async function readStatus(url: string): Promise<DashboardStatus> {
  const response = await fetch(`${url}/api/status`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") || "", /^application\/json/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  return response.json() as Promise<DashboardStatus>;
}

async function createProject(t: TestContext): Promise<string> {
  const workspace = await fs.mkdtemp(path.join(os.tmpdir(), "blueprint-dashboard-"));
  const projectRoot = path.join(workspace, "dashboard-project");
  const contextRoot = path.join(projectRoot, "blueprint", "context");
  const stateRoot = path.join(projectRoot, "blueprint", ".state");
  const historyRoot = path.join(projectRoot, "blueprint", "history", "features");
  t.after(() => fs.rm(workspace, { recursive: true, force: true }));

  await fs.mkdir(contextRoot, { recursive: true });
  await fs.mkdir(stateRoot, { recursive: true });
  await fs.mkdir(historyRoot, { recursive: true });
  await fs.writeFile(path.join(projectRoot, "AGENTS.md"), "# Dashboard project\n");
  await fs.writeFile(
    path.join(projectRoot, "blueprint", "project-plan.md"),
    "# Project Plan\n"
  );
  await fs.writeFile(
    path.join(projectRoot, "blueprint", "build-plan.md"),
    `# Build Plan

- [x] 1. **Foundation** - establish the project
- [ ] 2. **Dashboard** - show live project state
`
  );
  await fs.writeFile(
    path.join(contextRoot, "current-feature.md"),
    `# Feature: Dashboard

**From build-plan:** feature 2
**Status:** in progress

## Build steps

- [x] **Step 1 - Read project status** - use the existing engine.
- [ ] **Step 2 - Render live state** - update the browser.
`
  );
  await fs.writeFile(
    path.join(contextRoot, "findings.md"),
    "# Findings\n\n_No findings recorded._\n"
  );
  await fs.writeFile(
    path.join(stateRoot, "manifest.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      version: "0.10.0",
      adapters: ["codex", "claude", "copilot"],
      managedFiles: {}
    }, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(historyRoot, "01-foundation.md"),
    "# Feature: Foundation\n\n**From build-plan:** feature 1\n**Status:** complete\n"
  );

  const planTime = new Date("2026-01-01T00:00:00Z");
  const overviewTime = new Date("2026-01-02T00:00:00Z");
  await fs.utimes(
    path.join(projectRoot, "blueprint", "project-plan.md"),
    planTime,
    planTime
  );
  await fs.utimes(
    path.join(projectRoot, "blueprint", "build-plan.md"),
    planTime,
    planTime
  );
  await fs.writeFile(
    path.join(contextRoot, "project-overview.md"),
    "# Project Overview\n"
  );
  await fs.utimes(
    path.join(contextRoot, "project-overview.md"),
    overviewTime,
    overviewTime
  );

  await runGit(projectRoot, ["init", "-b", "feature/dashboard"]);
  await runGit(projectRoot, ["config", "user.email", "dashboard@example.com"]);
  await runGit(projectRoot, ["config", "user.name", "Dashboard Test"]);
  await runGit(projectRoot, ["add", "."]);
  await runGit(projectRoot, ["commit", "-m", "chore: create fixture"]);
  return projectRoot;
}

async function runGit(projectRoot: string, args: readonly string[]): Promise<void> {
  await execFileAsync("git", ["-C", projectRoot, ...args], {
    encoding: "utf8"
  });
}
