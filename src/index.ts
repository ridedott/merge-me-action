import { getInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';

import {
  getLastWorkflowRunConclusion,
  WorkflowRunConclusion,
} from './common/workflowRun';
import {
  checkSuiteHandle,
  pullRequestHandle,
  pushHandle,
} from './eventHandlers';
import { logInfo, logWarning } from './utilities/log';

const DEFAULT_MAXIMUM_RETRIES = 3;

const GITHUB_TOKEN = getInput('GITHUB_TOKEN');
const GITHUB_LOGIN = getInput('GITHUB_LOGIN');
const DEPENDS_ON = getInput('DEPENDS_ON');
const MAXIMUM_RETRIES =
  getInput('MAXIMUM_RETRIES').trim() === ''
    ? DEFAULT_MAXIMUM_RETRIES
    : parseInt(getInput('MAXIMUM_RETRIES'), 10);

const octokit = getOctokit(GITHUB_TOKEN);

const main = async (): Promise<void> => {
  logInfo(`Automatic merges enabled for GitHub login: ${GITHUB_LOGIN}.`);

  logInfo(
    `Depends on: ${DEPENDS_ON}, context ref is: ${context.ref}, sha: ${context.sha}, event: ${context.eventName}, owner: ${context.repo.owner}, repo: ${context.repo.repo}, dependant workflow id: ${DEPENDS_ON_WORKFLOW}`,
  );

  if (DEPENDS_ON.length > 0) {
    const conclusion = await getLastWorkflowRunConclusion(octokit, {
      branch: context.ref,
      event: context.eventName,
      owner: context.repo.owner,
      repository: context.repo.repo,
      sha: context.sha,
      workflowFileName: DEPENDS_ON,
    });

    if (conclusion !== WorkflowRunConclusion.Success) {
      logInfo(
        `The last run of ${DEPENDS_ON} workflow is expected to be 'success' but it is '${
          conclusion ?? 'unknown'
        }', skipping.`,
      );

      return;
    }
  }

  switch (context.eventName) {
    case 'check_suite':
      return checkSuiteHandle(octokit, GITHUB_LOGIN, MAXIMUM_RETRIES);
    case 'pull_request':
    case 'pull_request_target':
      return pullRequestHandle(octokit, GITHUB_LOGIN, MAXIMUM_RETRIES);
    case 'push':
      return pushHandle(octokit, GITHUB_LOGIN, MAXIMUM_RETRIES);
    default:
      logWarning(`Unknown event ${context.eventName}, skipping.`);
  }
};

main().catch((error: Error): void => {
  setFailed(
    `An unexpected error occurred: ${error.message}, ${
      error.stack ?? 'no stack trace'
    }.`,
  );
});
