const mongoose = require('mongoose');

// Создал схему пользователя, которая описывает, какие поля будут в документе в коллекции users
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    socketId: { type: String, required: true }
});

// Схема сообщений для хранения текста сообщений, имени и времени
const messageSchema = new mongoose.Schema({
    username: { type: String, required: true }, 
    message: { type: String, required: true },
    chatId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

//Превращаю схемы в модели — они позволяют создавать, читать, обновлять и удалять данные из MongoDB
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

module.exports = { User, Message };

