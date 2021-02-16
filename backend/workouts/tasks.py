from huey import crontab
from huey.contrib.djhuey import db_periodic_task, db_task
from workouts.models import WeeklyLeaderboardPosition, MonthlyLeaderboardPosition, YearlyLeaderboardPosition

@db_periodic_task(crontab(minute='0', hour='0', day='1', month='1'))
def every_year():
    YearlyLeaderboardPosition.objects.all().delete()

@db_periodic_task(crontab(minute='0', hour='0', day='1'))
def every_month():
    MonthlyLeaderboardPosition.objects.all().delete()

@db_periodic_task(crontab(minute='0', hour='0', day_of_week='1'))
def every_week():
    WeeklyLeaderboardPosition.objects.all().delete()