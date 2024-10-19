from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

# 创建 note
# ListCreateAPIView, do two things:
# listing all notes created by a user or create a new note
class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    # Cannot call this route, unless authenticated and pass a valid jwt token
    permission_classes = [IsAuthenticated]

    # overriding get_queryset(django docs)
    def get_queryset(self):
        user = self.request.user
        # get all notes written by this "user", that's what filter means
        return Note.objects.filter(author=user)

    # overriding perform_create(django docs)
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)

# 删除 note
class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]



# api/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Album, Image
from .serializers import AlbumSerializer, ImageSerializer
from rest_framework.decorators import action
from django.db import models

class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Album.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        album = serializer.save(author=self.request.user)
        self.update_cover_image(album)

    def perform_update(self, serializer):
        album = serializer.save()
        self.update_cover_image(album)

    def update_cover_image(self, album):
        if album.images.exists():
            last_image = album.images.order_by('order').last()
            album.cover_image = last_image.image
        else:
            album.cover_image = None
        album.save()

    def perform_destroy(self, instance):
        instance.images.all().delete()
        instance.delete()

    def destroy(self, request, *args, **kwargs):
        album = self.get_object()
        self.perform_destroy(album)
        return Response(status=status.HTTP_204_NO_CONTENT)



    @action(detail=True, methods=['post'])
    def update_image_order(self, request, pk=None):
        album = self.get_object()
        image_orders = request.data.get('image_orders', [])

        for order, image_id in enumerate(image_orders):
            Image.objects.filter(id=image_id, album=album).update(order=order)

        self.update_cover_image(album)

        return Response({'status': 'order updated'})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        images = data.get('images', [])
        images.sort(key=lambda x: x['order'])
        self.update_cover_image(instance)
        data['images'] = images
        return Response(data)

class ImageViewSet(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Image.objects.filter(album__author=self.request.user)

    def perform_create(self, serializer):
        instance = serializer.save()
        album = instance.album
        max_order = album.images.aggregate(max_order=models.Max('order'))['max_order'] or 0
        instance.order = max_order + 1
        instance.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        album = instance.album
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)



#search
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Album
from .serializers import AlbumSerializer

class SearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        query = request.GET.get('q', '')
        albums = Album.objects.filter(Q(name__icontains=query) | Q(author__username__icontains=query))
        # Serialize albums, which will handle ordering of images
        serializer = AlbumSerializer(albums, many=True)
        return Response(serializer.data)


from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import Album
from .serializers import AlbumSerializer

class AlbumDetailView(generics.RetrieveAPIView):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [AllowAny]  # No authentication required


# personal page
from rest_framework import viewsets, generics
from .models import Album
from .serializers import AlbumSerializer
from django.contrib.auth.models import User
from rest_framework.response import Response


class UserAlbumsView(generics.ListAPIView):
    serializer_class = AlbumSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        username = self.kwargs['username']
        user = User.objects.get(username=username)
        return Album.objects.filter(author=user)




from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .models import ChatMessage, User
from .serializers import ChatMessageSerializer
from rest_framework.permissions import IsAuthenticated

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get', 'post'], url_path='(?P<username>[^/.]+)/user_messages')
    def user_messages(self, request, username=None):
        if request.method == 'GET':
            user = self.request.user
            recipient = User.objects.get(username=username)
            messages = ChatMessage.objects.filter(
                Q(sender=user, recipient=recipient) |
                Q(sender=recipient, recipient=user)
            )
            serializer = ChatMessageSerializer(messages, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            user = self.request.user
            recipient = User.objects.get(username=username)
            message_content = request.data.get('message_content')  # Updated field name
            # Ensure `message_content` is present and valid
            if message_content:
                message = ChatMessage.objects.create(sender=user, recipient=recipient, message_content=message_content)
                serializer = ChatMessageSerializer(message)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': 'Message content is required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def all_chats(self, request):
        user = self.request.user
        # Fetch all messages involving the user
        messages = ChatMessage.objects.filter(
            Q(sender=user) | Q(recipient=user)
        ).order_by('timestamp')  # Adjust ordering if needed

        # Get distinct chat participants
        chat_participants = set()
        for message in messages:
            chat_participants.add(message.sender)
            chat_participants.add(message.recipient)

        # Create a list of chat participants
        chat_list = []
        for participant in chat_participants:
            if participant != user:
                chat_list.append({
                    'username': participant.username,
                    'latest_message': messages.filter(
                        Q(sender=participant) | Q(recipient=participant)
                    ).latest('timestamp').message_content  # Updated field name
                })

        return Response(chat_list)

    @action(detail=False, methods=['delete'], url_path='delete_chat/(?P<username>[^/.]+)')
    def delete_chat(self, request, username=None):
        user = self.request.user
        try:
            recipient = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Delete messages between the current user and the recipient
        deleted_count, _ = ChatMessage.objects.filter(
            Q(sender=user, recipient=recipient) |
            Q(sender=recipient, recipient=user)
        ).delete()

        return Response({'message': f'{deleted_count} messages deleted'}, status=status.HTTP_204_NO_CONTENT)
