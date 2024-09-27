import * as tl from "azure-pipelines-task-lib/task";
import { OpenAI } from 'openai';
import { deleteExistingComments } from './pr';
import { reviewFile } from './review';
import { getTargetBranchName } from './utils';
import { getChangedFiles } from './git';
import https from 'https';
import Anthropic from "@anthropic-ai/sdk";

async function run() {
  try {
    if (tl.getVariable('Build.Reason') !== 'PullRequest') {
      tl.setResult(tl.TaskResult.Skipped, "This task should be run only when the build is triggered from a Pull Request.");
      return;
    }

    let ai: OpenAI | Anthropic | undefined;
    const supportSelfSignedCertificate = false;
    const apiProvider = tl.getInput('api_provider', true);
    const apiKey = tl.getInput('api_key', true);
    const model = tl.getInput('model', true);

    if (apiProvider == undefined) {
      tl.setResult(tl.TaskResult.Failed, 'No API provider provided!');
      return;
    }

    if (apiKey == undefined) {
      tl.setResult(tl.TaskResult.Failed, 'No Api Key provided!');
      return;
    }

    if (model == undefined) {
      tl.setResult(tl.TaskResult.Failed, 'No AI model provided!');
      return;
    }

    if (apiProvider == 'openai') {
      ai = new OpenAI({
        apiKey: apiKey,
      });
    }
    else if (apiProvider == 'anthropic') {
      ai = new Anthropic({
        apiKey: apiKey,
      });
    }

    const httpsAgent = new https.Agent({
      rejectUnauthorized: !supportSelfSignedCertificate
    });

    let targetBranch = getTargetBranchName();

    if (!targetBranch) {
      tl.setResult(tl.TaskResult.Failed, 'No target branch found!');
      return;
    }

    const filesNames = await getChangedFiles(targetBranch);

    await deleteExistingComments(httpsAgent);

    for (const fileName of filesNames) {
      await reviewFile(targetBranch, fileName, httpsAgent, apiKey, ai, model)
    }

    tl.setResult(tl.TaskResult.Succeeded, "Pull Request reviewed.");
  }
  catch (err: any) {
    tl.setResult(tl.TaskResult.Failed, err.message);
  }
}

run();