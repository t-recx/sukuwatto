import datetime
from decimal import Decimal
from workouts.models import Workout, WorkoutGroup, WorkoutSet, WorkoutWarmUp, SkillExercise, UserSkill, Unit, Exercise, WeeklyLeaderboardPosition, YearlyLeaderboardPosition, MonthlyLeaderboardPosition, AllTimeLeaderboardPosition
from django.db.models import Max, F, Q
from django.db.models.expressions import Window
from django.contrib.auth import get_user_model
from math import floor

class RankService():
    def delete_rank_records_model(self, model, user):
        position = model.objects.filter(user=user).first()

        if position is not None:
            rank_exists_other_records = self.get_rank_for_experience(model, position) is not None

            if not rank_exists_other_records:
                self.adjust_ranks(model, position, position.rank, self.get_lowest_rank(model, position), -1) 

            position.delete()

    def delete_rank_records(self, user):
        self.delete_rank_records_model(WeeklyLeaderboardPosition, user)
        self.delete_rank_records_model(MonthlyLeaderboardPosition, user)
        self.delete_rank_records_model(YearlyLeaderboardPosition, user)
        self.delete_rank_records_model(AllTimeLeaderboardPosition, user)

    def adjust_ranks(self, model, position, from_rank, to_rank, adjustment):
        queryset = model.objects.exclude(pk=position.pk)

        if from_rank is not None:
            queryset = queryset.filter(rank__gte=from_rank)

        if to_rank is not None:
            queryset = queryset.filter(rank__lte=to_rank)
        
        queryset.update(rank=F('rank')+adjustment)

    def get_rank_for_experience(self, model, position):
        position_same_experience = model.objects.exclude(pk=position.pk).filter(rank__isnull=False, experience=position.experience).first()

        if position_same_experience is None:
            return None

        return position_same_experience.rank

    def get_first_record_with_more_experience(self, model, position):
        return model.objects.exclude(pk=position.pk).filter(rank__isnull=False, experience__gt=position.experience).order_by('experience').first()

    def exists_less_experienced_records(self, model, position):
        return model.objects.exclude(pk=position.pk).filter(rank__isnull=False, experience__lt=position.experience).exists()

    def get_lowest_rank(self, model, position):
        return model.objects.exclude(pk=position.pk).filter(rank__isnull=False).aggregate(Max('rank'))['rank__max']

    def no_records_with_rank(self, model, position):
        return not model.objects.exclude(pk=position.pk).filter(rank__isnull=False).exists()

    def another_record_on_rank(self, model, position, rank):
        return model.objects.exclude(pk=position.pk).filter(rank=rank).exists()

    def rank_records(self, model, position):
        previous_rank = position.rank
        new_rank = None

        if self.no_records_with_rank(model, position):
            new_rank = 1
        else:
            rank_with_same_experience = self.get_rank_for_experience(model, position)

            if rank_with_same_experience is not None:
                if previous_rank is None:
                    new_rank = rank_with_same_experience
                else:
                    if rank_with_same_experience > previous_rank:
                        if not self.another_record_on_rank(model, position, previous_rank):
                            self.adjust_ranks(model, position, previous_rank, None, -1)
                            new_rank = rank_with_same_experience - 1
                        else:
                            new_rank = rank_with_same_experience
                    elif previous_rank > rank_with_same_experience:
                        if not self.another_record_on_rank(model, position, previous_rank):
                            self.adjust_ranks(model, position, previous_rank, None, -1)
                            new_rank = rank_with_same_experience
                        else:
                            new_rank = rank_with_same_experience
                    else:
                        new_rank = rank_with_same_experience
            else:
                first_record_with_more_experience = self.get_first_record_with_more_experience(model, position)

                if first_record_with_more_experience is not None:
                    if previous_rank is None:
                        new_rank = first_record_with_more_experience.rank + 1
                        self.adjust_ranks(model, position, new_rank, None, 1)
                    elif previous_rank > first_record_with_more_experience.rank:
                        new_rank = first_record_with_more_experience.rank + 1
                        if self.another_record_on_rank(model, position, previous_rank):
                            self.adjust_ranks(model, position, new_rank, None, 1)
                    elif first_record_with_more_experience.rank > previous_rank:
                        new_rank = first_record_with_more_experience.rank
                        self.adjust_ranks(model, position, previous_rank, new_rank, -1)
                    elif first_record_with_more_experience.rank == previous_rank:
                        new_rank = first_record_with_more_experience.rank + 1
                        self.adjust_ranks(model, position, new_rank, None, 1)
                else:
                    new_rank = 1

                    if not self.another_record_on_rank(model, position, previous_rank):
                        self.adjust_ranks(model, position, 1, previous_rank, 1)
                    else:
                        self.adjust_ranks(model, position, 1, None, 1)

        if new_rank is not None and new_rank != previous_rank:
            position.rank = new_rank
            position.save()