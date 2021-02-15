FROM node:10
ENV VERSION 39

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
