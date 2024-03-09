import { describe, it } from "node:test";
import fs from 'node:fs/promises'
import { resolve } from "node:path";
import { cwd } from "node:process";
import { doesNotThrow, ok, strict } from "node:assert";

import sendgrid from '@sendgrid/mail';

import { main, selectTemplate } from "../../notification/sendgrid.js";

const provider = "sendgrid";
const providerTitle = "Sendgrid";

describe(providerTitle, () => {
  describe('Templates', () => {
    const pathTemplateDir = resolve(cwd(), 'templates', provider);

    it(`the total of template inside ${provider} need be 1`, async () => {
      const files = await fs.readdir(pathTemplateDir)

      strict(files.length, 1)
    })

    const templates = ['success.html'];

    templates.map((template) =>
      it(`template '${template}' need exists inside ${provider}`, async () => {
        doesNotThrow(async () => await fs.statfs(resolve(pathTemplateDir, template)), {
          name: 'ENOTDIR',
          message: 'no such file or directory'
        })
      })
    )

    templates.map((template) =>
      it(`read the template '${template}' with success`, async () => {
        const expectedFile = (await fs.readFile(resolve(pathTemplateDir, template))).toString()
        const receivedFile = selectTemplate(template.split('.')[0])

        strict(receivedFile.length, expectedFile.length)
        strict(receivedFile, expectedFile)
      })
    )
  })

  describe('Replace Data', () => {
    it('mount the template with data', async (t) => {
      const info = {
        deleted_documents: 0,
        start_time: process.uptime(),
        end_time: process.uptime() + 1_000,
        query: {
          created_at: new Date().toISOString(),
        },
      };

      const tracker = t.mock.method(sendgrid, 'send', () => { })

      await main('success', info);

      strict(tracker.mock.callCount(), 1)
      ok(tracker.mock.calls[0].arguments[0].html.includes(`<strong>${info.deleted_documents}</strong>`))
      ok(tracker.mock.calls[0].arguments[0].html.includes(`<strong>${(info.end_time - info.start_time).toFixed(2)}</strong>`))
      ok(tracker.mock.calls[0].arguments[0].html.includes(`<code>${JSON.stringify(info.query, {}, 2)}</code>`))
    })
  })
})