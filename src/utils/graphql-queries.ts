import { githubArgs } from './env';

export function singlePullRequest(number: number): string {
  let { repo, owner } = githubArgs();
  return `
  {
    repository(name: "${repo}", owner: "${owner}") {
      pullRequest(number: ${number}) {
        mergedAt
        merged
        createdAt
        id
        number
        baseRefName
        author {
          login
        }
        timelineItems(first: 100, itemTypes: [PULL_REQUEST_REVIEW, REVIEW_REQUESTED_EVENT, READY_FOR_REVIEW_EVENT, CONVERT_TO_DRAFT_EVENT, REOPENED_EVENT, MERGED_EVENT]) {
          nodes {
            __typename
            ... on PullRequestReview {
              createdAt
              author {
                login
              }
              state
            }
            ... on ReviewRequestedEvent {
              createdAt
              actor {
                login
              }
            }
            ... on ReadyForReviewEvent {
              createdAt
              actor {
                login
              }
            }
            ... on MergedEvent {
              createdAt
            }
            ... on ConvertToDraftEvent {
              createdAt
            }
            ... on ReopenedEvent {
              createdAt
            }
          }
        }
      }
    }
  }
   
  `;
}