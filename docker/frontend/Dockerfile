FROM node:10
ENV VERSION 104

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build
RUN npm run build-android

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
