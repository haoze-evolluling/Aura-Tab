// DeepSeek Chat 功能实现 - 重构版本

class DeepSeekChat {
    constructor() {
        this.apiKey = 'sk-0560c9a849694436a71c1ef4c053505a';
        this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        this.conversationHistory = [];
        this.chatHistory = [];
        this.currentChatId = null;
        this.isLoading = false;
        this.deepThinking = false;
        this.webSearch = false;
        this.sidebarOpen = true;
        
        this.initializeElements();
        this.bindEvents();
        this.loadChatHistory();
        this.createNewChat();
    }

    // 初始化DOM元素
    initializeElements() {
        // 消息相关
        this.chatMessages = document.getElementById('chatMessages');
        this.messagesScrollArea = document.getElementById('messagesScrollArea');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        
        // 侧边栏相关
        this.sidebar = document.querySelector('.sidebar');
        this.sidebarToggle = document.getElementById('sidebarToggle');
        this.chatHistoryContainer = document.getElementById('chatHistory');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.newChatBtn2 = document.getElementById('newChatBtn2');
        
        // 标题栏
        this.chatTitle = document.getElementById('chatTitle');
        
        // 功能按钮
        this.deepThinkingBtn = document.getElementById('deepThinkingBtn');
        this.webSearchBtn = document.getElementById('webSearchBtn');
        this.attachBtn = document.getElementById('attachBtn');
        this.fileInput = document.getElementById('fileInput');
        
        // 模态框
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorOkBtn = document.getElementById('errorOkBtn');
    }

    // 绑定事件监听器
    bindEvents() {
        // 发送按钮
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // 输入框事件
        this.chatInput.addEventListener('input', () => this.handleInputChange());
        this.chatInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 侧边栏切换
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // 新对话按钮
        if (this.newChatBtn) {
            this.newChatBtn.addEventListener('click', () => this.createNewChat());
        }
        if (this.newChatBtn2) {
            this.newChatBtn2.addEventListener('click', () => this.createNewChat());
        }
        
        // 功能按钮
        if (this.deepThinkingBtn) {
            this.deepThinkingBtn.addEventListener('click', () => this.toggleDeepThinking());
        }
        if (this.webSearchBtn) {
            this.webSearchBtn.addEventListener('click', () => this.toggleWebSearch());
        }
        if (this.attachBtn) {
            this.attachBtn.addEventListener('click', () => this.fileInput.click());
        }
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        // 错误模态框
        if (this.errorOkBtn) {
            this.errorOkBtn.addEventListener('click', () => this.hideErrorModal());
        }
        if (this.errorModal) {
            this.errorModal.addEventListener('click', (e) => {
                if (e.target === this.errorModal) {
                    this.hideErrorModal();
                }
            });
        }
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }

    // 处理输入框变化
    handleInputChange() {
        const text = this.chatInput.value.trim();
        const hasText = text.length > 0;
        
        // 更新发送按钮状态
        this.sendBtn.disabled = !hasText || this.isLoading;
        
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
        const newHeight = Math.min(this.chatInput.scrollHeight, 200);
        this.chatInput.style.height = newHeight + 'px';
    }

