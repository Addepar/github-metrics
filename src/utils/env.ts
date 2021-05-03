type GithubArgs = {
  owner: string;
  repo: string;
  token: string;
};

const DEFAULT_GITHUB_OWNER = 'Addepar';
const DEFAULT_GITHUB_REPO = 'Iverson';

export function githubArgs(): GithubArgs {
  const owner = process.env.GITHUB_OWNER || DEFAULT_GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO || DEFAULT_GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error(`Required env.GITHUB_TOKEN`);
  }

  return { owner, repo, token };
}
