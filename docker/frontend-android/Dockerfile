FROM node:10
ENV VERSION 27

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --production

COPY . .
RUN npm run build-android

