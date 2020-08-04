FROM node:10
ENV REFRESHED_AT 2020-06-20
ENV FRONTEND PRODUCTION

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

