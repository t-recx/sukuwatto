from django.urls import include, path
from rest_framework import routers
from users.views import UserViewSet, GroupViewSet
from workouts.views import ExercisesViewSet, WorkoutPlanTemplateViewSet, WorkoutPlanSessionTemplateViewSet, WorkoutPlanSessionExerciseTemplateViewSet, WorkoutPlanSessionTemplateScheduleViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'exercises', ExercisesViewSet)
router.register(r'workoutplantemplates', WorkoutPlanTemplateViewSet)
router.register(r'workoutplansessiontemplates', WorkoutPlanSessionTemplateViewSet)
router.register(r'workoutplansessionexercisetemplates', WorkoutPlanSessionExerciseTemplateViewSet)
router.register(r'workoutplansessiontemplatescheduleviewset', WorkoutPlanSessionTemplateScheduleViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
