import {
  approveAndMergePullRequestMutation,
  mergePullRequestMutation,
} from '../graphql/mutations';
/**
 * This method returns the right GraphQl mutation depending on weather the
 * `reviewEdge` form the Pull Request contains a review with `'Approved'`
 * state or if it is `undefined`.
 * This prevents approving an already approved pull request.
 * @param reviewEdge
 * @returns `approveAndMergePullRequestMutation` | `mergePullRequestMutation`
 */
export const mutationSelector = (
  reviewEdge: { node: { state: string } } | undefined,
): string => {
  if (reviewEdge === undefined) {
    return approveAndMergePullRequestMutation;
  }

  return mergePullRequestMutation;
};
