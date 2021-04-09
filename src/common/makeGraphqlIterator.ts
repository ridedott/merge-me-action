/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable immutable/no-let */
/* eslint-disable prefer-destructuring */
/* eslint-disable require-atomic-updates */

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

// eslint-disable-next-line func-style,max-params
export async function* makeGraphqlIterator<IterableData>(
  octokit: ReturnType<typeof getOctokit>,
  query: string,
  parameters: object,
  extractListFunction: (
    response: GraphQlQueryResponseData,
  ) => IterableList<IterableData> | undefined,
  pageSize: number = MAX_PAGE_SIZE,
): AsyncGenerator<IterableData> {
  const items: IterableData[] = [];
  let current = 0;
  let cursor: string | undefined = undefined;
  let hasNextPage: boolean = true;

  const fetchPage = async (): Promise<IterableData[] | undefined> => {
    const response = await octokit.graphql<GraphQlQueryResponseData | null>(
      query,
      {
        ...parameters,
        endCursor: cursor,
        pageSize,
      },
    );

    if (response === null) {
      return undefined;
    }

    const list = extractListFunction(response);

    if (list === undefined) {
      return undefined;
    }

    const { edges, pageInfo } = list;

    cursor = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage;

    return edges.map((edge): IterableData => edge.node);
  };

  // eslint-disable-next-line no-unmodified-loop-condition
  while (current !== items.length || hasNextPage) {
    if (current === items.length && hasNextPage) {
      // eslint-disable-next-line no-await-in-loop
      const data = await fetchPage();

      if (data === undefined) {
        return;
      }

      items.push(...data);
    }

    if (current < items.length) {
      yield items[current];
      current++;
    }
  }
}
