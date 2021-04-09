/* eslint-disable require-atomic-updates */
/* eslint-disable prefer-destructuring */
/* eslint-disable immutable/no-let */

import { getOctokit } from '@actions/github';

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

export const makeGraphqlIterator = <ResponseData, IterableData>(
  octokit: ReturnType<typeof getOctokit>,
  query: string,
  parameters: object,
  extractListFunction: (response: ResponseData) => IterableList<IterableData>,
  pageSize: number = MAX_PAGE_SIZE,
  // eslint-disable-next-line max-params
): AsyncIterable<IterableData> => ({
  [Symbol.asyncIterator](): AsyncIterator<IterableData> {
    const fetched: IterableData[] = [];
    let current = 0;
    let cursor: string | undefined = undefined;
    let hasNextPage: boolean = true;

    return {
      async next(): Promise<IteratorResult<IterableData>> {
        if (current === fetched.length && hasNextPage) {
          const response = await octokit.graphql(query, {
            ...parameters,
            endCursor: cursor,
            pageSize,
          });

          const { edges, pageInfo } = extractListFunction(
            response as ResponseData,
          );

          cursor = pageInfo.endCursor;
          hasNextPage = pageInfo.hasNextPage;

          fetched.push(...edges.map((edge): IterableData => edge.node));
        }

        if (current < fetched.length) {
          return { done: false, value: fetched[current++] };
        }

        return { done: true, value: undefined };
      },
    };
  },
});
