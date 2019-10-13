const { env } = require('process');
const NodeEnvironment = require('jest-environment-node');

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    switch (context.docblockPragmas['webhook-pragma']) {
      case 'check_suite':
        env.GITHUB_EVENT_PATH = './test/ctx.check-suite.json';
        env.GITHUB_EVENT_NAME = 'check_suite';
        env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
        env.GITHUB_REF = 'refs/heads/test-branch';
        env.GITHUB_WORKFLOW = 'Auto merge';
        env.GITHUB_ACTION = 'ridedottauto-merge-action';
        env.GITHUB_ACTOR = 'dependabot-preview[bot]';
        env.GITHUB_REPOSITORY = 'test-actor/Test-Repo';
        break;
      case 'pull_request':
        env.GITHUB_EVENT_PATH = './test/ctx.pull-request.json';
        env.GITHUB_EVENT_NAME = 'pull_request';
        env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
        env.GITHUB_REF = 'refs/heads/test-branch';
        env.GITHUB_WORKFLOW = 'Auto merge';
        env.GITHUB_ACTION = 'ridedottauto-merge-action';
        env.GITHUB_ACTOR = 'dependabot-preview[bot]';
        env.GITHUB_REPOSITORY = 'test-actor/Test-Repo';
        break;
      case 'push':
        env.GITHUB_EVENT_PATH = './test/ctx.push.json';
        env.GITHUB_EVENT_NAME = 'push';
        env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
        env.GITHUB_REF = 'refs/heads/test-branch';
        env.GITHUB_WORKFLOW = 'Continuous Integration';
        env.GITHUB_ACTION = 'ridedottauto-merge-action';
        env.GITHUB_ACTOR = 'dependabot-preview[bot]';
        env.GITHUB_REPOSITORY = 'test-actor/Test-Repo';
        break;

      default:
        env.GITHUB_EVENT_PATH = './test/test.github.payload.json';
        env.GITHUB_EVENT_NAME = 'pull_request';
        env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
        env.GITHUB_REF = 'refs/heads/test-branch';
        env.GITHUB_WORKFLOW = 'pull_requests';
        env.GITHUB_ACTION = 'test-value';
        env.GITHUB_ACTOR = 'test-actor';
        env.GITHUB_REPOSITORY = 'test-actor/Test-Repo';
        break;
    }
    super(config, context);
    this.testPath = context.testPath;
  }

  async setup() {
    await super.setup();
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = CustomEnvironment;
