from django.urls import path
from leases.views import ( LeaseListCreate, LeaseRetrieveUpdateDestroyView, pending_leases,
                            confirm_lease, reject_lease, cancel_pending_lease, AgreementPDFView,
                            sign_lease)


urlpatterns = [
    path('', LeaseListCreate.as_view()),
    path('<int:pk>/', LeaseRetrieveUpdateDestroyView.as_view(), name='lease-detail'),
    path('<int:pk>/agreement/', AgreementPDFView.as_view(), name='lease-agreement'), 
    path('pending/', pending_leases, name='pending-leases'),
    path('confirm/<int:lease_id>/', confirm_lease, name='confirm-lease'),
    path('reject/<int:lease_id>/', reject_lease, name='reject-lease'),
    path('<int:lease_id>/cancel/', cancel_pending_lease, name='cancel-pending-lease'),
    path('leases/<int:lease_id>/sign/', sign_lease, name='sign-lease'),
]