#!/bin/bash
git pull && sudo docker-compose down && sudo docker volume rm sqtrex_frontend-android_data && sudo docker volume rm sqtrex_frontend_data && sudo docker-compose up -d --build && sudo docker-compose exec wsgi python manage.py migrate --noinput

echo '-----------------------------------------------------'
echo '                     All done!                       '
echo '-----------------------------------------------------'
echo ''
echo 'Periodic tasks:'
echo '* Do not forget periodic tasks on huey run on minute=0 and hour=0 of certain days, if updating during that time they might need to be re-run manually'
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