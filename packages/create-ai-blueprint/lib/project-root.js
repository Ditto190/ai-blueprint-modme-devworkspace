const fs = require("node:fs/promises");
const path = require("node:path");

const MANIFEST_PATH = path.join("blueprint", ".state", "manifest.json");

async function findProjectRoot(startPath = process.cwd()) {
  const resolvedStart = await fs.realpath(startPath);
  const stats = await fs.stat(resolvedStart);
  let currentDir = stats.isDirectory()
    ? resolvedStart
    : path.dirname(resolvedStart);

  while (true) {
    if (await isBlueprintProjectRoot(currentDir)) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

async function isBlueprintProjectRoot(directory) {
  const blueprintDir = path.join(directory, "blueprint");

  if (!(await isDirectory(blueprintDir))) {
    return false;
  }

  return (
    (await hasInstallManifest(directory)) ||
    (await isFile(path.join(directory, "AGENTS.md")))
  );
}

async function hasInstallManifest(directory) {
  const stateDir = path.join(directory, "blueprint", ".state");
  return (
    (await isDirectory(stateDir)) &&
    (await isFile(path.join(directory, MANIFEST_PATH)))
  );
}

async function isDirectory(targetPath) {
  try {
    return (await fs.lstat(targetPath)).isDirectory();
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return false;
    }

    throw error;
  }
}

async function isFile(targetPath) {
  try {
    return (await fs.lstat(targetPath)).isFile();
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return false;
    }

    throw error;
  }
}

module.exports = {
  findProjectRoot,
  isBlueprintProjectRoot
};
