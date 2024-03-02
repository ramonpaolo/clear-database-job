import { after, before, beforeEach, describe, it, mock } from "node:test";
import { MongoClient } from "mongodb";
import fs from 'fs/promises'
import path from "path";
import { equal } from "assert";

const { MONGO_URL, DATABASE_NAME, COLLECTION_NAME } = process.env

import { runQuery } from "../index.js";

describe('Job', () => {
  describe('Execute job with success', () => {
    let client;
    let quantityDocumentsAvailable = 0;
    let data;

    before(async () => {
      const file = await fs.readFile(`${path.resolve('src', 'tests', 'data.json')}`, {
        encoding: 'utf-8'
      })

      data = JSON.parse(file)
      quantityDocumentsAvailable = data.length

      const connection = await MongoClient.connect(MONGO_URL, {
        appName: 'test',
      })

      const db = connection.db(DATABASE_NAME)
      client = db.collection(COLLECTION_NAME)
    }, {
      timeout: 2000,
    })

    beforeEach(async () => {
      await client.deleteMany({})
      await client.insertMany(data);

      mock.timers.reset();
    }, {
      timeout: 1000,
    })

    after(async () => {
      await client.drop()
    }, {
      timeout: 1000,
    })

    it('delete all documents in collection', async () => {
      mock.timers.enable({
        apis: ["Date"],
        now: Date.parse('2024-03-24T02:24:00'),
      })

      await runQuery('seconds', 0)

      const remainingDocuments = await client.countDocuments()

      equal(remainingDocuments, 0)
    })

    it('delete all documents in collection that field \'created_at\' is equal or less than \'2024-02-24T02:24:00\'', async () => {
      mock.timers.enable({
        apis: ["Date"],
        now: Date.parse('2024-02-24T02:24:00'),
      })

      await runQuery('seconds', 0)

      const remainingDocuments = await client.countDocuments()

      equal(remainingDocuments, 5)
    })

    it('delete all documents in collection that field \'created_at\' is equal or less than \'2024-01-24T00:00:00\'', async () => {
      mock.timers.enable({
        apis: ["Date"],
        now: Date.parse('2022-01-24T00:00:00'),
      })

      await runQuery('seconds', 0)

      const remainingDocuments = await client.countDocuments()

      equal(remainingDocuments, quantityDocumentsAvailable)
    })
  })
})