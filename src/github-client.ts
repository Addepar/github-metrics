import { graphql } from '@octokit/graphql';
import { DateTime } from 'luxon';

export enum AnalysisPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

type PullRequestReview = {
  submittedAt: string;
  author: string;
};
type PullRequestComment = {
  publishedAt: string;
  author: string;
};
export enum PullRequestState {
  OPENED = 'OPEN',
  MERGED = 'MERGED',
  CLOSED = 'CLOSED',
}
export class PullRequest {
  title: string;

  state: string;

  baseRefName: string;

  number: number;

  mergedAt: string;

  createdAt: string;

  comments: Array<PullRequestComment>;

  reviews: Array<PullRequestReview>;

  constructor(pullRequest: {
    mergedAt: string;
    number: string;
    createdAt: string;
    title: string;
    state: string;
    baseRefName: string;
    reviews: {
      edges: Array<{
        node: {
          submittedAt: string;
          author: {
            login: string;
          };
        };
      }>;
    };
    comments: {
      edges: Array<{
        node: {
          publishedAt: string;
          author: {
            login: string;
          };
        };
      }>;
    };
  }) {
    const { mergedAt, number, createdAt, title, state, baseRefName } = pullRequest;
    const reviews = pullRequest.reviews.edges.map((edge) => {
      return {
        submittedAt: edge.node.submittedAt,
        author: edge.node.author.login,
      };
    });
    const comments = pullRequest.comments.edges.map((edge) => {
      return {
        publishedAt: edge.node.publishedAt,
        author: edge.node.author.login,
      };
    });

    this.title = title;
    this.number = Number(number);
    this.mergedAt = mergedAt;
    this.createdAt = createdAt;
    this.comments = comments;
    this.reviews = reviews;
    this.state = state;
    this.baseRefName = baseRefName;
  }
}

export default class GithubClient {
  #graphql;

  constructor({ token }: { token: string; }) {
    this.#graphql = graphql.defaults({
      headers: {
        authorization: `token ${token}`,
      },
    });
  }

  async getPullRequest({ owner, repo, pullRequestNumber }: { owner: string; repo: string; pullRequestNumber: number }): Promise<PullRequest> {
    const response: {
      repository: {
        pullRequest: any;
      };
    } = await this.#graphql(`
      {
        repository(owner: "${owner}", name: "${repo}") {
          pullRequest(number: ${pullRequestNumber}) {
            title
            number
            mergedAt
            createdAt
            state
            baseRefName
            comments (first: 100) {
              edges {
                node {
                  author {
                    login
                  }
                  publishedAt
                  createdAt
                }
              }
            }
            reviews (first: 100) {
              edges {
                node {
                  author {
                    login
                  }
                  submittedAt
                  createdAt
                }
              }
            }
          }
        }
      }
    `);

    return new PullRequest(response.repository.pullRequest);
  }

  async getPullRequestsByPeriod({ owner, repo, period = AnalysisPeriod.DAY, limit = 50 }: { owner: string; repo: string; period?: AnalysisPeriod; limit?: number }): Promise<Array<PullRequest>> {
    const now = DateTime.now();
    const today = now;
    const thisWeek = DateTime.fromObject({ weekNumber: now.weekNumber });
    const thisMonth = DateTime.fromObject({ month: now.month });
    let start = '';
    let end = '';

    switch (period) {
      case AnalysisPeriod.DAY:
        start = today.toFormat('yyyy-MM-dd');
        end = today.endOf('day').toString();
        break;
      case AnalysisPeriod.WEEK:
        start = thisWeek.toFormat('yyyy-MM-dd');
        end = thisWeek.endOf('week').toString();
        break;
      case AnalysisPeriod.MONTH:
        start = thisMonth.toFormat('yyyy-MM-dd');
        end = thisMonth.endOf('month').toString();
        break;
    }

    const response: {
      search: {
        edges: Array<any>;
      };
    } = await this.#graphql(`
      {
        search(query: "repo:${owner}/${repo} created:${start}..${end}", type: ISSUE, last: ${limit}) {
          edges {
            node {
              ... on PullRequest {
                title
                number
                mergedAt
                createdAt
                state
                baseRefName
                comments(first: 100) {
                  edges {
                    node {
                      author {
                        login
                      }
                      publishedAt
                      createdAt
                    }
                  }
                }
                reviews(first: 100) {
                  edges {
                    node {
                      author {
                        login
                      }
                      submittedAt
                      createdAt
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);

    return response.search.edges.map((edge) => {
      return new PullRequest(edge.node);
    });
  }
}