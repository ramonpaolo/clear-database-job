import { strict } from 'node:assert';
import { describe, it } from 'node:test';

import { subDate } from '../src/index.js';

describe('Date', () => {
  describe('Sub Date', () => {
    it('should sub the received date by 1 second with success', () => {
      const timeString = '2024-03-01T00:22:12.056Z';

      const timeStringInDate = new Date(timeString);

      const receivedDate = subDate('seconds', 1, timeStringInDate);

      const timeStringExpected = '2024-03-01T00:22:11.056Z';

      strict.equal(receivedDate.toISOString(), timeStringExpected);
    });

    it('should sub the received date by 20 minute with success', () => {
      const timeString = '2024-03-01T00:32:12.056Z';

      const timeStringInDate = new Date(timeString);

      const receivedDate = subDate('minutes', 20, timeStringInDate);

      const timeStringExpected = '2024-03-01T00:12:12.056Z';

      strict.equal(receivedDate.toISOString(), timeStringExpected);
    });

    it('should sub the received date by 2 hours with success', () => {
      const timeString = '2024-03-01T00:32:12.056Z';

      const timeStringInDate = new Date(timeString);

      const receivedDate = subDate('hours', 2, timeStringInDate);

      const timeStringExpected = '2024-02-29T22:32:12.056Z';

      strict.equal(receivedDate.toISOString(), timeStringExpected);
    });

    it('should sub the received date by 3 days with success', () => {
      const timeString = '2024-03-01T00:32:12.056Z';

      const timeStringInDate = new Date(timeString);

      const receivedDate = subDate('days', 3, timeStringInDate);

      const timeStringExpected = '2024-02-27T00:32:12.056Z';

      strict.equal(receivedDate.toISOString(), timeStringExpected);
    });

    it('should sub the received date by 1 months with success', () => {
      const timeString = '2024-02-01T00:32:12.056Z';

      const timeStringInDate = new Date(timeString);

      const receivedDate = subDate('months', 1, timeStringInDate);

      const timeStringExpected = '2024-01-01T00:32:12.056Z';

      strict.equal(receivedDate.toISOString(), timeStringExpected);
    });

    it('should sub the received date by 1 years with success', () => {
      const timeString = '2024-03-01T00:32:12.056Z';

      const timeStringInDate = new Date(timeString);

      const receivedDate = subDate('years', 1, timeStringInDate);

      const timeStringExpected = '2023-03-01T00:32:12.056Z';

      strict.equal(receivedDate.toISOString(), timeStringExpected);
    });
  });
});
