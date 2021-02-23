from rest_framework import serializers
from workouts.models import UserBioData

class ChartDistanceMonthSerializer(serializers.Serializer):
   distance = serializers.DecimalField(decimal_places=6, max_digits=12)
   distance_unit = serializers.IntegerField()
   date = serializers.DateField()
   exercise_name = serializers.CharField(source='exercise__name')

class ChartStrengthSerializer(serializers.Serializer):
   weight = serializers.DecimalField(decimal_places=6, max_digits=12)
   weight_unit = serializers.IntegerField()
   date = serializers.DateField()
   exercise_name = serializers.CharField(source='exercise__short_name')

class ChartWeightSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBioData
        fields = ['id', 'weight', 'weight_unit', 'date']