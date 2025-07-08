const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const cookieSession = require('cookie-session');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth.js');
const chatRoutes = require('./routes/chatRoutes');
const { Server } = require('socket.io');
const { User, Message } = require('./models/models');

const app = express();
const PORT = 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"],
    credentials: true
  }
});

//Конфигурация сессий
const sessionMiddleware = cookieSession({
  name: 'chat_session',
  keys: ['sffgjkdfs', 'dasdsdsa'], 
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production'
});

app.use(express.json());
app.use(sessionMiddleware);

// Проверка авторизации
app.use((req, res, next) => {
  const publicPaths = [
    '/login', 
    '/login.html',
    '/auth/login',
    '/auth/register',
    '/register',
    '/register.html',
    '/styles.css',
    '/js/'
  ];
  
  if (!req.session.userId && !publicPaths.some(p => req.path.startsWith(p))) {
    return res.redirect('/login');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Подключение MongoDB 
mongoose.connect('mongodb://localhost:27017/chat-app')
.then(() => console.log('MongoDB подключен'))
.catch(err => {
  console.error('Ошибка подключения к MongoDB:', err);
  process.exit(1);
});

// Socket.IO 
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {
  if (!socket.request.session.userId) {
    console.log('Неавторизованное подключение');
    return socket.disconnect(true);
  }

  const userId = socket.request.session.userId;
  console.log(`Пользователь подключен: ${userId}`);

  socket.on('join chat', (chatId) => {
    socket.join(chatId);
    console.log(`Пользователь ${userId} присоединился к чату ${chatId}`);

    
    loadChatHistoryForChat(socket, chatId);
  });


  socket.on('chat message', async (msg) => {
    try {
      const { chatId, message } = msg;
      if (!chatId || !message || typeof message !== 'string') {
        return socket.emit('chat error', 'Неверный формат сообщения');
      }
  
      const newMessage = await Message.create({
        userId,
        username: socket.request.session.username,
        message: message.trim(),
        chatId 
      });
  
      io.to(chatId).emit('chat message', formatMessage(newMessage));
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      socket.emit('chat error', 'Ошибка сервера');
    }
  });

  socket.on('disconnect', () => {
    console.log(`Пользователь отключен: ${userId}`);
  });
});

async function loadChatHistoryForChat(socket, chatId) {
  try {
    const messages = await Message.find({ chatId })
      .sort({ timestamp: 1 })
      .limit(100)
      .lean();

    socket.emit('chat history', messages.map(formatMessage));
  } catch (err) {
    console.error('Ошибка загрузки истории:', err);
  }
}


function formatMessage(msg) {
  return {
    _id: msg._id,
    username: msg.username,
    message: msg.message,
    timestamp: msg.timestamp
  };
}

// Маршруты
app.use('/auth', authRoutes);
app.use('/chats', authMiddleware, chatRoutes);

app.get('/', (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/login.html'); 
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
  
app.get('/login', (req, res) => {
    if (req.session.userId) {
      return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
  
app.get('/register', (req, res) => {
    if (req.session.userId) {
      return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Обработка 404
app.use((req, res) => {
  res.status(404).send('Страница не найдена');
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ошибка сервера');
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});