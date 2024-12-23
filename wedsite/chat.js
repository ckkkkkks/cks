const API_URL = 'https://free.v36.cm/v1/chat/completions';
const API_KEY = 'sk-75W2MHj8paFy1TXJ29D13d7c83F34d84Ab2f7f3820Ff17B4';

let chatMessages = [];

async function sendMessage() {
    console.log('sendMessage function called');

    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (!message) {
        console.log('No message to send');
        return;
    }

    console.log('Sending message:', message);

    try {
        // 顯示用戶訊息
        displayMessage(message, 'user');
        userInput.value = '';

        // 顯示載入中訊息
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message';
        loadingDiv.textContent = '正在思考中...';
        document.getElementById('chat-messages').appendChild(loadingDiv);

        // 準備發送給 API 的訊息
        chatMessages.push({
            role: "user",
            content: message
        });

        console.log('Preparing API request...');

        const requestBody = {
            model: "gpt-3.5-turbo",
            messages: chatMessages,
            temperature: 0.7,
            max_tokens: 2000,
            stream: false,
            presence_penalty: 0,
            frequency_penalty: 0
        };

        console.log('Request body:', requestBody);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);

        // 移除載入中訊息
        if (document.contains(loadingDiv)) {
            document.getElementById('chat-messages').removeChild(loadingDiv);
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.choices && data.choices[0]) {
            const aiResponse = data.choices[0].message.content;
            chatMessages.push({
                role: "assistant",
                content: aiResponse
            });
            displayMessage(aiResponse, 'ai');
        } else {
            console.error('No valid response from API');
            displayMessage('抱歉，無法獲取 AI 回應。', 'ai');
        }
    } catch (error) {
        console.error('Error details:', error);
        const loadingDiv = document.querySelector('.ai-message:last-child');
        if (loadingDiv && loadingDiv.textContent === '正在思考中...') {
            loadingDiv.remove();
        }
        displayMessage('抱歉，發生錯誤。請稍後再試。錯誤訊息：' + error.message, 'ai');
    }
}

function displayMessage(message, sender) {
    console.log('Displaying message:', {message, sender});
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // 綁定發送按鈕事件
    const sendButton = document.getElementById('send-button');
    console.log('Send button found:', sendButton);
    sendButton.addEventListener('click', function() {
        console.log('Send button clicked');
        sendMessage();
    });
    
    // 綁定輸入框的 Enter 鍵事件
    const inputField = document.getElementById('user-input');
    console.log('Input field found:', inputField);
    inputField.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            console.log('Enter key pressed');
            sendMessage();
        }
    });

    // 顯示歡迎訊息
    displayMessage('你好！我是 AI 助手，很高興為您服務。', 'ai');
});

// 添加錯誤處理
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global error:', {msg, url, lineNo, columnNo, error});
    return false;
}; 