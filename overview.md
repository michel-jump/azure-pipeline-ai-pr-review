# AI PR Review Task for Azure Pipelines

The AI PR Review Task for Azure Pipelines leverages the GPT model from OpenAI or Anthropic to review Pull Requests and provide feedback as comments in the Pull Request. This document provides a comprehensive guide on how to set up and use this task in your Azure Pipelines.

## Setup

Before using this task, ensure that the build service has permissions to contribute to Pull Requests in your repository, and allow the task to access the system token.

### Give permission to the build service agent

![contribute_to_pr](https://github.com/97saundersj/azure-pipeline-ai-pr-review/blob/main/images/contribute_to_pr.png?raw=true)

### Allow Task to access the system token

Depending on the type of pipeline you are using, follow one of the two steps below:

#### Yaml pipelines 

Add a checkout section with persistCredentials set to true.

```yaml
steps:
- checkout: self
  persistCredentials: true
```

#### Classic editors 

Enable the option "Allow scripts to access the OAuth token" in the "Agent job" properties.

![allow_access_token](https://github.com/97saundersj/azure-pipeline-ai-pr-review/blob/main/images/allow_access_token.png?raw=true)

### Azure Open AI service

If you choose to use the Azure Open AI service, you must fill in the endpoint and API key of Azure OpenAI. The format of the endpoint is as follows: `https://{XXXXXXXX}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version={API_VERSION}`

### OpenAI Models

In case you don't use Azure Open AI Service, you can choose which model to use. The supported models are "gpt-4", "gpt-3.5-turbo", and "gpt-3.5-turbo-16k". If no model is selected, the "gpt-3.5-turbo" is used.

## How to use it

### Install the extension

To use the GPT Pull Request Review Task, first install the extension in your Azure DevOps organization. Click on the "Get it free" button and follow the prompts to install it. You may need to authorize the extension to access your Azure DevOps account.

### Add the task to the build pipeline

After installing the extension, add the task to your build pipeline. Go to your build pipeline, click on the "+" icon to add a new task, and search for "Review PullRequest by GPT". Select it and add it to your pipeline.

### Configure the task

Once you have added the task to your pipeline, configure it. In the task configuration, provide your API key for OpenAI API. To create an API key, go to https://platform.openai.com/account/api-keys.

### Review Pull Requests

When the build is triggered from a Pull Request, the task will review it. If there is feedback on the changed code, the task will add comments to the Pull Request.

If the build is triggered manually, the task will be skipped.

## Compatible with Linux Build Agents

The tasks can execute on all supported build agent operating systems **including Linux and MacOS**.

## Task Options

The task has several configuration options:

- **API Provider**: Select the API provider to use (OpenAI or Anthropic).
- **API Key**: Provide the API key for the selected provider.
- **AI Model**: Choose the AI model to use. Supported models include "gpt-4", "gpt-3.5-turbo", "claude-3-opus-20240229", "claude-3-5-sonnet-20240620", and "claude-3-haiku-20240307".
- **AI Instruction Prompt**: Customize the instructions given to the AI for reviewing the Pull Request.

For more detailed information, refer to the [task.json](GPTPullRequestReview/task.json) file.

## Example Usage

Here is an example of how to configure the task in a YAML pipeline:

```yaml
steps:
- task: AIPRReview@0
  inputs:
    api_provider: 'openai'
    api_key: 'your_openai_api_key'
    model: 'gpt-3.5-turbo'
    ai_instructions: |
      Act as a code reviewer of a Pull Request, providing feedback on possible bugs and clean code issues.
      You are provided with the Pull Request changes in a patch format.
      Each patch entry has the commit message in the Subject line followed by the code changes (diffs) in a unidiff format.

      As a code reviewer, your task is:
      - Review only added, edited, or deleted lines.
      - If there's no bugs and the changes are correct, write only 'No feedback.'
      - If there's a bug or incorrect code changes, don't write 'No feedback.'
```

For more details on the implementation, refer to the [index.ts](GPTPullRequestReview/src/index.ts) and [review.ts](GPTPullRequestReview/src/review.ts) files.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.