import * as core from '@actions/core'
import * as github from '@actions/github'
import OpenAI from 'openai';
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token = core.getInput("token");
    const openapiKey = core.getInput("openaikey");
    let prompt = core.getInput("prompt");
    let commentLng = core.getInput("commentLng");
    let programLng = core.getInput("programLng");
    let chatgptModel = core.getInput("chatgpt_model");

    if (!openapiKey) {
      console.log("openaikey is required.");
    }

    if (!chatgptModel) {
      chatgptModel = "gpt-4o";
    }
    if (!commentLng) {
      commentLng = "中文";
    }
    if (!programLng) {
      programLng = "C#";
    }

    if (!prompt) {
      prompt = `You are a professional ${programLng} programer , let me know how can i efficiently change a code.
      Please review it with a focus on:
      1. Potential security issues (e.g., SQL injection, XSS, or session handling).
      2. Performance bottlenecks or unnecessary complexity.
      3. Adherence to common ${programLng} best practices.
      4. Overall code maintainability and readability.
      finlly please givme review in ${commentLng} language.
      `;
    }

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

    //console.log(`Commit Message: ${headCommit.message}`);
    // 獲取倉庫和最新 Commit SHA
    const { owner, repo } = context.repo;
    const ref = context.payload.after;

    var commit: any = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref
    });
    commit.data.files.forEach(async (file: any) => {
      if (file.filename.indexOf("dist/") == -1) {
        console.log(`File: ${file.filename}`);
        console.log(`異動內容: ${file.patch}`);

        const client = new OpenAI({
          apiKey: openapiKey,
        });
        const initCompletion = await client.chat.completions.create({
          model: chatgptModel,
          messages: [
            { role: "developer", content: prompt },
            {
              role: "user",
              content: file.patch,
            },
          ],
        });

        console.log(initCompletion.choices[0]!.message?.content);

        // const commetCompletion = await client.chat.completions.create({
        //   model: "gpt-4o",
        //   messages: [
        //     { role: "developer", content: "You are a helpful assistant." },
        //     {
        //       role: "user",
        //       content: "Write a haiku about recursion in programming.",
        //     },
        //   ],
        // });

      }
    });

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
