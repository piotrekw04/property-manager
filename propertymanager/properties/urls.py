from django.urls import path
from .views import PropertyListCreate, PropertyRetrieveUpdateDestroyView

urlpatterns = [
    path('', PropertyListCreate.as_view(), name='property-list'),
    path('<int:pk>/', PropertyRetrieveUpdateDestroyView.as_view(), name='property-detail'),
]