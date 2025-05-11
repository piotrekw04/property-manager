from django.shortcuts import render
from .serializers import PropertySerializer
from .models import Property
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics


class PropertyListCreate(generics.ListCreateAPIView):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Property.objects.filter(owner=self.request.user)  # Filtruj nieruchomości po właścicielu

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
        

class PropertyRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Property.objects.filter(owner=self.request.user)