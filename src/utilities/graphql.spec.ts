import * as actionsCore from '@actions/core';

import { mutationSelector } from './graphql';

const getInputSpy = jest.spyOn(actionsCore, 'getInput').mockImplementation();

describe('mutationSelector', (): void => {
  it('returns query', (): void => {
    expect.assertions(1);

    getInputSpy.mockReturnValueOnce('SQUASH');

    expect(
      mutationSelector({
        node: {
          state: 'state',
        },
      }),
    ).toMatchInlineSnapshot(`
      "
        mutation ($commitHeadline: String!, $pullRequestId: ID!) {
          mergePullRequest(input: {commitBody: \\" \\", commitHeadline: $commitHeadline, mergeMethod: SQUASH, pullRequestId: $pullRequestId}) {
            clientMutationId
          }
        }
      "
    `);
  });
});
