from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenCookieDeleteView
from django.urls import include, path
from rest_framework import routers
from users.views import UserViewSet, UserRegistrationView, UserListView, UserStreamList, ActorStreamList, FileUploadView, do_follow, do_unfollow, reject_follow_request, approve_follow_request, get_profile_filename, get_email, validate_password, change_password, get_user, FollowingList, FollowersList, FollowRequestsList, get_is_following, ExpressInterestCreate, follow_request_number, CustomTokenObtainPairView, user_exists
from social.views import MessageList, LastMessageList, update_last_message, PostViewSet, toggle_like, ActionObjectStreamList, TargetStreamList, CommentViewSet, user_liked, unread_conversations, get_date_last_unread_conversations
from development.views import FeatureViewSet, ReleaseViewSet, toggle_feature
from workouts.views.views import ExerciseViewSet, MetabolicEquivalentTaskList, get_mets, exercise_in_use, exercise_in_use_in_other_users_resources, get_available_chart_data, MuscleList, UserSkillsList
from workouts.views.views import WeeklyLeaderboardDashboardList, YearlyLeaderboardDashboardList, MonthlyLeaderboardDashboardList, AllTimeLeaderboardDashboardList
from workouts.views.views import WeeklyLeaderboardList, YearlyLeaderboardList, MonthlyLeaderboardList, AllTimeLeaderboardList
from workouts.views import plan_views
from workouts.views import workout_views, user_bio_views
from django.conf import settings
from django.conf.urls.static import static
from sqtrex.views import ContentTypeList
from django.conf.urls import url, include
from django_rest_passwordreset.views import reset_password_request_token, reset_password_confirm, reset_password_validate_token

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'exercises', ExerciseViewSet)
router.register(r'plans', plan_views.PlanViewSet)
router.register(r'workouts', workout_views.WorkoutViewSet, 'Workout')
router.register(r'user-bio-datas', user_bio_views.UserBioDataViewSet)
router.register(r'posts', PostViewSet)
router.register(r'features', FeatureViewSet)
router.register(r'releases', ReleaseViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/sign-up/', UserRegistrationView.as_view(), name='sign-up'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', TokenCookieDeleteView.as_view(), name='logout'),
    path('api/adopt-plan/<int:pk>/', plan_views.adopt_plan, name='adopt-plan'),
    path('api/plan-adopted/', plan_views.plan_adopted, name='plan-adopted'),
    path('api/leave-plan/<int:pk>/', plan_views.leave_plan, name='leave-plan'),
    path('api/adopted-plans/', plan_views.AdoptedPlansList.as_view(), name='adopted-plans'),
    path('api/owned-plans-paginated/', plan_views.OwnedPlansPaginatedList.as_view(), name='owned-plans-paginated'),
    path('api/adopted-plans-paginated/', plan_views.AdoptedPlansPaginatedList.as_view(), name='adopted-plans-paginated'),
    path('api/plans-paginated/', plan_views.PlanPaginatedList.as_view(), name='plans-paginated'),
    path('api/muscles/', MuscleList.as_view(), name='muscles'),
    path('api/metabolic-equivalent-tasks/', MetabolicEquivalentTaskList.as_view(), name='metabolic-equivalent-tasks'),
    path('api/mets/', get_mets, name='mets'),
    path('api/user-available-chart-data/', get_available_chart_data, name='user-available-chart-data'),
    path('api/workout-last/', workout_views.get_last_workout, name='workout-last'),
    path('api/workouts-overview-list/', workout_views.WorkoutOverviewList.as_view(), name='workouts-overview-list'),
    path('api/workouts-by-date/', workout_views.get_workouts_by_date, name='workouts-by-date'),
    path('api/workout-last-position/', workout_views.get_last_workout_position, name='workout-last-position'),
    path('api/workout-group-last/', workout_views.get_last_workout_group, name='workout-group-last'),
    path('api/workout-visible/', workout_views.workout_visible, name='workout-visible'),
    path('api/workout-editable/', workout_views.workout_editable, name='workout-editable'),
    path('api/user-bio-datas-by-date/', user_bio_views.UserBioDataList.as_view(), name='user-bio-data-by-date'),
    path('api/user-bio-data-last/', user_bio_views.get_last_user_bio_data, name='user-bio-data-last'),
    path('api/user-body-composition-last/', user_bio_views.get_last_user_body_composition, name='user-body-composition-last'),
    path('api/file-upload/', FileUploadView.as_view()),
    path('api/content-types/', ContentTypeList.as_view()),
    path('api/express-interest/', ExpressInterestCreate.as_view(), name='express-interest'),
    path('api/get-user/', get_user, name='get-user'),
    path('api/user-profile-filename/', get_profile_filename, name='user-profile-filename'),
    path('api/user-email/', get_email, name='user-email'),
    path('api/user-validate-password/', validate_password, name='user-validate-password'),
    path('api/user-change-password/', change_password, name='user-change-password'),
    path('api/user-stream/', UserStreamList.as_view()),
    path('api/users-search/', UserListView.as_view(), name='users-search'),
    path('api/user-liked/', user_liked, name='user-liked'),
    path('api/user-exists/', user_exists, name='user-exists'),
    path('api/actor-stream/', ActorStreamList.as_view()),
    path('api/target-stream/', TargetStreamList.as_view()),
    path('api/action-object-stream/', ActionObjectStreamList.as_view()),
    path('api/followers/', FollowersList.as_view(), name="followers"),
    path('api/following/', FollowingList.as_view(), name="following"),
    path('api/user-skills/', UserSkillsList.as_view(), name="user-skills"),
    path('api/follow-requests/', FollowRequestsList.as_view(), name="follow-requests"),
    path('api/follow-request-number/', follow_request_number, name="follow-request-number"),
    path('api/is-following/', get_is_following, name="is-following"),
    path('api/follow/', do_follow, name="follow"),
    path('api/unfollow/', do_unfollow, name="unfollow"),
    path('api/approve-follow-request/', approve_follow_request, name="approve-follow-request"),
    path('api/reject-follow-request/', reject_follow_request, name="reject-follow-request"),
    path('api/toggle-like/', toggle_like, name="toggle-like"),
    path('api/messages/', MessageList.as_view(), name='messages'),
    path('api/last-messages/', LastMessageList.as_view(), name='last-messages'),
    path('api/update-last-message/', update_last_message, name='update-last-message'),
    path('api/unread-conversations/', unread_conversations, name='unread-conversations'),
    path('api/last-unread-conversation/', get_date_last_unread_conversations, name='last-unread-conversation'),
    path('api/weekly-leaderboard/', WeeklyLeaderboardList.as_view(), name='weekly-leaderboard'),
    path('api/monthly-leaderboard/', MonthlyLeaderboardList.as_view(), name='monthly-leaderboard'),
    path('api/yearly-leaderboard/', YearlyLeaderboardList.as_view(), name='yearly-leaderboard'),
    path('api/alltime-leaderboard/', AllTimeLeaderboardList.as_view(), name='alltime-leaderboard'),
    path('api/weekly-leaderboard-dashboard/', WeeklyLeaderboardDashboardList.as_view(), name='weekly-leaderboard-dashboard'),
    path('api/monthly-leaderboard-dashboard/', MonthlyLeaderboardDashboardList.as_view(), name='monthly-leaderboard-dashboard'),
    path('api/yearly-leaderboard-dashboard/', YearlyLeaderboardDashboardList.as_view(), name='yearly-leaderboard-dashboard'),
    path('api/alltime-leaderboard-dashboard/', AllTimeLeaderboardDashboardList.as_view(), name='alltime-leaderboard-dashboard'),
    path('api/exercise-in-use/', exercise_in_use, name='exercise-in-use'),
    path('api/exercise-in-use-on-other-users-resources/', exercise_in_use_in_other_users_resources, name='exercise-in-use-on-other-users-resources'),
    path('api/toggle-feature/', toggle_feature, name="toggle-feature"),
    path('api/password-reset-validate-token/', reset_password_validate_token, name="reset-password-validate"),
    path('api/password-reset-confirm/', reset_password_confirm, name="reset-password-confirm"),
    path('api/password-reset/', reset_password_request_token, name="reset-password-request"),
]

# change this for production:
if settings.DEBUG: 
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
