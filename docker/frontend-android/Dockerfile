FROM node:15
ENV VERSION 26

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build-android

