#!/bin/bash
git pull && sudo docker-compose down && sudo docker-compose up -d --build && sudo docker-compose exec wsgi python manage.py migrate --noinput

echo '-----------------------------------------------------'
echo '                     All done!                       '
echo '-----------------------------------------------------'
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