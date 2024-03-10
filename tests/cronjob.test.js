/* eslint-disable no-magic-numbers */
// TODO(ramon): fix the eslint in future

import { strict } from 'node:assert';
import { describe, it } from 'node:test';

import {
  createConfcronJob,
  transformUnitToMilliseconds,
} from '../src/index.js';

describe('CronJob', () => {
  it('set cronjob with default values', () => {
    const cronJobReceived = createConfcronJob();

    strict.strictEqual(cronJobReceived.time, 60);
    strict.strictEqual(cronJobReceived.unit, 'minutes');
  });

  it('transform seconds unit into milliseconds', () => {
    const cronJob = {
      time: 1,
      unit: 'seconds',
    };

    const milliseconds = transformUnitToMilliseconds(cronJob.unit);

    strict.equal(milliseconds, 1000);
  });

  it('transform minutes unit into milliseconds', () => {
    const cronJob = {
      time: 1,
      unit: 'minutes',
    };

    const milliseconds = transformUnitToMilliseconds(cronJob.unit);

    strict.equal(milliseconds, 1000 * 60);
  });

  it('transform hours unit into milliseconds', () => {
    const cronJob = {
      time: 1,
      unit: 'hours',
    };

    const milliseconds = transformUnitToMilliseconds(cronJob.unit);

    strict.equal(milliseconds, (1000 * 60) * 60);
  });

  it('transform days unit into milliseconds', () => {
    const cronJob = {
      time: 1,
      unit: 'days',
    };

    const milliseconds = transformUnitToMilliseconds(cronJob.unit);

    strict.equal(milliseconds, ((1000 * 60) * 60) * 24);
  });

  it('transform months unit into milliseconds', () => {
    const cronJob = {
      time: 1,
      unit: 'months',
    };

    const milliseconds = transformUnitToMilliseconds(cronJob.unit);

    strict.equal(milliseconds, (((1000 * 60) * 60) * 24) * 30);
  });

  it('transform years unit into milliseconds', () => {
    const cronJob = {
      time: 1,
      unit: 'years',
    };

    const milliseconds = transformUnitToMilliseconds(cronJob.unit);

    strict.equal(milliseconds, ((((1000 * 60) * 60) * 24) * 30) * 12);
  });
});
