from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    lease = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            'id',
            'lease',
            'title',       
            'description',  
            'amount',
            'date',
            'is_paid',
            'payment_date',
        ]

    def get_lease(self, obj):
        return {
            "id": obj.lease.id,
            "tenant": obj.lease.tenant.id,
            "property": {
                "id": obj.lease.property.id,
                "owner": obj.lease.property.owner.id
            }
        }