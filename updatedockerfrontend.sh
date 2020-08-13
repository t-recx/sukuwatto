#!/bin/bash

git pull &&
docker-compose down &&
docker volume rm sqtrex_frontend-android_data &&
docker volume rm sqtrex_frontend_data &&
docker-compose build frontend &&
docker-compose build frontend-android &&
docker-compose up -d
