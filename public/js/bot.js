document.addEventListener('DOMContentLoaded', fetchResponses);

document.getElementById('add-response-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const userMessage = document.getElementById('user-message').value;
    const botReply = document.getElementById('bot-reply').value;

    fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_message: userMessage, bot_reply: botReply })
    })
    .then(response => response.json())
    .then(() => fetchResponses())
    .catch(error => alert('خطا در ارسال داده‌ها: ' + error));
});

function fetchResponses() {
    fetch('/api/responses')
        .then(response => response.json())
        .then(responses => {
            const tableBody = document.querySelector('#responses-table tbody');
            tableBody.innerHTML = '';

            responses.forEach(response => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${response.user_message}</td>
                    <td>${response.bot_reply}</td>
                    <td>
                        <button onclick="editResponse(${response.id}, '${response.user_message}', '${response.bot_reply}')">ویرایش</button>
                        <button onclick="deleteResponse(${response.id})">حذف</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => alert('خطا در دریافت پاسخ‌ها: ' + error));
}

function editResponse(id, userMessage, botReply) {
    const newUserMessage = prompt('ویرایش پیام کاربر:', userMessage);
    const newBotReply = prompt('ویرایش پاسخ ربات:', botReply);

    if (newUserMessage && newBotReply) {
        fetch(`/api/responses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_message: newUserMessage, bot_reply: newBotReply })
        })
        .then(() => fetchResponses())
        .catch(error => alert('خطا در ویرایش پاسخ: ' + error));
    }
}

function deleteResponse(id) {
    if (confirm('آیا مطمئن هستید که می‌خواهید این پاسخ را حذف کنید؟')) {
        fetch(`/api/responses/${id}`, {
            method: 'DELETE'
        })
        .then(() => fetchResponses())
        .catch(error => alert('خطا در حذف پاسخ: ' + error));
    }
}