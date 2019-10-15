# auto-merge-action

[![license: MIT](https://img.shields.io/github/license/ridedott/eslint-config)](https://github.com/ridedott/eslint-config/blob/master/LICENSE)
[![GitHub Actions Status](https://github.com/ridedott/auto-merge-action/workflows/Continuous%20Integration/badge.svg?branch=master)](https://github.com/ridedott/npm-package-template/actions)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Automatically merges Dependabot Pull Requests.

## Usage

Create a new `.github/workflows/dependabot-auto-merge.yml` file:

```yaml
name: Auto merge Dependabot updates

on:
  check_suite:
    types:
      - completed
  pull_request:
    types:
      - labeled
      - unlabeled
      - synchronize
      - opened
      - edited
      - ready_for_review
      - reopened
      - unlocked

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    steps:
      - name: auto-merge
        uses: ridedott/auto-merge-action@master
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Add a job as a last step of your CI workflow:

```yaml
auto-merge:
  name: Auto merge Dependabot updates
  runs-on: ubuntu-latest
  needs:
    - all
    - other
    - required
    - jobs
  steps:
    - name: auto-merge
      uses: ridedott/auto-merge-action@master
      with:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Getting Started

These instructions will get you a copy of the project up and running on your
local machine for development and testing purposes. See usage notes on how to
consume this package in your project.

<!-- Instructions -->

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
git clone git@github.com:ridedott/dependabot-auto-merge-action.git
```

In case you don't have a git client, you can get the latest version directly by
using
[this link](https://github.com/ridedott/dependabot-auto-merge-action/archive/master.zip)
and extracting the downloaded archive.

Go the the right directory and install dependencies:

```bash
cd dependabot-auto-merge-action
npm install
```

That's it! You can now go to the next step.

## Tests

### Formatting

This project uses [Prettier](https://prettier.io) to automate formatting. All
supported files are being reformatted in a pre-commit hook. You can also use one
of the two scripts to validate and optionally fix all of the files:

```bash
npm run format
npm run format:fix
```

### Linting

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

### Runtime libraries

### Automation

- [Dependabot](https://dependabot.com/)
- [GitHub Actions](https://github.com/features/actions)

### Source

- [TypeScript](https://www.typescriptlang.org)

## Versioning

This project adheres to [Semantic Versioning](http://semver.org) v2.
