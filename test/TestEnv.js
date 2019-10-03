const NodeEnvironment = require('jest-environment-node');

process.env.GITHUB_EVENT_PATH = './test/test.github.payload.json';
process.env.GITHUB_EVENT_NAME = 'pull_request';
process.env.GITHUB_SHA = 'ffac537e6cbbf934b08745a378932722df287a53';
process.env.GITHUB_REF = 'refs/heads/test-branch';
process.env.GITHUB_WORKFLOW = 'pull_requests';
process.env.GITHUB_ACTION = 'test-value';
process.env.GITHUB_ACTOR = 'test-actor';
process.env.GITHUB_REPOSITORY = 'test-actor/Test-Repo';

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
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
