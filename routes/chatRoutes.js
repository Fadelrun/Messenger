const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const User = require('../models/User');

// Создание или получение чата
router.post('/', async (req, res) => {
  const { targetUsername } = req.body;
  const currentUserId = req.user._id;

  if (!targetUsername) {
    return res.status(400).json({ error: 'Имя пользователя обязательно' });
  }

  const targetUser = await User.findOne({ username: targetUsername });
  if (!targetUser) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  if (targetUser._id.equals(currentUserId)) {
    return res.status(400).json({ error: 'Нельзя начать чат с самим собой' });
  }

  let chat = await Chat.findOne({
    isGroup: false,
    members: { $all: [currentUserId, targetUser._id], $size: 2 }
  });

  if (!chat) {
    chat = await Chat.create({
      members: [currentUserId, targetUser._id],
      isGroup: false
    });
  }

  res.json(chat);
});

// Получение всех чатов пользователя
router.get('/', async (req, res) => {
  const userId = req.user._id;

  const chats = await Chat.find({ members: userId })
    .populate('members', 'username')
    .sort({ createdAt: -1 });

  res.json(chats);
});

module.exports = router;