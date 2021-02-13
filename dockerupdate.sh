#!/bin/bash
sudo sh -c 'git pull && docker-compose down && docker volume rm sqtrex_frontend-android_data && docker volume rm sqtrex_frontend_data && docker-compose up -d --build && docker-compose exec wsgi python manage.py migrate --noinput'

echo 'All done!'
echo ''
echo 'Other actions you may want to do now:'
echo '# Seed data:'
echo 'sudo docker-compose exec wsgi python manage.py loaddata <fixture>'
echo ''
echo '# See running processes:'
echo 'sudo docker-compose ps'
echo ''
echo '# See logs:'
echo 'sudo docker-compose logs'
