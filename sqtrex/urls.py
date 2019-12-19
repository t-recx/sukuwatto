from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import include, path, re_path
from rest_framework import routers
from users.views import UserViewSet, GroupViewSet
from workouts.views.views import ExerciseViewSet, UnitViewSet, UnitConversionViewSet 
from workouts.views import plan_views
from workouts.views import workout_views, user_bio_views

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
    re_path('^activity/', include('actstream.urls')),
]
