FROM node:10
ENV VERSION 10

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

