from django.urls import include, path
from rest_framework import routers
from users.views import UserViewSet, GroupViewSet
from workouts.views import ExercisesViewSet, UnitViewSet, UnitConversionViewSet, WorkoutViewSet
from workouts import plan_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'exercises', ExercisesViewSet)
router.register(r'plans', plan_views.PlanViewSet)
router.register(r'units', UnitViewSet)
router.register(r'unitconversions', UnitConversionViewSet)
router.register(r'workouts', WorkoutViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/adopt-plan/<int:pk>/', plan_views.adopt_plan, name='adopt_plan'),
]
