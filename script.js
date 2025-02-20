document.addEventListener('DOMContentLoaded', function() {
    // 轮播功能
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    // 点击圆点切换轮播
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });

    // 自动轮播
    setInterval(nextSlide, 5000);

    // 聊天功能
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatHistory = document.getElementById('chatHistory');
    const typingIndicator = document.querySelector('.typing-indicator');

    // 修改 API Key 配置
    const API_KEY = 'f3d90f7c992f482c99a589ae5f0928e3.cy9aGeX4dAQWKNLd'; // 已替换为实际的 API Key

    function addMessage(content, isUser = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;
        messageDiv.textContent = content;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    async function handleSendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // 添加用户消息
        addMessage(message, true);
        messageInput.value = '';

        // 显示输入指示器
        typingIndicator.classList.remove('hidden');

        try {
            // 调用 AI API
            const response = await chatWithAI(message, API_KEY);
            
            // 隐藏输入指示器
            typingIndicator.classList.add('hidden');
            
            // 添加 AI 响应
            addMessage(response, false);
        } catch (error) {
            // 处理错误
            typingIndicator.classList.add('hidden');
            // 显示更具体的错误信息
            addMessage(`抱歉，发生了错误：${error.message}`, false);
            console.error('Chat error:', error);
        }
    }

    // 修复事件监听器绑定
    if (sendButton) {
        sendButton.addEventListener('click', function(e) {
            e.preventDefault();
            handleSendMessage();
        });
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });

        // 自动调整文本框高度
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    // 添加调试代码
    console.log('DOM Elements:', {
        messageInput: messageInput,
        sendButton: sendButton,
        chatHistory: chatHistory,
        typingIndicator: typingIndicator
    });

    // 添加一个测试函数
    async function testAPI() {
        try {
            const response = await chatWithAI('测试消息', API_KEY);
            console.log('API测试响应:', response);
            return true;
        } catch (error) {
            console.error('API测试失败:', error);
            return false;
        }
    }

    // 在页面加载完成后运行测试
    testAPI().then(success => {
        if (!success) {
            addMessage('API 连接测试失败，请检查 API Key 配置', false);
        }
    });
}); 