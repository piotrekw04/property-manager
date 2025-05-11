from rest_framework import serializers
from .models import Lease


class LeaseSerializer(serializers.ModelSerializer):
    tenant_info = serializers.SerializerMethodField()
    property_info = serializers.SerializerMethodField()
    owner_info = serializers.SerializerMethodField()
    payment_due_day = serializers.IntegerField(write_only=True, required=False)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Lease
        fields = [
            'id',
            'property',
            'property_info',
            'tenant',
            'tenant_info',
            'start_date',
            'end_date',
            'rent_amount',
            'payment_due_day',
            'owner_info',
            'is_confirmed',
            'agreement_signed_in_person',
            'needs_signature',
            'is_signed',
            'status'
        ]
        read_only_fields = [
            'is_confirmed', 
            'needs_signature', 
            'is_signed',
            'status'
        ]

    def get_tenant_info(self, obj):
        return {
            "id": obj.tenant.id,
            "username": obj.tenant.username,
            "first_name": obj.tenant.first_name,
            "last_name": obj.tenant.last_name,
        }

    def get_property_info(self, obj):
        return {
            "id": obj.property.id,
            "name": obj.property.name,
            "address": obj.property.address,
        }
        
    def get_owner_info(self, obj):
        return {
            "id": obj.property.owner.id,
            "username": obj.property.owner.username,
            "first_name": obj.property.owner.first_name,
            "last_name": obj.property.owner.last_name
        }
        
    def create(self, validated_data):
        if validated_data.get('agreement_signed_in_person', False):
            validated_data['needs_signature'] = False
        else:
            validated_data['needs_signature'] = True

        return super().create(validated_data)