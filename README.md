# Clear Job

## What is this?

This project is made in NodeJs(JavaScript), to execute a cronjob to delete the documents in MongoDB or ScyllaDB, that match with the queries!

## Why this project exists?

This project exists to help the developers or Database Admins, to have another way to delete old documents, that is not more necessary!

In TTL, the document is deleted when the value of indexed field is more old than the current date!

Example:
```javascript
WebhookSchema = {
  event: {
    type: String,
  },
  body: {
    type: Object,
  }
  created_at: {
    type: Date,
    expiryAfterInSeconds: 3600, // 1 Hour
  },
}
// ...

console.log(Webhook.findOne({}))
// Output
{
  event: 'paid',
  body: {
    ...
  }
  created_at: '2024-03-01T16:23:19.655Z',
}
```

To this document be deleted in future, the current date need to be `2024-03-01T17:23:19.655Z` or more new, like `2024-03-01T17:30:19.655Z`!

But, if you need delete the document, when another rule is need to be true, you will use this project! 

## Technologies
This project is made in NodeJs(LTS), and use the MongoDB(official driver) to connect and delete the specified documents!

## How use
To use this project, you need to clone this, running the following command:

```bash
git clone https://github.com/ramonpaolo/clear-job
```
Before up the project, you may need to configure the [.env](.env)! You may need to rename the [.env.example](.env.example) to `.env`!

Afther cofngiure the `.env`, you can run the docker-compose, or the [script.sh](script.sh), to up the cronjob and the mongodb for tests!

## What is each environment variable

| Environment Variable | Type   | Required | Example                     | Possible Values                                          | Default Value |
| -------------------- | ------ | -------- | --------------------------- | -------------------------------------------------------- | ------------- |
| PROJECT_NAME         | String | Yes      | "cronjob"                   | *                                                        |               |
| APP_NAME             | String | Yes      | "cronjob"                   | *                                                        |               |
| NODE_ENV             | String | No       | "development"               | *                                                        |               |
| EXECUTE_WHEN_INIT    | String | No       | "true"                      | "true", "false"                                          | "false"       |
| EXECUTE_EVERY_TIME   | Number | No       | 5                           | *                                                        | 60            |
| EXECUTE_TIME_UNIT    | String | No       | "seconds"                   | "seconds", "minutes", "hours", "days", "months", "years" | "minutes"     |
| MONGO_PASSWORD       | String | No       | "test"                      | *                                                        |               |
| MONGO_USERNAME       | String | No       | "test"                      | *                                                        |               |
| MONGO_URL            | String | Yes      | "mongodb://test:test@mongo" | *                                                        |               |
| DATABASE_NAME        | String | Yes      | "Test"                      | *                                                        |               |
| COLLECTION_NAME      | String | Yes      | "webhooks"                  | *                                                        |               |
| FIELD_DATE           | String | Yes      | "created_at"                | *                                                        |               |
| OPTIONAL_QUERIES     | String | No       | "{"env": "development"}"    | *                                                        | "{}"          |