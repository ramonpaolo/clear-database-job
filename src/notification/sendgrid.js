import sendgrid from '@sendgrid/mail';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { cwd } from 'process';

const { SENDGRID_API_KEY, APP_NAME, FROM_EMAIL, TO_EMAIL, } = process.env;

sendgrid.setApiKey(SENDGRID_API_KEY);

/**
 * @typedef {{deleted_documents: number, start_time: number, end_time: number, query: object}} Info
 */

/**
 * @param {'error'|'success'|'info'} type
 * @param {Info} info
 * @description Function to select the template to mount to send the email
 * @returns {void}
 */
const main = async (type, info) => {
  let html = selectTemplate(type)

  const tags = [
    ['NAME_JOB', APP_NAME],
    ['FINALIZED_TIME', new Date().toISOString()],
    ['DELETED_DOCUMENTS', info.deleted_documents],
    ['ELAPSED_TIME', (info.start_time - info.end_time).toFixed(2)],
    ['QUERY', JSON.stringify(info.query, {}, 2)],
  ];

  tags.map(([tag, value]) => {
    html = html.replace(`{{ ${tag} }}`, `${value}`)
  })

  await sendEmail(html);
}

const sendEmail = async html => {
  await sendgrid.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: 'Job',
    html,
  }, false)
}

/**
 * @param {'error'|'success'|'info'} type
 * @description Function to select the template to send the email
 * @returns {string}
 */
const selectTemplate = (type) => {
  const path = resolve(cwd(), 'templates', 'sendgrid', `${type}.html`)

  return readFileSync(path).toString()
}

export default main
