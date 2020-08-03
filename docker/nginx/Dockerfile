FROM nginx:1.17.4-alpine
ENV REFRESHED_AT 2020-06-18

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
