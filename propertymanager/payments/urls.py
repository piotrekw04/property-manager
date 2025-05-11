from django.urls import path
from payments.views import PaymentListCreate, PaymentRetrieveUpdateDestroyView, InvoicePDFView


urlpatterns = [
    path('', PaymentListCreate.as_view()),
    path('<int:pk>/', PaymentRetrieveUpdateDestroyView.as_view(), name='payment-detail'),
    path('<int:pk>/invoice/', InvoicePDFView.as_view(), name='payment-invoice'),

]