#!/bin/sh

if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $SQL_HOST $SQL_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

echo "Waiting for huey db..."

while ! nc -z $HUEY_HOST $HUEY_PORT; do
  sleep 0.1
done

echo "Huey db started"

echo "Waiting for channels db..."

while ! nc -z $CHANNELS_HOST $CHANNELS_PORT; do
  sleep 0.1
done

echo "Channels db started"

exec "$@"