from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from actstream.models import Action

class ContentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentType
        fields = "__all__"

class ActionSerializer(serializers.ModelSerializer):
    actor = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()
    action_object = serializers.SerializerMethodField()

    class Meta:
        model = Action
        fields = "__all__"
    
    def get_actor(self, obj):
        return self.format_item(obj)
    
    def get_target(self, obj):
        if obj.target:
            return self.format_item(obj, 'target')
        
        return None
    
    def get_action_object(self, obj):
        if obj.action_object:
            return self.format_item(obj, 'action_object')

        return None

    def format_item(self, action, item_type='actor'):
        """
        Returns a formatted dictionary for an individual item based on the action and item_type.
        """
        obj = getattr(action, item_type)
        return {
            'object_type': ContentType.objects.get_for_model(obj).name,
            'display_name': str(obj)
        }
    