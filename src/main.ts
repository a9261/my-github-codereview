import * as core from '@actions/core'
import * as github from '@actions/github'
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token = core.getInput("token");
    console.log("getInput  " + token);
    if (!token) {
      throw new Error("GITHUB_TOKEN is required.");
    }
   

    const octokit = github.getOctokit(token);
    const context = github.context;

    // 確保事件是 `push`
    if (context.eventName !== "push") {
      core.setFailed("This action only works with push events.");
      return;
    }

    // 獲取最新的 Commit 信息
    const headCommit = context.payload.head_commit;
    if (!headCommit) {
      core.setFailed("No commit found in the payload.");
      console.log("No commit found in the payload.")
      return;
    }

    console.log(`Commit Message: ${headCommit.message}`);

    core.info(`Latest Commit SHA: ${headCommit.id}`);
    core.info(`Commit Message: ${headCommit.message}`);

    // 獲取倉庫和最新 Commit SHA
    const { owner, repo } = context.repo;
    const ref = context.payload.after;

    //Get All of Content
    //octokit.rest.codesOfConduct.getAllCodesOfConduct();
   const allResponse = await octokit.rest.codesOfConduct.getAllCodesOfConduct();
   console.log(`consoleLog Content of allResponse ---` + allResponse.data );
   core.info(`coreInfo Content of allResponse ---` + allResponse.data );

    // // 獲取特定文件的內容
    // const filePath = "README.md"; // 替換為需要檢查的文件路徑
    // const response = await octokit.rest.repos.getContent({
    //   owner,
    //   repo,
    //   path: filePath,
    //   ref,
    // });

    // if ("content" in response.data) {
    //   const content = Buffer.from(response.data.content, "base64").toString("utf8");
    //   core.info(`Content of ${filePath}:\n${content}`);

    //   console.log(`Content of ${filePath}:\n${content}`);
    // } else {
    //   core.warning(`File ${filePath} is a directory or does not exist.`);
    // }

  } catch (error) {
    core.setFailed(`Action failed with error: ${error instanceof Error ? error.message : error}`);
  }
}
