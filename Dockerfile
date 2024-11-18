FROM node:18-alpine

RUN mkdir /auth

COPY ./package.json /auth

WORKDIR /auth

RUN npm install

