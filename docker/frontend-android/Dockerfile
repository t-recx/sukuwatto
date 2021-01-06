FROM node:15
ENV VERSION 25

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --production

COPY . .
RUN npm run build-android

