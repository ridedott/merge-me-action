import { getInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';

import {
  continuousIntegrationEndHandle,
  pullRequestHandle,
} from './eventHandlers';
import { logInfo, logWarning } from './utilities/log';

const DEFAULT_MAXIMUM_RETRIES = 3;

const GITHUB_TOKEN = getInput('GITHUB_TOKEN');
const GITHUB_LOGIN = getInput('GITHUB_LOGIN');
const MAXIMUM_RETRIES =
  getInput('MAXIMUM_RETRIES').trim() === ''
    ? DEFAULT_MAXIMUM_RETRIES
    : Number.parseInt(getInput('MAXIMUM_RETRIES'), 10);

const octokit = getOctokit(GITHUB_TOKEN);

const main = async (): Promise<void> => {
  logInfo(`Automatic merges enabled for GitHub login: ${GITHUB_LOGIN}.`);

  switch (context.eventName) {
    case 'check_suite':
    case 'workflow_run':
      return continuousIntegrationEndHandle(
        octokit,
        GITHUB_LOGIN,
        MAXIMUM_RETRIES,
      );
    case 'pull_request':
    case 'pull_request_target':
      return pullRequestHandle(octokit, GITHUB_LOGIN, MAXIMUM_RETRIES);
    default:
      logWarning(`Unknown event ${context.eventName}, skipping.`);
  }
};

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error: Error): void => {
  setFailed(
    `An unexpected error occurred: ${error.message}, ${
      error.stack ?? 'no stack trace'
    }.`,
  );
});
