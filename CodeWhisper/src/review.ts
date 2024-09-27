import fetch from 'node-fetch';
import { git } from './git';
import OpenAI from 'openai';
import { addCommentToPR } from './pr';
import { Agent } from 'https';
import * as tl from "azure-pipelines-task-lib";
import Anthropic from '@anthropic-ai/sdk';
import { defaultAIInstruction } from './utils';

export async function reviewFile(targetBranch: string, fileName: string, httpsAgent: Agent, apiKey: string, ai: OpenAI | Anthropic | undefined, model: string) {
  console.log(`\nStart reviewing ${fileName} ...`);

  const patch = await git.diff([targetBranch, '--', fileName]);

  const instructions = tl.getInput('ai_instructions') || defaultAIInstruction;

  try {
    let choices: any;

    if (ai) {
      console.log(`Sending changes to AI:`)
      console.log(patch)

      if (ai instanceof OpenAI) {
        const response = await ai.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content: instructions
            },
            {
              role: "user",
              content: patch
            }
          ],
          max_tokens: 500
        });

        choices = response.choices;
      } else if (ai instanceof Anthropic) {
        const response = await ai.messages.create({
          model: model,
          messages: [
            {
              role: "user",
              content: instructions
            },
            {
              role: "user",
              content: patch
            }
          ],
          max_tokens: 500
        });

        choices = [{ message: { content: response.content[0].type == 'text' ? response.content[0].text : 'Tool use is not supported' } }];
      }
    }

    if (choices && choices.length > 0) {
      const review = choices[0].message?.content as string;

      if (review.trim() !== "No feedback.") {
        await addCommentToPR(fileName, review, httpsAgent);
      }
    }

    console.log(`Review of ${fileName} completed.`);
  }
  catch (error: any) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}