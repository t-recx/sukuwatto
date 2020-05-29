FROM node:10 
ENV REFRESHED_AT 2020-05-29

WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

