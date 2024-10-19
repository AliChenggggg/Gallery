from django.db import models
from django.contrib.auth.models import User

#test note
class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    #ForeignKey 是说，一个 note 链接到 一个 user，
    #如果删除某个 user，那么，将同时删除此用户的全部 note。

    #related_name="notes" 含义： notes 字段引用所有的 note, 通过 .notes 可以获得一个用户创建的全部 note 对象。
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes")

    def __str__(self):
        return self.title


# api/models.py


from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.core.files.storage import default_storage
import uuid
import os

def get_unique_image_path(instance, filename):
    # 获取文件扩展名
    ext = filename.split('.')[-1]
    # 生成唯一的文件名
    unique_filename = f"{uuid.uuid4()}.{ext}"
    # 返回完整的路径
    return os.path.join('images/', unique_filename)

class Album(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    cover_image = models.ImageField(upload_to='covers/', null=True, blank=True)


class Image(models.Model):
    image = models.ImageField(upload_to=get_unique_image_path)
    album = models.ForeignKey(Album, related_name='images', on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)  # Field to store image order

    def delete(self, *args, **kwargs):
        # 删除关联的文件
        default_storage.delete(self.image.name)
        super().delete(*args, **kwargs)




from django.db import models
from django.contrib.auth.models import User

class ChatMessage(models.Model):
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, related_name='received_messages', on_delete=models.CASCADE)
    message_content = models.TextField()  # Example: 'message_content' instead of 'message'
    timestamp = models.DateTimeField(auto_now_add=True)
