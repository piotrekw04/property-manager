from django.urls import path
from messaging.views import ContactListView, contact_list_with_last_message, send_message, message_thread


urlpatterns = [
    path('contacts/', ContactListView.as_view(), name='contact-list'),
    path('contact-list/', contact_list_with_last_message, name='contact-list-with-last-message'), 
    path('', send_message, name='send-message'),
    path('<int:contact_id>/', message_thread, name='message_thread'),
]