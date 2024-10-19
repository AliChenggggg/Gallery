from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note

#function1：login function    规定输入格式
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}


    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        # 能读不能写
        extra_kwargs = {"author": {"read_only": True}}



# api/serializers.py

from rest_framework import serializers
from .models import Album, Image

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image', 'album', 'order']


class AlbumSerializer(serializers.ModelSerializer):
    images = ImageSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source='author.username', read_only=True)  # 添加作者名字字段

    class Meta:
        model = Album
        fields = ['id', 'name', 'created_at', 'author_name', 'images', 'cover_image']

    def get_images(self, obj):
        images = obj.images.all().order_by('order')
        return ImageSerializer(images, many=True).data


from rest_framework import serializers
from .models import ChatMessage
from django.contrib.auth.models import User


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer()

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'recipient', 'message_content', 'timestamp']