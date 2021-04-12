import { getOctokit } from '@actions/github';
import { GraphQlQueryResponseData } from '@octokit/graphql';
export interface IterableList<Iterable> {
    edges: Array<{
        node: Iterable;
    }>;
    pageInfo: {
        endCursor: string;
        hasNextPage: boolean;
    };
}
export declare const makeGraphqlIterator: <IterableData>(octokit: ReturnType<typeof getOctokit>, options: {
    extractListFunction: (response: GraphQlQueryResponseData) => IterableList<IterableData> | undefined;
    parameters: object;
    query: string;
}) => AsyncGenerator<IterableData, any, unknown>;
//# sourceMappingURL=makeGraphqlIterator.d.ts.map