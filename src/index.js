import { MongoClient } from 'mongodb';
import {
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subSeconds,
  subYears,
} from 'date-fns';
import process from 'node:process';

try {
  process.loadEnvFile();
} catch (error) { /* empty */ }

const {
  APP_NAME,
  MONGO_URL,
  DATABASE_NAME,
  COLLECTION_NAME,
  FIELD_DATE,
  OPTIONAL_QUERIES,
  EXECUTE_WHEN_INIT,
  EXECUTE_TIME_UNIT,
  EXECUTE_EVERY_TIME,
  DELETE_DOCUMENTS,
  NODE_ENV,
  NOTIFICATION_PROVIDER,
} = process.env;

const field = FIELD_DATE || 'created_at';
const optionalQueries = OPTIONAL_QUERIES ? JSON.parse(OPTIONAL_QUERIES) : {};

/**
 * @param {number} time - The quantity of time to sub(e.g. 1(days), 10(days))
 * @default time = 60
 * @param {Unit} unit - Unit of time(e.g. seconds, minutes...)
 * @default unit = 'minutes'
 */
export const createConfcronJob = (time = 60, unit = 'minutes') => {
  return {
    unit,
    time,
  };
};

/**
 * @param {Unit} unit 
 * @description Used to transform the time received in 
 * milliseconds to set the cronjob 
 * @private
 */
export const transformUnitToMilliseconds = (unit) => {
  const second = 1_000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = month * 12;

  switch (unit) {
  case 'seconds':
    return second;
  case 'minutes':
    return minute;
  case 'hours':
    return hour;
  case 'days':
    return day;
  case 'months':
    return month;
  case 'years':
    return year;
  default:
    throw Error(`Invalid time unit '${unit}'!`);
  }
};

/**
 * @typedef {
 * "seconds" | "minutes" | "hours" | "days" | "months" | "years" | undefined
 * } Unit
 */

/**
 * @param {Unit} unit 
 * @returns {Function}
 */
export const chooseWhatSub = (unit) => {
  switch (unit) {
  case 'seconds':
    return subSeconds;
  case 'minutes':
    return subMinutes;
  case 'hours':
    return subHours;
  case 'days':
    return subDays;
  case 'months':
    return subMonths;
  case 'years':
    return subYears;
  default:
    throw Error(`Invalid time unit '${unit}'!`);
  }
};

/**
 * @param {Unit} unit - Unit of time(e.g. seconds, minutes...)
 * @param {number} time - The quantity of time to sub(e.g. 1(days), 10(days))
 * @param {Date} timeNow - The time now
 * @returns {Date}
 */
export const subDate = (unit, time, timeNow) => {
  const sub = chooseWhatSub(unit);

  return sub(timeNow, time);
};

/**
 * @param {Unit} unit 
 * @param {Number} time 
 * @description Used to query and delete the matched documents
 */
async function runQuery(unit, time) {
  console.log('Initing CronJob!');

  const dateNow = new Date();
  const deleteBefore = subDate(unit, time, dateNow);

  const info = {
    deleted_documents: 0,
    start_time: process.uptime(),
    end_time: 0,
    query: {
      [field]: { $lte: deleteBefore.toISOString() },
      ...optionalQueries,
    },
    error: undefined,
  };

  console.log('Date now:', dateNow.toISOString());
  console.log(
    'Delete documents when the date is equal or less than: ',
    deleteBefore.toISOString()
  );

  try {
    const client =
      await MongoClient.connect(String(MONGO_URL), { appName: APP_NAME, });

    console.log('Connected to MongoDB with success!');

    const db = client.db(DATABASE_NAME);

    const collection = db.collection(COLLECTION_NAME);

    console.log('Query that will be used:');
    console.log(info.query);

    const documents = await collection.countDocuments(info.query);
    console.log('Quantity of documents found: ', documents);

    if (DELETE_DOCUMENTS === 'true') {
      info.deleted_documents =
        (await collection.deleteMany(info.query)).deletedCount;
      console.log('Quantity of documents deleted: ', info.deleted_documents);
    }

    await client.close();

    info.end_time = process.uptime();

    console.info(info);

    if (NOTIFICATION_PROVIDER) {
      (await import(`./notification/${NOTIFICATION_PROVIDER.toLowerCase()}.js`))
        .main('success', info);
    }
  } catch (err) {
    console.error(err);

    info.end_time = info.end_time ? info.end_time : process.uptime();
    info.error = err;

    if (NOTIFICATION_PROVIDER) {
      (await import(`./notification/${NOTIFICATION_PROVIDER.toLowerCase()}.js`))
        .main('error', info);
    }
  }
}

const cronJobSettings =
  createConfcronJob(EXECUTE_EVERY_TIME, EXECUTE_TIME_UNIT);

const milliseconds = transformUnitToMilliseconds(cronJobSettings.unit);
const durationInMillis = milliseconds * cronJobSettings.time;

console.log(
  // eslint-disable-next-line max-len
  `CronJob seted to execute every ${cronJobSettings.time} ${cronJobSettings.unit}!`
);

if (NODE_ENV !== 'test') {
  if (EXECUTE_WHEN_INIT === 'true') {
    setTimeout(() => runQuery(cronJobSettings.unit, cronJobSettings.time), 0);
  }
  setInterval(() =>
    runQuery(cronJobSettings.unit, cronJobSettings.time),
  durationInMillis
  );
}
