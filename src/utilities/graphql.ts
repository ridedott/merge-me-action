import {
  approveAndMergePullRequestMutation,
  mergePullRequestMutation,
} from '../graphql/mutations';
import { parseInputMergeMethod } from './inputParsers';

/**
 * Returns the right GraphQl mutation depending on weather the
 * `reviewEdge` form the Pull Request contains a review with `'Approved'`
 * state or if it is `undefined`.
 * This prevents approving an already approved pull request.
 * @param reviewEdge
 * @returns `approveAndMergePullRequestMutation` | `mergePullRequestMutation`
 */
export const mutationSelector = (
  reviewEdge: { node: { state: string } } | undefined,
): string => {
  const mergeMethod = parseInputMergeMethod();

  if (reviewEdge === undefined) {
    return approveAndMergePullRequestMutation(mergeMethod);
  }

  return mergePullRequestMutation(mergeMethod);
};
