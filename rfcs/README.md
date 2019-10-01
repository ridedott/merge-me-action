# Requests for comments

## What is an RFC?

An RFC is a document describing ideas and intents prior to implementation so
that it may be freely discussed and perfected without wasting time on an
implementation that might be invalid by design.

## What is the difference with decisions?

A decision log tracks simple decisions that affect the entire codebase, such as
style guidelines alignments, technology choices and configuration changes.

RFCs have a more focused scope around feature implementation.

## RFC file name convention

All RFCs must be in markdown format with an `.md` extension.

File name convention:

`[date] [name].md`

- The `date` format: `YYYY-MM-DD`. This is an ISO standard and helps for sorting
  by date. This should be the creation date of an RFC.

- The `name` has a present tense imperative verb phrase. This helps readability
  and matches the commit message format.

- The `name` uses sentence capitalization and spaces. This is helpful for
  readability.

Examples:

- `2000-01-01 Verify email addresses.md`

- `2000-01-02 Saturate IoT logs with metadata.md`

- `2000-01-03 Improve logging performance.md`

## RFC template

All RFCs files must follow the [RFC template](./RFC_TEMPLATE.md) and be written
in third person passive voice to emphasize who or what receives the action of
the verb, and de-emphasize the subject.
