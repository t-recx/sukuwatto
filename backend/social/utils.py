from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType

def get_user_actions_filtered_by_object(queryset, content_type_id, object_id, is_target):
    ctype = get_object_or_404(ContentType, pk=content_type_id)
    object_model = ctype.model

    if is_target:
        if object_model == 'workout':
            queryset = queryset.filter(target_workout__id=object_id)
        elif object_model == 'plan':
            queryset = queryset.filter(target_plan__id=object_id)
        elif object_model == 'post':
            queryset = queryset.filter(target_post__id=object_id)
        elif object_model == 'exercise':
            queryset = queryset.filter(target_exercise__id=object_id)
        elif object_model == 'comment':
            queryset = queryset.filter(target_comment__id=object_id)
        elif object_model == 'customuser':
            queryset = queryset.filter(target_user__id=object_id)
        elif object_model == 'userbiodata':
            queryset = queryset.filter(target_user_bio_data__id=object_id)
        elif object_model == 'feature':
            queryset = queryset.filter(target_feature__id=object_id)
        elif object_model == 'release':
            queryset = queryset.filter(target_release__id=object_id)
    else:
        if object_model == 'workout':
            queryset = queryset.filter(action_object_workout__id=object_id)
        elif object_model == 'plan':
            queryset = queryset.filter(action_object_plan__id=object_id)
        elif object_model == 'post':
            queryset = queryset.filter(action_object_post__id=object_id)
        elif object_model == 'exercise':
            queryset = queryset.filter(action_object_exercise__id=object_id)
        elif object_model == 'comment':
            queryset = queryset.filter(action_object_comment__id=object_id)
        elif object_model == 'customuser':
            queryset = queryset.filter(action_object_user__id=object_id)
        elif object_model == 'userbiodata':
            queryset = queryset.filter(action_object_user_bio_data__id=object_id)
        elif object_model == 'feature':
            queryset = queryset.filter(action_object_feature__id=object_id)
        elif object_model == 'release':
            queryset = queryset.filter(action_object_release__id=object_id)

    return queryset
