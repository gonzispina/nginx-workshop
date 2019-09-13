FROM node:10.15-alpine

LABEL maintainer="Gonzalo Spina <gspina1995@gmail.com>"

ENV TZ=America/Argentina/Buenos_Aires

ARG NODE_ENV=development

WORKDIR /usr/local/app

COPY package*.json ./
RUN npm install --unsafe-perm

COPY . .

CMD node server.js
