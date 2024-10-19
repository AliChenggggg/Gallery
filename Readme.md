https://www.figma.com/design/jpEqTnIohQC62WNimzuKzM/Untitled?node-id=0-1&t=OG20oQYlltIDOxLR-1


cd .\Desktop\env\backend        
daphne backend.asgi:application
daphne -b 0.0.0.0 -p 8000 backend.asgi:application

cd .\Desktop\env\frontend        
npm run dev



pip install django djangorestframework channels daphne


my_project/
├── api
│   ├── migrations
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py           # 数据模型
│   ├── serializers.py      # 序列化器（用于 DRF）
│   ├── tests.py            # 测试代码
│   ├── urls.py             # URL 路由配置
│   ├── views.py            # 处理请求的视图
│   ├── routing.py            # 处理请求的视图
│   ├── consumers.py            # 处理请求的视图
├── backend/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py         # Django 配置文件
│   ├── urls.py             # URL 路由配置
│   ├── wsgi.py             # WSGI 入口
├── media/                  # 存储上传的媒体文件
│   └── images/             # 上传的图片存储目录
├── manage.py               # 管理命令




my-react-app/
├── public/                  # 静态文件
│   └── favicon.ico          # 网站图标
├── src/                     # 源代码
│   ├── assets/              # 静态资源（如图片、字体等）
│   ├── components/          # 可复用的组件
│   │   ├── Form / # login和rejester
│   │   ├── LoadingIndicator.js
│   │   │── Modal.js
│   │   │── Navbar.js
│   │   │── ProtectedRoute.js

│   │   ├── pages/            # 表单组件
│   │   │   ├── Login.js #import Form
│   │   │   ├── ChatPage.js 
│   │   │   ├── NoticePage.js 
├── app.jsx 



