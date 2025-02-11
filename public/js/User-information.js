window.onload = function() {
    // Fetch user list from API
    fetch('/show-users')
        .then(response => response.json())
        .then(data => {
            const usersContainer = document.getElementById('users');
            data.users.forEach(user => {
                const userElement = document.createElement('div');
                userElement.classList.add('chat-user-card');
                userElement.innerHTML = `
                    <p><strong>Name:</strong> ${user.fullname}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Username:</strong> ${user.username}</p>
                `;
                
                const button = document.createElement('button');
                button.textContent = 'Start Chat';
                button.addEventListener('click', () => startChat(user.id, user.fullname));

                userElement.appendChild(button);
                usersContainer.appendChild(userElement);
            });
        })
        .catch(err => {
            console.error('Error fetching users:', err);
        });
};

let currentUserId = null;

function startChat(userId, userFullname) {
    if (currentUserId === userId) return; // Prevent switching to the same user

    currentUserId = userId;
    const chatContainer = document.getElementById('chat-container');
    chatContainer.innerHTML = `
        <h2>Chat with ${userFullname}</h2>
        <div class="chat-messages" id="messages"></div>
        <div class="chat-input-container">
            <input type="text" id="message-input" placeholder="Type your message...">
            <button onclick="sendMessage(${userId})">Send Message</button>
        </div>
    `;

    fetch(`/get-messages/${userId}`)
        .then(response => response.json())
        .then(data => {
            const messagesContainer = document.getElementById('messages');
            data.forEach(msg => {
                const messageElement = document.createElement('div');
                messageElement.classList.add(msg.sender === 'admin' ? 'sent' : 'received');
                messageElement.textContent = `${msg.sender}: ${msg.text}`;
                messagesContainer.appendChild(messageElement);
            });
        })
        .catch(err => {
            console.error('Error fetching messages:', err);
        });
}

function sendMessage(userId) {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();

    if (!messageText) {
        alert('Please enter your message');
        return;
    }

    const messageData = {
        fromUserId: 'admin',
        toUserId: userId,
        text: messageText
    };

    fetch('/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Message sent successfully');
            const messagesContainer = document.getElementById('messages');
            const newMessage = document.createElement('div');
            newMessage.classList.add('sent');
            newMessage.textContent = `You: ${messageText}`;
            messagesContainer.appendChild(newMessage);
            messageInput.value = '';
        } else {
            alert('Error sending message');
        }
    })
    .catch(err => {
        console.error('Error sending message:', err);
    });
}
