import sendgrid from '@sendgrid/mail';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { cwd } from 'process';

const { SENDGRID_API_KEY, APP_NAME, FROM_EMAIL, TO_EMAIL, } = process.env;

sendgrid.setApiKey(SENDGRID_API_KEY);

/**
 * @param {'error'|'success'|'info'} type
 * @description Function to select the template to send the email
 * @returns {string}
 */
export const selectTemplate = (type) => {
  const path = resolve(cwd(), 'templates', 'sendgrid', `${type}.html`);

  return readFileSync(path).toString();
};

export const sendEmail = async html => {
  await sendgrid.send({
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject: 'Job',
    html,
  }, false);
};

/**
 * @typedef { {
 *  deleted_documents: number,
 *  start_time: number,
 *  end_time: number,
 *  query: object,
 *  error: Error | undefined,
 * } } Info
 */

/**
 * @param {'error'|'success'|'info'} type
 * @param {Info | undefined} info
 * @description Function to select the template to mount to send the email
 * @returns {void}
 */
export const main = async (type, info) => {
  let html = selectTemplate(type);

  const tags = [
    ['NAME_JOB', APP_NAME],
    ['FINALIZED_TIME', new Date().toISOString()],
    // eslint-disable-next-line no-magic-numbers
    ['ELAPSED_TIME', (info.end_time - info.start_time).toFixed(2)],
    ['DELETED_DOCUMENTS', info.deleted_documents],
    // eslint-disable-next-line no-magic-numbers
    ['QUERY', JSON.stringify(info.query, {}, 2)],
  ];

  if (type === 'error') {
    tags.push(['STACK_ERROR', info.error]);
  }

  tags.map(([tag, value]) => {
    html = html.replace(`{{ ${tag} }}`, `${value}`);
  });

  await sendEmail(html);
};
