const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

const socket = io({
  withCredentials: true
});

// Проверяем авторизацию при загрузке страницы
fetch('/auth/check')
  .then(response => response.json())
  .then(data => {
    if (!data.username) {
      window.location.href = '/login.html'; 
      return;
    }
    initChat(data.username);
  })
  .catch(error => {
    console.error('Ошибка проверки авторизации:', error);
    window.location.href = '/login.html';
  });

function initChat(username) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim()) {
      socket.emit('chat message', {
        message: input.value.trim() 
      });
      input.value = '';
    }
  });

  // Получение новых сообщений
  socket.on('chat message', (data) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${data.user}:</strong> ${data.message}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  });

  // Загрузка истории сообщений
  socket.on('chat history', (messagesData) => {
    messagesData.forEach(msg => {
      const item = document.createElement('li');
      item.innerHTML = `<strong>${msg.username}:</strong> ${msg.message}`;
      messages.appendChild(item);
    });
    messages.scrollTop = messages.scrollHeight;
  });
}