FROM node:10
ENV VERSION 17

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

