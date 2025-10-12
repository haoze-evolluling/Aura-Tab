// DeepSeek Chat 功能实现

class DeepSeekChat {
    constructor() {
        this.apiKey = 'sk-0560c9a849694436a71c1ef4c053505a';
        this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        this.conversationHistory = [];
        this.isLoading = false;
        
        this.initializeElements();
        this.bindEvents();
        this.updateStatus('ready');
    }

    // 初始化DOM元素
    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = this.statusIndicator.querySelector('.status-text');
        this.statusDot = this.statusIndicator.querySelector('.status-dot');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorOkBtn = document.getElementById('errorOkBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.backToHomeBtn = document.getElementById('backToHomeBtn');
        this.charCount = document.getElementById('charCount');
    }


    // 绑定事件监听器
    bindEvents() {
        // 发送按钮点击事件
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // 输入框事件
        this.chatInput.addEventListener('input', () => this.handleInputChange());
        this.chatInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 清空对话按钮
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        
        // 返回首页按钮
        this.backToHomeBtn.addEventListener('click', () => this.goBackToHome());
        
        // 错误模态框确定按钮
        this.errorOkBtn.addEventListener('click', () => this.hideErrorModal());
        
        // 点击错误模态框背景关闭
        this.errorModal.addEventListener('click', (e) => {
            if (e.target === this.errorModal) {
                this.hideErrorModal();
            }
        });
    }

    // 处理输入框变化
    handleInputChange() {
        const text = this.chatInput.value.trim();
        const hasText = text.length > 0;
        
        // 更新发送按钮状态
        this.sendBtn.disabled = !hasText || this.isLoading;
        
        // 更新字符计数
        this.updateCharCount();
        
        // 自动调整输入框高度
        this.autoResizeTextarea();
    }

    // 处理键盘事件
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!this.sendBtn.disabled) {
                this.sendMessage();
            }
        }
    }

    // 自动调整输入框高度
    autoResizeTextarea() {
        this.chatInput.style.height = 'auto';
        this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
    }

    // 更新字符计数
    updateCharCount() {
        const count = this.chatInput.value.length;
        this.charCount.textContent = `${count}/2000`;
        
        // 字符数接近限制时改变颜色
        if (count > 1800) {
            this.charCount.style.color = '#ff9800';
        } else if (count > 1900) {
            this.charCount.style.color = '#f44336';
        } else {
            this.charCount.style.color = 'var(--text-muted)';
        }
    }

    // 发送消息
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isLoading) return;

        // 添加用户消息到界面
        this.addMessage('user', message);
        
        // 清空输入框
        this.chatInput.value = '';
        this.handleInputChange();
        
        // 滚动到底部
        this.scrollToBottom();
        
        // 显示加载状态
        this.showLoading();
        this.updateStatus('connecting', 'AI正在思考...');
        
        try {
            // 调用DeepSeek API
            const response = await this.callDeepSeekAPI(message);
            
            // 隐藏加载状态
            this.hideLoading();
            this.updateStatus('ready');
            
            // 添加AI回复到界面
            this.addMessage('assistant', response);
            
            // 滚动到底部
            this.scrollToBottom();
            
        } catch (error) {
            console.error('发送消息失败:', error);
            this.hideLoading();
            this.updateStatus('error', '发送失败');
            this.showError('发送消息失败: ' + error.message);
        }
    }

    // 调用DeepSeek API
    async callDeepSeekAPI(message) {
        if (!this.apiKey) {
            throw new Error('API密钥未配置');
        }

        // 添加用户消息到对话历史
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        const requestBody = {
            model: 'deepseek-chat',
            messages: this.conversationHistory,
            temperature: 0.7,
            max_tokens: 2000,
            stream: false
        };

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('API响应格式错误');
        }

        const aiMessage = data.choices[0].message.content;
        
        // 添加AI回复到对话历史
        this.conversationHistory.push({
            role: 'assistant',
            content: aiMessage
        });

        return aiMessage;
    }

    // 添加消息到界面
    addMessage(role, content) {
        // 移除欢迎消息（如果存在）
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? '👤' : '🤖';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // 处理消息内容，支持Markdown格式
        messageContent.innerHTML = this.formatMessage(content);

        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();

        messageContent.appendChild(messageTime);

        if (role === 'user') {
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
        }

        this.chatMessages.appendChild(messageDiv);
    }

    // 格式化消息内容
    formatMessage(content) {
        // 简单的Markdown处理
        let formatted = content
            // 处理代码块
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            // 处理行内代码
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // 处理粗体
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 处理斜体
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // 处理链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // 处理换行
            .replace(/\n/g, '<br>');

        return formatted;
    }

    // 获取当前时间
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 滚动到底部
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    // 显示加载状态
    showLoading() {
        this.isLoading = true;
        this.loadingOverlay.classList.add('active');
        this.sendBtn.disabled = true;
    }

    // 隐藏加载状态
    hideLoading() {
        this.isLoading = false;
        this.loadingOverlay.classList.remove('active');
        this.handleInputChange(); // 重新检查输入框状态
    }

    // 更新状态指示器
    updateStatus(status, message = '') {
        this.statusDot.className = 'status-dot';
        
        switch (status) {
            case 'ready':
                this.statusDot.classList.add('ready');
                this.statusText.textContent = message || '就绪';
                break;
            case 'connecting':
                this.statusDot.classList.add('connecting');
                this.statusText.textContent = message || '连接中...';
                break;
            case 'error':
                this.statusDot.classList.add('error');
                this.statusText.textContent = message || '错误';
                break;
        }
    }

    // 显示错误模态框
    showError(message) {
        this.errorMessage.textContent = message;
        this.errorModal.classList.add('active');
    }

    // 隐藏错误模态框
    hideErrorModal() {
        this.errorModal.classList.remove('active');
    }

    // 清空对话
    clearChat() {
        if (confirm('确定要清空所有对话记录吗？')) {
            this.conversationHistory = [];
            this.chatMessages.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon">🤖</div>
                    <h3>欢迎使用 DeepSeek Chat</h3>
                    <p>我是您的AI助手，可以回答各种问题，帮助您解决问题。请在下方的输入框中输入您的问题。</p>
                </div>
            `;
            this.updateStatus('ready');
        }
    }

    // 返回首页
    goBackToHome() {
        window.location.href = '../index.html';
    }
}

// 页面加载完成后初始化聊天应用
document.addEventListener('DOMContentLoaded', () => {
    new DeepSeekChat();
});
