# Decision records

## What is a decision record?

A **decision record** is a document that captures an important project-related
decision made along with its context and consequences.

A **decision** is a software design choice that addresses a significant
requirement.

A **significant requirement** is a requirement that has a measurable effect on a
software system’s architecture, it's development speed and scalability.

## Decision record file name convention

All decision records files must be in markdown format with `.md` extension.

File name convention:

`[date] [name].md`

- The `date` format: `YYYY-MM-DD`. This is ISO standard and helps for sorting by
  date.

- The `name` has a present tense imperative verb phrase. This helps readability
  and matches our commit message format.

- The `name` uses sentence capitalization and spaces. This is helpful for
  readability.

Examples:

- `2017-01-01 Add an eslint-immutable plugin.md`

- `2017-01-02 Improve project directories structure.md`

- `2017-01-03 Improve deployment security.md`

## Decision record template

All decision record files must follow the
[decision template](./DECISION_TEMPLATE.md).
