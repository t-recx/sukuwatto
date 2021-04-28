from django.contrib.contenttypes.models import ContentType
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from sqtrex.serializers import ContentTypeSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from sqtrex.tasks import email_user_data
from users.models import UserDataRequest

class ContentTypeList(generics.ListAPIView):
    queryset = ContentType.objects.all()
    serializer_class = ContentTypeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['model']

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_personal_data(request):
    if UserDataRequest.objects.filter(user=request.user.id).exists():
        return Response(status=status.HTTP_202_ACCEPTED)

    data_request = UserDataRequest.objects.create(user=request.user)

    email_user_data(data_request.id)

    return Response(status=status.HTTP_201_CREATED)
