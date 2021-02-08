const { env } = require('process');
const NodeEnvironment = require('jest-environment-node');

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    switch (context.docblockPragmas['webhook-pragma']) {
      case 'check_suite':
        env.GITHUB_ACTION = 'ridedottmerge-me-action';
        env.GITHUB_ACTOR = 'dependabot[bot]';
        env.GITHUB_EVENT_NAME = 'check_suite';
        env.GITHUB_EVENT_PATH = './test/fixtures/ctx.check-suite.json';
        env.GITHUB_REF = 'refs/heads/test-branch';
        env.GITHUB_REPOSITORY = 'test-actor/Test-Repo';
        env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
        env.GITHUB_WORKFLOW = 'Auto merge';
        break;
      case 'pull_request':
        env.GITHUB_ACTION = 'ridedottmerge-me-action';
        env.GITHUB_ACTOR = 'dependabot[bot]';
        env.GITHUB_EVENT_NAME = 'pull_request';
        env.GITHUB_EVENT_PATH = './test/fixtures/ctx.pull-request.json';
        env.GITHUB_REF = 'refs/heads/test-branch';
        env.GITHUB_REPOSITORY = 'test-actor/Test-Repo';
        env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
        env.GITHUB_WORKFLOW = 'Auto merge';
        break;
      case 'pull_request_for_major_bump':
        env.GITHUB_ACTION = 'ridedottmerge-me-action';
        env.GITHUB_ACTOR = 'dependabot[bot]';
        env.GITHUB_EVENT_NAME = 'pull_request';
        env.GITHUB_EVENT_PATH =
          './test/fixtures/ctx.pull-request-for-major-bump.json';
        env.GITHUB_REF = 'refs/heads/test-branch';
        env.GITHUB_REPOSITORY = 'test-actor/Test-Repo';
        env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
        env.GITHUB_WORKFLOW = 'Auto merge';
        break;
      case 'push':
        env.GITHUB_ACTION = 'ridedottmerge-me-action';
        env.GITHUB_ACTOR = 'dependabot[bot]';
        env.GITHUB_EVENT_NAME = 'push';
        env.GITHUB_EVENT_PATH = './test/fixtures/ctx.push.json';
        env.GITHUB_REF = 'refs/heads/test-branch';
        env.GITHUB_REPOSITORY = 'test-actor/Test-Repo';
        env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
        env.GITHUB_WORKFLOW = 'Continuous Integration';
        break;

      default:
        env.GITHUB_ACTION = 'test-value';
        env.GITHUB_ACTOR = 'test-actor';
        env.GITHUB_EVENT_NAME = 'pull_request';
        env.GITHUB_EVENT_PATH = './test/test.github.payload.json';
        env.GITHUB_REF = 'refs/heads/test-branch';
        env.GITHUB_REPOSITORY = 'test-actor/Test-Repo';
        env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
        env.GITHUB_WORKFLOW = 'pull_requests';
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
