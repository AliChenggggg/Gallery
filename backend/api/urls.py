from . import views
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlbumViewSet, ImageViewSet
from .views import SearchView
from .views import UserAlbumsView
from .views import ChatMessageViewSet
from .views import AlbumDetailView, UserAlbumsView

router = DefaultRouter()
router.register(r'albums', AlbumViewSet, basename='album')
router.register(r'images', ImageViewSet, basename='image')
router.register(r'chat', ChatMessageViewSet, basename='chat')


urlpatterns = [
    path("notes/", views.NoteListCreate.as_view(), name="note-list"),
    path("notes/delete/<int:pk>/", views.NoteDelete.as_view(), name="delete-note"),

    #Function2：upload  映射地址
    path('', include(router.urls)),

    #Function2：search  映射地址
    path('search/', SearchView.as_view(), name='search'),

    path('searchresult/albums/<int:pk>/', AlbumDetailView.as_view(), name='album-detail'),

    #Function2：search  映射地址
    path('users/<str:username>/albums/', UserAlbumsView.as_view(), name='user-albums'),



    path('', include(router.urls)),
    path('chat/<str:username>/user_messages/', ChatMessageViewSet.as_view({'get': 'user_messages'}), name='user-messages'),


]
