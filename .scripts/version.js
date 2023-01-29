const path = require("path");
const json5 = require("json5");
const { promises: fsP } = require("fs");
const getRepoInfo = require("git-repo-info");

const run = async () => {
  const git = getRepoInfo();

  git.branch; // current branch
  git.sha; // current sha
  git.abbreviatedSha; // first 10 chars of the current sha
  git.tag; // tag for the current sha (or `null` if no tag exists)
  git.lastTag; // tag for the closest tagged ancestor
  //   (or `null` if no ancestor is tagged)
  git.commitsSinceLastTag; // number of commits since the closest tagged ancestor
  //   (`0` if this commit is tagged, or `Infinity` if no ancestor is tagged)
  git.committer; // committer for the current sha
  git.committerDate; // commit date for the current sha
  git.author; // author for the current sha
  git.authorDate; // authored date for the current sha
  git.commitMessage; // commit message for the current sha
  git.root; // root directory for the Git repo or submodule
  //   (if in a worktree, this is the directory containing the original copy)
  git.commonGitDir; // directory containing Git metadata for this repo or submodule
  //   (if in a worktree, this is the primary Git directory for the repo)
  git.worktreeGitDir; // if in a worktree, the directory containing Git metadata specific to
  //   this worktree; otherwise, this is the same as `commonGitDir`.

  const package = JSON.parse(
    await fsP.readFile(path.resolve(__dirname, "../package.json"), "utf8")
  );
  // package.version = git.lastTag || package.version; // current version

  const versionInfo = { git,  package };

  console.log("Get version info:\n", versionInfo);

  await fsP.writeFile(
    path.resolve(__dirname, "../public/version.json5"),
    json5.stringify(versionInfo, null, 2),
    "utf8"
  );
};

run();
