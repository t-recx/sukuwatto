from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import include, path, re_path
from rest_framework import routers
from users.views import UserViewSet, UserStreamList, GroupViewSet, FileUploadView, get_followers, get_following, do_follow, do_unfollow
from social.views import MessageList, LastMessageList, update_last_message
from workouts.views.views import ExerciseViewSet, UnitViewSet, UnitConversionViewSet
from workouts.views import plan_views
from workouts.views import workout_views, user_bio_views
from django.conf import settings
from django.conf.urls.static import static
from sqtrex.views import ContentTypeList

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'exercises', ExerciseViewSet)
router.register(r'plans', plan_views.PlanViewSet)
router.register(r'units', UnitViewSet)
router.register(r'unit-conversions', UnitConversionViewSet)
router.register(r'workouts', workout_views.WorkoutViewSet)
router.register(r'user-bio-datas', user_bio_views.UserBioDataViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/adopt-plan/<int:pk>/', plan_views.adopt_plan, name='adopt_plan'),
    path('api/workout-last/', workout_views.get_last_workout, name='workout-last'),
    path('api/user-bio-data-last/', user_bio_views.get_last_user_bio_data, name='user-bio-data-last'),
    path('api/file-upload/', FileUploadView.as_view()),
    path('api/content-types/', ContentTypeList.as_view()),
    path('api/user-stream/', UserStreamList.as_view()),
    path('api/followers/', get_followers, name="followers"),
    path('api/following/', get_following, name="following"),
    path('api/follow/', do_follow, name="follow"),
    path('api/unfollow/', do_unfollow, name="unfollow"),
    path('api/messages/', MessageList.as_view(), name='messages'),
    path('api/last-messages/', LastMessageList.as_view(), name='last-messages'),
    path('api/update-last-message/', update_last_message, name='update-last-message'),
]

# todo: change this for production:
if settings.DEBUG: 
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
