from rest_framework import status
from rest_framework.test import APIRequestFactory
from django.test import TestCase
from workouts.models import WeeklyLeaderboardPosition, YearlyLeaderboardPosition, MonthlyLeaderboardPosition, AllTimeLeaderboardPosition
from workouts.rank_service import RankService
from sqtrex.tests import UserTestCaseMixin

class RankServiceTestCase(UserTestCaseMixin, TestCase):
    def setUp(self):
        self.rank_service = RankService()

        self.user1 = self.create_user({'username': 'one', 'password':'pass', 'email': 'one@o.org'})
        self.user2 = self.create_user({'username': 'two', 'password':'pass', 'email': 'two@o.org'})
        self.user3 = self.create_user({'username': 'three', 'password':'pass', 'email': 'three@o.org'})
        self.user4 = self.create_user({'username': 'four', 'password':'pass', 'email': 'four@o.org'})
        self.user5 = self.create_user({'username': 'five', 'password':'pass', 'email': 'five@o.org'})
        self.user6 = self.create_user({'username': 'six', 'password':'pass', 'email': 'six@o.org'})

        self.one = WeeklyLeaderboardPosition.objects.create(experience=1000, user=self.user1)
        self.two = WeeklyLeaderboardPosition.objects.create(experience=500, user=self.user2)
        self.three = WeeklyLeaderboardPosition.objects.create(experience=250, user=self.user3)
        self.four = WeeklyLeaderboardPosition.objects.create(experience=100, user=self.user6)
        self.another_one = WeeklyLeaderboardPosition.objects.create(experience=1000, user=self.user4)
        self.another_two = WeeklyLeaderboardPosition.objects.create(experience=500, user=self.user5)

    def reload_models(self):
        self.one = WeeklyLeaderboardPosition.objects.filter(pk=self.one.pk).first()
        self.two = WeeklyLeaderboardPosition.objects.filter(pk=self.two.pk).first()
        self.three = WeeklyLeaderboardPosition.objects.filter(pk=self.three.pk).first()
        self.four = WeeklyLeaderboardPosition.objects.filter(pk=self.four.pk).first()
        self.another_one = WeeklyLeaderboardPosition.objects.filter(pk=self.another_one.pk).first()
        self.another_two = WeeklyLeaderboardPosition.objects.filter(pk=self.another_two.pk).first()

    def test_rank_records_when_first_record_should_get_first_place(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)

    def test_rank_records_when_inserting_record_with_lower_experience_should_get_place_below(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.two.rank, 2)

    def test_rank_records_when_inserting_record_with_higher_experience_should_get_place_above(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)

        self.assertEqual(self.two.rank, 1)
        
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.two.rank, 2)

    def test_rank_records_when_inserting_record_with_same_experience_should_get_same_rank(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.another_one)

        self.reload_models()
        
        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.another_one.rank, 1)

    def test_rank_records_when_lowering_experience_of_already_ranked_position_should_update_correctly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)

        self.reload_models()

        self.one.experience = self.two.experience / 2;
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)

        self.reload_models()

        self.assertEqual(self.two.rank, 1)
        self.assertEqual(self.one.rank, 2)

    def test_rank_records_when_increasing_experience_of_already_ranked_position_should_update_correctly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)

        self.reload_models()

        self.two.experience = self.one.experience * 2;
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)

        self.reload_models()

        self.assertEqual(self.two.rank, 1)
        self.assertEqual(self.one.rank, 2)

    def test_rank_records_when_lowering_experience_of_already_ranked_position_sharing_rank_with_another_should_update_correctly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.another_one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.another_one.rank, 1)
        self.assertEqual(self.two.rank, 2)

        self.another_one.experience = self.two.experience + 1
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.another_one)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.another_one.rank, 2)
        self.assertEqual(self.two.rank, 3)

    def test_rank_records_when_increasing_experience_of_already_ranked_position_sharing_rank_with_another_should_update_correctly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.another_two)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.another_two.rank, 2)
        self.assertEqual(self.two.rank, 2)

        self.another_two.experience = self.two.experience + 1
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.another_two)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.another_two.rank, 2)
        self.assertEqual(self.two.rank, 3)

    def test_rank_records_when_lowering_experience_of_already_ranked_position_sharing_rank_with_another_matching_another_rank_should_update_correctly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.another_one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.another_one.rank, 1)
        self.assertEqual(self.two.rank, 2)

        self.another_one.experience = self.two.experience
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.another_one)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.another_one.rank, 2)
        self.assertEqual(self.two.rank, 2)

    def test_rank_records_when_increasing_experience_of_already_ranked_position_sharing_rank_with_another_matching_another_rank_should_update_correctly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.another_two)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.another_two.rank, 2)
        self.assertEqual(self.two.rank, 2)

        self.another_two.experience = self.one.experience
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.another_two)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.another_two.rank, 1)
        self.assertEqual(self.two.rank, 2)

    def test_changing_experience_to_same_experience_of_a_lower_ranked_position_should_level_out_other_positions_correctly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.three)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.two.rank, 2)
        self.assertEqual(self.three.rank, 3)

        self.one.experience = self.two.experience
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.two.rank, 1)
        self.assertEqual(self.three.rank, 2)

    def test_changing_experience_to_same_experience_of_a_higher_ranked_position_should_level_out_other_positions_correctly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.three)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.four)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.two.rank, 2)
        self.assertEqual(self.three.rank, 3)
        self.assertEqual(self.four.rank, 4)

        self.three.experience = self.two.experience
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.three)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.two.rank, 2)
        self.assertEqual(self.three.rank, 2)
        self.assertEqual(self.four.rank, 3)

    def test_when_setting_experience_to_zero_on_a_position_on_the_middle_of_the_table_should_adjust_accordingly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.three)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.four)

        self.two.experience = 0
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.three.rank, 2)
        self.assertEqual(self.four.rank, 3)
        self.assertEqual(self.two.rank, 4)

    def test_when_changing_experience_wont_change_rank_it_should_not_adjust_anything(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.three)

        self.one.experience = self.one.experience + 1
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.two.rank, 2)
        self.assertEqual(self.three.rank, 3)

        self.two.experience = self.two.experience - 1
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.two.rank, 2)
        self.assertEqual(self.three.rank, 3)

        self.three.experience = self.three.experience - 1
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.three)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.two.rank, 2)
        self.assertEqual(self.three.rank, 3)

        self.three.experience = self.three.experience - 1
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.three)

    def test_deleting_a_position_on_the_middle_of_the_table_should_adjust_accordingly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.three)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.four)

        self.rank_service.delete_rank_records(self.user2)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.three.rank, 2)
        self.assertEqual(self.four.rank, 3)
        self.assertEqual(self.two, None)

    def test_deleting_a_position_on_the_start_of_the_table_should_adjust_accordingly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.three)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.four)

        self.rank_service.delete_rank_records(self.user1)

        self.reload_models()

        self.assertEqual(self.two.rank, 1)
        self.assertEqual(self.three.rank, 2)
        self.assertEqual(self.four.rank, 3)
        self.assertEqual(self.one, None)

    def test_deleting_a_position_on_the_end_of_the_table_should_adjust_accordingly(self):
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.one)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.two)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.three)
        self.rank_service.rank_records(WeeklyLeaderboardPosition, self.four)

        self.rank_service.delete_rank_records(self.user6)

        self.reload_models()

        self.assertEqual(self.one.rank, 1)
        self.assertEqual(self.two.rank, 2)
        self.assertEqual(self.three.rank, 3)
        self.assertEqual(self.four, None)