FROM nginx:stable-alpine
ENV VERSION 14 

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
