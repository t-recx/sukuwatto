from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import include, path, re_path
from rest_framework import routers
from users.views import UserViewSet, UserStreamList, ActorStreamList, FileUploadView, get_followers, get_following, do_follow, do_unfollow, get_profile_filename, get_email, validate_password
from social.views import MessageList, LastMessageList, update_last_message, PostViewSet, toggle_like, ActionObjectStreamList, TargetStreamList, CommentViewSet
from workouts.views.views import ExerciseViewSet, UnitList, UnitConversionList, exercise_in_use, exercise_in_use_in_other_users_resources
from workouts.views import plan_views
from workouts.views import workout_views, user_bio_views
from django.conf import settings
from django.conf.urls.static import static
from sqtrex.views import ContentTypeList

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'exercises', ExerciseViewSet)
router.register(r'plans', plan_views.PlanViewSet)
router.register(r'workouts', workout_views.WorkoutViewSet)
router.register(r'user-bio-datas', user_bio_views.UserBioDataViewSet)
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/adopt-plan/<int:pk>/', plan_views.adopt_plan, name='adopt_plan'),
    path('api/workout-last/', workout_views.get_last_workout, name='workout-last'),
    path('api/user-bio-data-last/', user_bio_views.get_last_user_bio_data, name='user-bio-data-last'),
    path('api/file-upload/', FileUploadView.as_view()),
    path('api/units/', UnitList.as_view()),
    path('api/unit-conversions/', UnitConversionList.as_view()),
    path('api/content-types/', ContentTypeList.as_view()),
    path('api/user-profile-filename/', get_profile_filename, name='user-profile-filename'),
    path('api/user-email/', get_email, name='user-email'),
    path('api/user-validate-password/', validate_password, name='user-validate-password'),
    path('api/user-stream/', UserStreamList.as_view()),
    path('api/actor-stream/', ActorStreamList.as_view()),
    path('api/target-stream/', TargetStreamList.as_view()),
    path('api/action-object-stream/', ActionObjectStreamList.as_view()),
    path('api/followers/', get_followers, name="followers"),
    path('api/following/', get_following, name="following"),
    path('api/follow/', do_follow, name="follow"),
    path('api/unfollow/', do_unfollow, name="unfollow"),
    path('api/toggle-like/', toggle_like, name="toggle-like"),
    path('api/messages/', MessageList.as_view(), name='messages'),
    path('api/last-messages/', LastMessageList.as_view(), name='last-messages'),
    path('api/update-last-message/', update_last_message, name='update-last-message'),
    path('api/exercise-in-use/', exercise_in_use, name='exercise-in-use'),
    path('api/exercise-in-use-on-other-users-resources/', exercise_in_use_in_other_users_resources, name='exercise-in-use-on-other-users-resources'),
]

# change this for production:
if settings.DEBUG: 
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
