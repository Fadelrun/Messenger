const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Введите username и password' 
        });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'Пользователь уже существует' 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        req.session.userId = user._id;
        req.session.username = user.username;

        res.status(201).json({ 
            success: true,
            message: 'Пользователь зарегистрирован и авторизован',
            username: user.username 
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ 
            success: false,
            message: 'Ошибка сервера' 
        });
    }
});

// Вход
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false,
            message: 'Введите имя пользователя и пароль' 
        });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'Пользователь не найден' 
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false,
                message: 'Неверный пароль' 
            });
        }

        req.session.userId = user._id;
        req.session.username = user.username;

        res.json({ 
            success: true,
            message: 'Успешный вход', 
            username: user.username 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Ошибка сервера' 
        });
    }
});

// Выход
router.post('/logout', (req, res) => {
    req.session = null;
    res.json({ 
        success: true,
        message: 'Вы вышли из системы' 
    });
});

// Проверка авторизации
router.get('/check', authMiddleware, (req, res) => {
    res.json({ 
        success: true,
        username: req.session.username 
    });
});

// Профиль
router.get('/profile', authMiddleware, (req, res) => {
    res.json({ 
        success: true,
        username: req.session.username,
        userId: req.session.userId 
    });
});

module.exports = router;