const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const chatList = document.getElementById('chatList');

const socket = io({ withCredentials: true });

let currentChatId = null;

// Проверка авторизации
fetch('/auth/check')
  .then(response => response.json())
  .then(data => {
    if (!data.username) {
      window.location.href = '/login.html'; 
      return;
    }
    document.getElementById('usernameDisplay').textContent = data.username;
    
    loadChats();
  })
  .catch(error => {
    console.error('Ошибка проверки авторизации:', error);
    window.location.href = '/login.html';
  });

function loadChats() {
  fetch('/chats')
    .then(res => res.json())
    .then(chats => {
      chatList.innerHTML = '';
      chats.forEach(chat => {
        const li = document.createElement('li');
        li.textContent = chat.name;
        li.addEventListener('click', () => joinChat(chat._id));
        chatList.appendChild(li);
      });
    });
}

function joinChat(chatId) {
  currentChatId = chatId;
  socket.emit('join chat', chatId);
  messages.innerHTML = '';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (input.value.trim() && currentChatId) {
    socket.emit('chat message', {
      chatId: currentChatId,
      message: input.value.trim()
    });
    input.value = '';
  }
});

socket.on('chat message', (msg) => {
  const li = document.createElement('li');
  li.innerHTML = `
  <strong>${msg.username}</strong>: ${msg.message} 
  <span style="font-size:0.8em; color:gray">(${formatTime(msg.timestamp)})</span>
`;
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('chat history', (msgList) => {
  messages.innerHTML = '';
  msgList.forEach(msg => {
    const li = document.createElement('li');
    li.innerHTML = `
    <strong>${msg.username}</strong>: ${msg.message} 
    <span style="font-size:0.8em; color:gray">(${formatTime(msg.timestamp)})</span>
  `;
    messages.appendChild(li);
  });
  messages.scrollTop = messages.scrollHeight;
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = '/login.html';
  } catch (err) {
    console.error('Ошибка при выходе:', err);
  }
});

document.getElementById('newChatForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('newChatUser').value.trim();
  if (!username) return;

  const res = await fetch('/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ targetUsername: username })
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.error || 'Ошибка');
    return;
  }

  loadChats();       
  joinChat(data._id);
});

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

li.innerHTML = `
  <strong>${msg.username}</strong>: ${msg.message} 
  <span style="font-size:0.8em; color:gray">${formatTime(msg.timestamp)}</span>
`;