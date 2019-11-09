from django.urls import include, path
from rest_framework import routers
from users.views import UserViewSet, GroupViewSet
from workouts.views import ExercisesViewSet, PlanViewSet, UnitViewSet, UnitConversionViewSet, WorkoutViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groups', GroupViewSet)
router.register(r'exercises', ExercisesViewSet)
router.register(r'plans', PlanViewSet)
router.register(r'units', UnitViewSet)
router.register(r'unitconversions', UnitConversionViewSet)
router.register(r'workouts', WorkoutViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
