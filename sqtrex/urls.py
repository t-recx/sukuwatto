from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import include, path
from rest_framework import routers
from users.views import UserViewSet, GroupViewSet
from workouts.views.views import ExercisesViewSet, UnitViewSet, UnitConversionViewSet
from workouts.views import plan_views
from workouts.views import workout_views

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'exercises', ExercisesViewSet)
router.register(r'plans', plan_views.PlanViewSet)
router.register(r'units', UnitViewSet)
router.register(r'unit-conversions', UnitConversionViewSet)
router.register(r'workouts', workout_views.WorkoutViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/adopt-plan/<int:pk>/', plan_views.adopt_plan, name='adopt_plan'),
    path('api/working-weights/', workout_views.working_weights, name='working_weights'),
]
