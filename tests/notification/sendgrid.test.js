import { describe, it } from 'node:test';
import fs from 'node:fs/promises';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { doesNotThrow, equal, ok } from 'node:assert';
import { MongoClient } from 'mongodb';

import sendgrid from '@sendgrid/mail';

import { main, selectTemplate } from '../../src/notification/sendgrid.js';

const provider = 'sendgrid';
const providerTitle = 'Sendgrid';

describe(providerTitle, () => {
  describe('Templates', () => {
    const pathTemplateDir = resolve(cwd(), 'templates', provider);
    const templates = ['success.html', 'error.html'];

    it(`the total of template inside ${provider} need be 2`, async () => {
      const files = await fs.readdir(pathTemplateDir);

      equal(files.length, 2);
    });

    templates.map((template) =>
      it(`template '${template}' need exists inside ${provider}`, async () => {
        doesNotThrow(async () =>
          await fs.statfs(resolve(pathTemplateDir, template)), {
          name: 'ENOTDIR',
          message: 'no such file or directory'
        });
      })
    );

    templates.map((template) =>
      it(`read the template '${template}' with success`, async () => {
        const expectedFile =
          (await fs.readFile(resolve(pathTemplateDir, template))).toString();
        const receivedFile = selectTemplate(template.split('.')[0]);

        equal(receivedFile.length, expectedFile.length);
        equal(receivedFile, expectedFile);
      })
    );
  });

  describe('Replace Data', () => {
    // eslint-disable-next-line max-len
    it('mount the template of type \'success\' with correct data', async (t) => {
      const info = {
        deleted_documents: 0,
        start_time: process.uptime(),
        end_time: process.uptime() + 1_000,
        query: {
          created_at: new Date().toISOString(),
        },
      };

      const tracker = t.mock.method(sendgrid, 'send', () => { });

      await main('success', info);

      equal(tracker.mock.callCount(), 1);

      const html = tracker.mock.calls[0].arguments[0].html;

      ok(html.includes(`<strong>${info.deleted_documents}</strong>`));
      ok(html.includes(
        `<strong>${(info.end_time - info.start_time).toFixed(2)}</strong>`
      ));
      ok(html.includes(`<code>${JSON.stringify(info.query, {}, 2)}</code>`));
    });

    it('mount the template of type \'error\' with correct data', async (t) => {
      const info = {
        deleted_documents: 0,
        start_time: process.uptime(),
        end_time: process.uptime() + 1_000,
        query: {
          created_at: new Date().toISOString(),
        },
        error: new Error('Fake Error')
      };

      const tracker = t.mock.method(sendgrid, 'send', () => { });
      t.mock.method(MongoClient, 'connect', () => { new Error('Fake Error'); });

      await main('error', info);

      equal(tracker.mock.callCount(), 1);

      const html = tracker.mock.calls[0].arguments[0].html;

      ok(html.includes(`<strong>${info.deleted_documents}</strong>`));
      ok(html.includes(
        `<strong>${(info.end_time - info.start_time).toFixed(2)}</strong>`
      ));
      ok(html.includes(`<code>${JSON.stringify(info.query, {}, 2)}</code>`));
      ok(html.includes(`<code>${info.error}</code>`));
    });
  });
});