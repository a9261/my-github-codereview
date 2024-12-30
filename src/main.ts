import * as core from '@actions/core'
import { wait } from './wait'
import * as github from '@actions/github'
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')

    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    // core.debug(`Waiting ${ms} milliseconds ...`)

    // // Log the current timestamp, wait, then log the new timestamp
    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())

    // // Set outputs for other workflow steps to use
    // core.setOutput('time', new Date().toTimeString())

   
    core.debug(" Test  12345678 ");
    console.log(" Test for console log ");

    const context = github.context;
    // 確保當前事件是 `push`
    if (context.eventName !== "push") {
      core.setFailed("This action only works with push events.");
      return;
    }
    // 獲取最新 Commit 信息
    const headCommit = context.payload.head_commit;
    
    console.log("Latest Commit: " + headCommit);

    core.debug("Latest Commit: " + headCommit);

    if (headCommit && headCommit.id) {
      core.debug("Commit SHA: " + headCommit.id);
      core.debug("Commit Message: " + headCommit.message);

      console.log("Commit Message: " + headCommit.message);
      console.log("Commit Message: " + headCommit.commit.context);
    } else {
      core.setFailed("No commit found in the payload.");
    }




  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
