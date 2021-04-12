/* eslint-disable immutable/no-let */
/* eslint-disable no-await-in-loop */
/* eslint-disable prefer-destructuring */

import { getOctokit } from '@actions/github';
import { GraphQlQueryResponseData } from '@octokit/graphql';

const MAX_PAGE_SIZE = 100;

export interface IterableList<Iterable> {
  edges: Array<{
    node: Iterable;
  }>;
  pageInfo: {
    endCursor: string;
    hasNextPage: boolean;
  };
}

export const makeGraphqlIterator = async function* <IterableData>(
  octokit: ReturnType<typeof getOctokit>,
  options: {
    extractListFunction: (
      response: GraphQlQueryResponseData,
    ) => IterableList<IterableData> | undefined;
    parameters: object;
    query: string;
  },
): AsyncGenerator<IterableData> {
  const { query, parameters, extractListFunction } = options;

  let cursor: string | undefined = undefined;
  let hasNextPage: boolean = true;

  const { pageSize = MAX_PAGE_SIZE }: { pageSize?: number } = parameters;

  while (hasNextPage) {
    const response = await octokit.graphql<GraphQlQueryResponseData>(query, {
      ...parameters,
      endCursor: cursor,
      pageSize,
    });

    const list = extractListFunction(response);

    if (list === undefined) {
      return;
    }

    cursor = list.pageInfo.endCursor;
    hasNextPage = list.pageInfo.hasNextPage;

    for (const { node } of list.edges) {
      yield node;
    }
  }
};