    // 切换侧边栏
    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        this.sidebar.classList.toggle('open', this.sidebarOpen);
    }

    // 处理窗口大小变化
    handleResize() {
        if (window.innerWidth <= 768) {
            this.sidebarOpen = false;
            this.sidebar.classList.remove('open');
        } else {
            this.sidebarOpen = true;
            this.sidebar.classList.add('open');
        }
    }

    // 切换深度思考
    toggleDeepThinking() {
        this.deepThinking = !this.deepThinking;
        this.deepThinkingBtn.setAttribute('data-active', this.deepThinking);
    }

    // 切换联网搜索
    toggleWebSearch() {
        this.webSearch = !this.webSearch;
        this.webSearchBtn.setAttribute('data-active', this.webSearch);
    }

    // 处理文件选择
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            // 这里可以添加文件处理逻辑
            console.log('文件已选择:', files);
        }
    }

    // 创建新对话
    createNewChat() {
        this.currentChatId = Date.now().toString();
        this.conversationHistory = [];
        this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-content">
                    <h2>欢迎使用 DeepSeek Chat</h2>
                    <p>我是您的AI助手，可以回答各种问题，帮助您解决问题。</p>
                </div>
            </div>
        `;
        this.chatTitle.textContent = '新对话';
        this.updateChatHistory();
        this.scrollToBottom();
    }

    // 加载聊天历史
    loadChatHistory() {
        const saved = localStorage.getItem('deepseek_chat_history');
        if (saved) {
            try {
                this.chatHistory = JSON.parse(saved);
                this.renderChatHistory();
            } catch (e) {
                console.error('加载聊天历史失败:', e);
                this.chatHistory = [];
            }
        } else {
            this.chatHistory = [];
        }
    }

    // 保存聊天历史
    saveChatHistory() {
        localStorage.setItem('deepseek_chat_history', JSON.stringify(this.chatHistory));
    }

    // 渲染聊天历史
    renderChatHistory() {
        this.chatHistoryContainer.innerHTML = '';
        this.chatHistory.forEach(chat => {
            const item = document.createElement('a');
            item.className = 'history-item';
            if (chat.id === this.currentChatId) {
                item.classList.add('active');
            }
            item.href = '#';
            item.onclick = (e) => {
                e.preventDefault();
                this.loadChat(chat.id);
            };
            
            const title = document.createElement('div');
            title.className = 'history-item-title';
            title.textContent = chat.title || '新对话';
            item.appendChild(title);
            
            const menu = document.createElement('button');
            menu.className = 'icon-button history-item-menu';
            menu.innerHTML = '<span class="icon">⋯</span>';
            menu.onclick = (e) => {
                e.stopPropagation();
                this.deleteChat(chat.id);
            };
            item.appendChild(menu);
            
            this.chatHistoryContainer.appendChild(item);
        });
    }

    // 加载对话
    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat) return;
        
        this.currentChatId = chatId;
        this.conversationHistory = chat.messages || [];
        this.chatTitle.textContent = chat.title || '新对话';
        
        // 清空并重新渲染消息
        this.chatMessages.innerHTML = '';
        chat.messages.forEach((msg, index) => {
            if (msg.role === 'user' || msg.role === 'assistant') {
                this.renderMessage(msg.role, msg.content, false);
            }
        });
        
        if (this.chatMessages.children.length === 0) {
            this.chatMessages.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-content">
                        <h2>欢迎使用 DeepSeek Chat</h2>
                        <p>我是您的AI助手，可以回答各种问题，帮助您解决问题。</p>
                    </div>
                </div>
            `;
        }
        
        this.scrollToBottom();
    }

    // 删除对话
    deleteChat(chatId) {
        if (confirm('确定要删除这个对话吗？')) {
            this.chatHistory = this.chatHistory.filter(c => c.id !== chatId);
            this.saveChatHistory();
            this.renderChatHistory();
            
            if (chatId === this.currentChatId) {
                this.createNewChat();
            }
        }
    }

    // 更新聊天历史
    updateChatHistory() {
        if (!this.currentChatId) return;
        
        let chat = this.chatHistory.find(c => c.id === this.currentChatId);
        if (!chat) {
            chat = {
                id: this.currentChatId,
                title: '新对话',
                messages: [],
                updatedAt: Date.now()
            };
            this.chatHistory.unshift(chat);
        }
        
        chat.messages = this.conversationHistory;
        
        // 更新标题（使用第一条用户消息）
        const firstUserMessage = this.conversationHistory.find(m => m.role === 'user');
        if (firstUserMessage) {
            chat.title = firstUserMessage.content.substring(0, 30);
            if (firstUserMessage.content.length > 30) {
                chat.title += '...';
            }
            this.chatTitle.textContent = chat.title;
        }
        
        chat.updatedAt = Date.now();
        this.saveChatHistory();
        this.renderChatHistory();
    }

    // 发送消息
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isLoading) return;

        // 移除欢迎消息
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        // 添加用户消息到界面
        this.renderMessage('user', message);
        
        // 清空输入框
        this.chatInput.value = '';
        this.handleInputChange();
        
        // 滚动到底部
        this.scrollToBottom();
        
        // 显示加载状态
        this.showLoading();
        
        try {
            // 调用DeepSeek API
            const response = await this.callDeepSeekAPI(message);
            
            // 隐藏加载状态
            this.hideLoading();
            
            // 添加AI回复到界面
            this.renderMessage('assistant', response);
            
            // 更新聊天历史
            this.updateChatHistory();
            
            // 滚动到底部
            this.scrollToBottom();
            
        } catch (error) {
            console.error('发送消息失败:', error);
            this.hideLoading();
            this.showError('发送消息失败: ' + error.message);
        }
    }

    // 渲染消息
    renderMessage(role, content, animate = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        if (animate) {
            messageDiv.style.animation = 'messageSlideIn 0.3s ease-out';
        }

        // 头像
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? '👤' : '🤖';
        messageDiv.appendChild(avatar);

        // 消息内容
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message bubble';

        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.innerHTML = this.formatMessage(content);
        bubble.appendChild(textDiv);

        // 消息操作按钮（仅助手消息）
        if (role === 'assistant') {
            const actions = document.createElement('div');
            actions.className = 'message-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'message-action-btn';
            copyBtn.innerHTML = '<span class="icon">📋</span>';
            copyBtn.title = '复制';
            copyBtn.onclick = () => this.copyMessage(content);
            actions.appendChild(copyBtn);
            
            bubble.appendChild(actions);
        }

        contentDiv.appendChild(bubble);
        messageDiv.appendChild(contentDiv);

        this.chatMessages.appendChild(messageDiv);
    }

    // 复制消息
    copyMessage(text) {
        navigator.clipboard.writeText(text).then(() => {
            // 可以添加提示
            console.log('消息已复制');
        }).catch(err => {
            console.error('复制失败:', err);
        });
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

        // 如果启用了深度思考，可以调整参数
        if (this.deepThinking) {
            requestBody.temperature = 0.5;
            requestBody.max_tokens = 4000;
        }

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

    // 格式化消息内容
    formatMessage(content) {
        // 简单的Markdown处理
        let formatted = content
            // 处理代码块
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            // 处理行内代码
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // 处理粗体
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 处理斜体
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // 处理链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // 处理换行
            .replace(/\n/g, '<br>');

        return formatted;
    }

    // 滚动到底部
    scrollToBottom() {
        setTimeout(() => {
            if (this.messagesScrollArea) {
                this.messagesScrollArea.scrollTop = this.messagesScrollArea.scrollHeight;
            }
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
        this.handleInputChange();
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
}

// 页面加载完成后初始化聊天应用
document.addEventListener('DOMContentLoaded', () => {
    new DeepSeekChat();
});
