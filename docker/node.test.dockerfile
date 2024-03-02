FROM node:alpine

WORKDIR /app

ENV NODE_ENV test

COPY ./package.json ./yarn.lock ./

RUN yarn

COPY ./ ./
