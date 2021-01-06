FROM node:10
ENV VERSION 24

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --production

COPY . .
RUN npm run build

