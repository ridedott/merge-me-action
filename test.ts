const COMMIT_HEADLINE_MATCHER = /^(?<commitHeadline>.*)\\n\\n.*$/u;

const getCommitHeadline = (): string => {
  const {
    groups: { commitHeadline },
  } = 'm 16\\n\\nnonononop'.match(COMMIT_HEADLINE_MATCHER) as any;

  return commitHeadline;
};

console.log(getCommitHeadline());
