/** @jest-environment setup-polly-jest/jest-environment-node */

import { loadPullRequest } from '../../src/models/pull-request';
import setupPolly from '../setup-polly';

describe('model: PullRequest', () => {
  setupPolly();

  describe('timeToMerge', () => {
    for (let prData of [
      { number: 1, description: 'simple', timeToMerge: 361000 },
      { number: 2, description: 'opened as draft first', timeToMerge: 93000 },
      { number: 3, description: 'reopened', timeToMerge: 309000 },
    ]) {
      test(`PR: ${prData.description}`, async () => {
        let pr = await loadPullRequest(prData.number);

        expect(pr.timeToMerge && pr.timeToMerge.toObject()).toStrictEqual({
          milliseconds: prData.timeToMerge,
        });
      });
    }
  });
});
