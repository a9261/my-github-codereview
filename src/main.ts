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
    let commentLng = core.getInput("commentlng");
    let programLng = core.getInput("programlng");
    let chatgptModel = core.getInput("chatgptmodel");

    if (!token) {
      throw new Error("GITHUB_TOKEN is required.");
    }
    if (!openapiKey) {
      console.log("openaikey is required.");
      throw new Error("openaikey is required.");
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

    console.log("parameter chatgptModel " + chatgptModel);
    console.log("parameter commentLng " + commentLng);
    console.log("parameter programLng " + programLng);

    console.log("parameter prompt " + prompt);

    if (!prompt) {
      prompt = `You are a professional ${programLng} programer , let me know how can i efficiently change a code.
      Please review it with a focus on:
      1. Potential security issues (e.g., SQL injection, XSS, or session handling).
      2. Performance bottlenecks or unnecessary complexity.
      3. Adherence to common ${programLng} best practices.
      4. Overall code maintainability and readability.
      finlly please givme response only use ${commentLng} language.
      `;
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
    //console.log(`Commit SHA: ${headCommit.id}`);
  
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
        //console.log(`File: ${file.filename}`);
        //console.log(`異動內容: ${file.patch}`);

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

        let gptComment= initCompletion.choices[0]!.message?.content;
       // console.log(initCompletion.choices[0]!.message?.content);
        octokit.rest.repos.createCommitComment({
          owner : owner,
          repo : repo,
          commit_sha : headCommit.id,
          body:gptComment ?? ""
        });
      }
    });

  } catch (error) {
    core.setFailed(`Action failed with error: ${error instanceof Error ? error.message : error}`);
  }
}
