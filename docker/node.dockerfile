FROM node:16.20-alpine AS appbuild

WORKDIR /app

COPY ./ ./

RUN yarn build

# ---------

FROM node:16.20-alpine AS apptest

WORKDIR /app

COPY --from=appbuild /app ./

RUN yarn test:docker

# ---------

FROM node:16.20-alpine

WORKDIR /app

EXPOSE 3000

COPY --from=apptest /app/dist ./dist
COPY --from=apptest /app/package.json /app/yarn.lock /.env ./

RUN yarn install --production

USER node

CMD ["yarn", "start"]