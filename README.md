# merge-me-action

[![license: MIT](https://img.shields.io/github/license/ridedott/merge-me-action)](https://github.com/ridedott/merge-me-action/blob/master/LICENSE)
[![Continuous Integration](https://github.com/ridedott/merge-me-action/workflows/Continuous%20Integration/badge.svg)](https://github.com/ridedott/merge-me-action/actions)
[![Continuous Delivery](https://github.com/ridedott/merge-me-action/workflows/Continuous%20Delivery/badge.svg)](https://github.com/ridedott/merge-me-action/actions)
[![Coveralls](https://coveralls.io/repos/github/ridedott/merge-me-action/badge.svg)](https://coveralls.io/github/ridedott/merge-me-action)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Automatically merge Pull Requests created from a GitHub account.

## Usage

The action supports three scenarios:

- Where GitHub Actions are used exclusively.
- Where a third party CI system provider is used.
- Where both GitHub Actions and a third party CI system provider are used.

Depending on the scenario, different configuration is required, as described
below.

### GitHub Actions

When a repository uses GitHub Actions exclusively, Merge Me! action should be
added as a last job in the CI workflow.

```yaml
# .github/workflows/continuous-integration.yaml

jobs:
  # Other jobs are defined above.
  merge-me:
    name: Merge me!
    needs:
      - all
      - other
      - required
      - jobs
    runs-on: ubuntu-latest
    steps:
      - name: Merge me!
        uses: ridedott/merge-me-action@master
        with:
          # Depending on branch protection rules, a  manually populated
          # `GITHUB_TOKEN_WORKAROUND` environment variable with permissions to
          # push to a protected branch must be used. This variable can have an
          # arbitrary name, as an example, this repository uses
          # `GITHUB_TOKEN_DOTTBOTT`.
          #
          # When using a custom token, it is recommended to leave the following
          # comment for other developers to be aware of the reasoning behind it:
          #
          # This must be used as GitHub Actions token does not support
          # pushing to protected branches.
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Third party CI systems

When a repository uses third party CI systems, Merge Me! action should be added
as a stand-alone workflow, which is triggered by changes to checks and pull
requests.

Create a new `.github/workflows/merge-me.yaml` file:

```yaml
name: Merge me!

on:
  check_suite:
    types:
      - completed
  pull_request:
    types:
      - edited
      - labeled
      - opened
      - ready_for_review
      - reopened
      - synchronize
      - unlabeled
      - unlocked

jobs:
  merge-me:
    name: Merge me!
    runs-on: ubuntu-latest
    steps:
      - name: Merge me!
        uses: ridedott/merge-me-action@master
        with:
          # Depending on branch protection rules, a  manually populated
          # `GITHUB_TOKEN_WORKAROUND` environment variable with permissions to
          # push to a protected branch must be used. This variable can have an
          # arbitrary name, as an example, this repository uses
          # `GITHUB_TOKEN_DOTTBOTT`.
          #
          # When using a custom token, it is recommended to leave the following
          # comment for other developers to be aware of the reasoning behind it:
          #
          # This must be used as GitHub Actions token does not support
          # pushing to protected branches.
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### GitHub Actions and third party CI systems

When GitHub Actions and used in combination with third party CI systems, both of
the configurations described above should be applied.

## Configuration

### Enable auto-merge for a different bot

You may have another bot that also creates PRs against your repository and you
want to automatically merge those. By default, this GitHub Action assumes the
bot is [`dependabot`](https://dependabot.com/). You can override the bot name by
changing the value of `GITHUB_LOGIN` parameter:

```yaml
steps:
  - name: Merge me!
    uses: ridedott/merge-me-action@master
    with:
      GITHUB_LOGIN: my-awesome-bot-r2d2
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Use of configurable pull request merge method

By default, this GitHub Action assumes merge method is `SQUASH`. You can
override the merge method by changing the value of `MERGE_METHOD` parameter (one
of `MERGE`, `SQUASH` or `REBASE`):

```yaml
steps:
  - name: Merge me!
    uses: ridedott/merge-me-action@master
    with:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      MERGE_METHOD: MERGE
```

### Number of retries

In case the merge action fails, by default it will automatically be retried up
to three times using an exponential backoff strategy. This means, the first
retry will happen 1 second after the first failure, while the second will happen
4 seconds after the previous, the third 9 seconds, and so on.

It's possible to configure the number of retries by providing a value for
`MAXIMUM_RETRIES` (by default, the value is `3`).

```yaml
steps:
  - name: Merge me!
    uses: ridedott/merge-me-action@master
    with:
      MAXIMUM_RETRIES: 2
```

## Getting Started

These instructions will get you a copy of the project up and running on your
local machine for development and testing purposes. See usage notes on how to
consume this package in your project.

### Prerequisites

Minimal requirements to set up the project:

- [Node.js](https://nodejs.org/en) v12, installation instructions can be found
  on the official website, a recommended installation option is to use
  [Node Version Manager](https://github.com/creationix/nvm#readme). It can be
  installed in a
  [few commands](https://nodejs.org/en/download/package-manager/#nvm).
- A package manager [npm](https://www.npmjs.com). All instructions in the
  documentation will follow the npm syntax.
- Optionally a [Git](https://git-scm.com) client.

### Installing

Start by cloning the repository:

```bash
git clone git@github.com:ridedott/merge-me-action.git
```

In case you don't have a git client, you can get the latest version directly by
using
[this link](https://github.com/ridedott/merge-me-action/archive/master.zip) and
extracting the downloaded archive.

Go the the right directory and install dependencies:

```bash
cd merge-me-action
npm install
```

That's it! You can now go to the next step.

## Testing

All tests are being executed using [Jest](https://jestjs.io). All tests files
live side-to-side with a source code and have a common suffix: `.spec.ts`. Some
helper methods are being stored in the `test` directory.

There are three helper scripts to run tests in the most common scenarios:

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## Formatting

This project uses [Prettier](https://prettier.io) to automate formatting. All
supported files are being reformatted in a pre-commit hook. You can also use one
of the two scripts to validate and optionally fix all of the files:

```bash
npm run format
npm run format:fix
```

## Linting

This project uses [ESLint](https://eslint.org) to enable static analysis.
TypeScript files are linted using a [custom configuration](./.eslintrc). You can
use one of the following scripts to validate and optionally fix all of the
files:

```bash
npm run lint
npm run lint:fix
```

## Publishing

Publishing is handled in an automated way and must not be performed manually.

Each commit to the master branch is automatically tagged using
[`semantic-release`](https://github.com/semantic-release/semantic-release).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Built with

### Automation

- [Dependabot](https://dependabot.com/)
- [GitHub Actions](https://github.com/features/actions)

### Source

- [TypeScript](https://www.typescriptlang.org)

## Versioning

This project adheres to [Semantic Versioning](http://semver.org) v2.
