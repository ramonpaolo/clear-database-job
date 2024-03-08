FROM node:21.7.0-alpine

WORKDIR /app

EXPOSE 3000

COPY ./package.json ./yarn.lock ./

RUN yarn

COPY ./ ./

CMD ["yarn", "dev"]