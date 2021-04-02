import { getInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';

import {
  continuousIntegrationEndHandle,
  pullRequestHandle,
  pushHandle,
} from './eventHandlers';
import { logInfo, logWarning } from './utilities/log';

const DEFAULT_MAXIMUM_RETRIES = 3;

const GITHUB_TOKEN = getInput('GITHUB_TOKEN');
const GITHUB_LOGIN = getInput('GITHUB_LOGIN');
const MAXIMUM_RETRIES =
  getInput('MAXIMUM_RETRIES').trim() === ''
    ? DEFAULT_MAXIMUM_RETRIES
    : parseInt(getInput('MAXIMUM_RETRIES'), 10);

const octokit = getOctokit(GITHUB_TOKEN);

const main = async (): Promise<void> => {
  logInfo(`Automatic merges enabled for GitHub login: ${GITHUB_LOGIN}.`);

  switch (context.eventName) {
    case 'check_suite':
      return continuousIntegrationEndHandle(
        octokit,
        GITHUB_LOGIN,
        MAXIMUM_RETRIES,
      );
    case 'workflow_run':
      return continuousIntegrationEndHandle(
        octokit,
        GITHUB_LOGIN,
        MAXIMUM_RETRIES,
      );
    case 'pull_request':
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
