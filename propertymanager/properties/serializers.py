from .models import Property
from rest_framework import serializers


class PropertySerializer(serializers.ModelSerializer):
    is_currently_rented = serializers.SerializerMethodField()
    will_be_rented      = serializers.SerializerMethodField()
    
    
    class Meta:
        model = Property
        fields = [
            'id', 'name', 'address', 'area', 'property_type', 'rooms',
            'description', 'is_furnished',
            'is_currently_rented', 'will_be_rented', 'owner',
        ]
        read_only_fields = ('owner', 'is_currently_rented', 'will_be_rented')
        
    
    def get_is_currently_rented(self, obj):
        return obj.is_currently_rented

    def get_will_be_rented(self, obj):
        return obj.is_future_rented
        
    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)