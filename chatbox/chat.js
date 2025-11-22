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
        
        // 处理响应式布局，确保侧边栏状态正确初始化
        this.handleResize();
        
        // 尝试加载最后一次对话，如果没有历史记录则创建新对话
        if (this.chatHistory && this.chatHistory.length > 0) {
            // 按更新时间排序，找到最后一次对话
            const sortedHistory = [...this.chatHistory].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            this.loadChat(sortedHistory[0].id);
        } else {
            this.createNewChat();
        }
    }

    // 初始化DOM元素
    initializeElements() {
        // 消息相关
        this.chatMessages = document.getElementById('chatMessages');
        this.messagesScrollArea = document.getElementById('messagesScrollArea');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        
        // 主页按钮
        this.homeButton = document.getElementById('homeButton');
        this.sidebarToggleButton = document.getElementById('sidebarToggleButton');
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.querySelector('.main-content');
        this.chatHistoryContainer = document.getElementById('chatHistory');
        this.newChatBtn = document.getElementById('newChatBtn');
        
        // 标题栏
        this.currentChatTitle = document.getElementById('currentChatTitle');
        
        // 文件输入
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
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // 输入框事件
        if (this.chatInput) {
            this.chatInput.addEventListener('input', () => this.handleInputChange());
            this.chatInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        }
        
        // 主页按钮
        if (this.homeButton) {
            this.homeButton.addEventListener('click', () => this.goToHomePage());
        }
        
        // 侧边栏切换按钮
        if (this.sidebarToggleButton) {
            this.sidebarToggleButton.addEventListener('click', () => this.toggleSidebar());
        }
        
        // 新对话按钮
        if (this.newChatBtn) {
            this.newChatBtn.addEventListener('click', () => this.createNewChat());
        }
        
        // 文件输入
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
        
        // 键盘快捷键（ESC关闭模态框）
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.errorModal && this.errorModal.classList.contains('active')) {
                    this.hideErrorModal();
                }
            }
        });
        
        // 窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
        this.handleResize();
    }

    // 处理输入框变化
    handleInputChange() {
        const text = this.chatInput ? this.chatInput.value.trim() : '';
        const hasText = text.length > 0;
        
        // 更新发送按钮状态
        if (this.sendBtn) {
            this.sendBtn.disabled = !hasText || this.isLoading;
        }
        
        // 自动调整输入框高度
        this.autoResizeTextarea();
    }

    // 处理键盘事件
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.sendBtn && !this.sendBtn.disabled) {
                this.sendMessage();
            }
        }
    }

    // 自动调整输入框高度
    autoResizeTextarea() {
        if (!this.chatInput) return;
        
        this.chatInput.style.height = 'auto';
        const newHeight = Math.min(this.chatInput.scrollHeight, 200);
        this.chatInput.style.height = newHeight + 'px';
    }

    // 回到主页
    goToHomePage() {
        // 导航到主页
        window.location.href = '/index.html';
    }

    // 切换侧边栏
    toggleSidebar() {
        if (!this.sidebar) return;
        
        this.sidebarOpen = !this.sidebarOpen;
        this.sidebar.classList.toggle('collapsed', !this.sidebarOpen);
        
        // 调整主内容区域的边距
        if (this.mainContent) {
            if (this.sidebarOpen) {
                this.mainContent.style.marginLeft = '0';
            } else {
                this.mainContent.style.marginLeft = '-260px';
            }
        }
        
        // 更新按钮图标
        if (this.sidebarToggleButton) {
            const icon = this.sidebarToggleButton.querySelector('.sidebar-icon');
            if (icon) {
                icon.textContent = this.sidebarOpen ? '☰' : '☰';
            }
        }
    }

    // 处理窗口大小变化
    handleResize() {
        if (!this.sidebar) return;
        
        // 在小屏幕上自动收起侧边栏
        if (window.innerWidth <= 768) {
            if (this.sidebarOpen) {
                this.sidebarOpen = false;
                this.sidebar.classList.add('collapsed');
                if (this.mainContent) {
                    this.mainContent.style.marginLeft = '-260px';
                }
            }
        } else {
            if (!this.sidebarOpen) {
                this.sidebarOpen = true;
                this.sidebar.classList.remove('collapsed');
                if (this.mainContent) {
                    this.mainContent.style.marginLeft = '0';
                }
            }
        }
    }

    // 处理文件选择
    handleFileSelect(e) {
        const files = e.target.files;
        if (files && files.length > 0) {
            // 这里可以添加文件处理逻辑
            console.log('文件已选择:', files);
            // TODO: 实现文件上传功能
        }
    }

    // 创建新对话
    createNewChat() {
        this.currentChatId = Date.now().toString();
        this.conversationHistory = [];
        
        if (this.chatMessages) {
            this.chatMessages.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-content">
                        <h2>欢迎使用 ChatRobot</h2>
                        <p>我是您的AI助手，可以回答各种问题，帮助您解决问题。</p>
                    </div>
                </div>
            `;
        }
        
        if (this.currentChatTitle) {
            this.currentChatTitle.textContent = '新对话';
        }
        
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
        try {
            localStorage.setItem('deepseek_chat_history', JSON.stringify(this.chatHistory));
        } catch (e) {
            console.error('保存聊天历史失败:', e);
        }
    }

    // 渲染聊天历史
    renderChatHistory() {
        if (!this.chatHistoryContainer) return;
        
        this.chatHistoryContainer.innerHTML = '';
        
        if (this.chatHistory.length === 0) {
            return;
        }
        
        this.chatHistory.forEach(chat => {
            const item = document.createElement('button');
            item.className = 'history-item';
            if (chat.id === this.currentChatId) {
                item.classList.add('active');
            }
            item.type = 'button';
            item.setAttribute('aria-label', chat.title || '新对话');
            
            item.addEventListener('click', () => {
                this.loadChat(chat.id);
            });
            
            const title = document.createElement('div');
            title.className = 'history-item-title';
            title.textContent = chat.title || '新对话';
            item.appendChild(title);
            
            const menu = document.createElement('button');
            menu.className = 'icon-button history-item-menu';
            menu.type = 'button';
            menu.setAttribute('aria-label', '删除对话');
            menu.innerHTML = '<img src="pic/delete.png" alt="删除" style="width: 16px; height: 16px;">';
            menu.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChat(chat.id);
            });
            item.appendChild(menu);
            
            this.chatHistoryContainer.appendChild(item);
        });
    }

    // 加载对话
    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat) return;
        
        this.currentChatId = chatId;
        this.conversationHistory = Array.isArray(chat.messages) ? [...chat.messages] : [];
        
        if (this.currentChatTitle) {
            this.currentChatTitle.textContent = chat.title || '新对话';
        }
        
        // 清空并重新渲染消息
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
            
            if (this.conversationHistory.length === 0) {
                this.chatMessages.innerHTML = `
                    <div class="welcome-message">
                        <div class="welcome-content">
                            <h2>欢迎使用 ChatRobot</h2>
                            <p>我是您的AI助手，可以回答各种问题，帮助您解决问题。</p>
                        </div>
                    </div>
                `;
            } else {
                this.conversationHistory.forEach((msg) => {
                    if (msg.role === 'user' || msg.role === 'assistant') {
                        this.renderMessage(msg.role, msg.content, false);
                    }
                });
            }
        }
        
        this.updateChatHistory();
        this.scrollToBottom();
    }

    // 删除对话
    deleteChat(chatId) {
        if (!confirm('确定要删除这个对话吗？')) {
            return;
        }
        
        this.chatHistory = this.chatHistory.filter(c => c.id !== chatId);
        this.saveChatHistory();
        this.renderChatHistory();
        
        if (chatId === this.currentChatId) {
            this.createNewChat();
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
        
        chat.messages = Array.isArray(this.conversationHistory) ? [...this.conversationHistory] : [];
        
        // 更新标题（使用第一条用户消息）
        const firstUserMessage = this.conversationHistory.find(m => m.role === 'user');
        if (firstUserMessage && firstUserMessage.content) {
            const titleText = firstUserMessage.content.substring(0, 30).trim();
            chat.title = titleText || '新对话';
            if (firstUserMessage.content.length > 30) {
                chat.title += '...';
            }
            
            if (this.currentChatTitle) {
                this.currentChatTitle.textContent = chat.title;
            }
        }
        
        chat.updatedAt = Date.now();
        this.saveChatHistory();
        this.renderChatHistory();
    }

    // 发送消息
    async sendMessage() {
        if (!this.chatInput) return;
        
        const message = this.chatInput.value.trim();
        if (!message || this.isLoading) return;

        // 移除欢迎消息
        if (this.chatMessages) {
            const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.remove();
            }
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
            this.showError('发送消息失败: ' + (error.message || '未知错误'));
        }
    }

    // 渲染消息
    renderMessage(role, content, animate = true) {
        if (!this.chatMessages || !content) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        if (animate) {
            messageDiv.style.animation = 'messageSlideIn 0.3s ease-out';
        }

        // 头像
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (role === 'user') {
            const avatarImg = document.createElement('img');
            avatarImg.src = 'pic/user.png';
            avatarImg.alt = '用户头像';
            avatarImg.className = 'message-avatar-img';
            avatar.appendChild(avatarImg);
        } else {
            const avatarImg = document.createElement('img');
            avatarImg.src = 'pic/robot.png';
            avatarImg.alt = 'AI助手头像';
            avatarImg.className = 'message-avatar-img';
            avatar.appendChild(avatarImg);
        }
        
        avatar.setAttribute('aria-label', role === 'user' ? '用户' : 'AI助手');
        messageDiv.appendChild(avatar);

        // 消息内容容器
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        // 消息气泡
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        // 消息文本
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
            copyBtn.type = 'button';
            copyBtn.setAttribute('aria-label', '复制消息');
            copyBtn.innerHTML = '<span class="icon">📋</span>';
            copyBtn.title = '复制';
            copyBtn.addEventListener('click', () => this.copyMessage(content));
            actions.appendChild(copyBtn);
            
            bubble.appendChild(actions);
        }

        contentDiv.appendChild(bubble);
        messageDiv.appendChild(contentDiv);

        this.chatMessages.appendChild(messageDiv);
    }

    // 复制消息
    async copyMessage(text) {
        try {
            await navigator.clipboard.writeText(text);
            // 可以添加提示
            console.log('消息已复制到剪贴板');
        } catch (err) {
            console.error('复制失败:', err);
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                console.log('消息已复制到剪贴板（降级方案）');
            } catch (e) {
                console.error('复制失败:', e);
            }
            document.body.removeChild(textArea);
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
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {
                // 如果无法解析JSON，使用默认错误消息
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (!data.choices || !Array.isArray(data.choices) || !data.choices[0] || !data.choices[0].message) {
            throw new Error('API响应格式错误');
        }

        const aiMessage = data.choices[0].message.content;
        
        if (!aiMessage) {
            throw new Error('AI回复为空');
        }
        
        // 添加AI回复到对话历史
        this.conversationHistory.push({
            role: 'assistant',
            content: aiMessage
        });

        return aiMessage;
    }

    // 格式化消息内容
    formatMessage(content) {
        if (typeof content !== 'string') {
            return '';
        }
        
        // 转义HTML特殊字符
        const escapeHtml = (text) => {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        };
        
        // 简单的Markdown处理
        let formatted = escapeHtml(content)
            // 处理代码块
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                return `<pre><code>${escapeHtml(code)}</code></pre>`;
            })
            // 处理行内代码（需要在代码块之后处理）
            .replace(/(?<!<code>)(?<!<pre>)`([^`\n]+)`(?!<\/code>)/g, '<code>$1</code>')
            // 处理粗体
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // 处理斜体（避免与粗体冲突）
            .replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
            // 处理链接
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // 处理换行
            .replace(/\n/g, '<br>');

        return formatted;
    }

    // 滚动到底部
    scrollToBottom() {
        if (!this.messagesScrollArea) return;
        
        setTimeout(() => {
            if (this.messagesScrollArea) {
                this.messagesScrollArea.scrollTop = this.messagesScrollArea.scrollHeight;
            }
        }, 100);
    }

    // 显示加载状态
    showLoading() {
        this.isLoading = true;
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('active');
        }
        if (this.sendBtn) {
            this.sendBtn.disabled = true;
        }
        if (this.chatInput) {
            this.chatInput.disabled = true;
        }
    }

    // 隐藏加载状态
    hideLoading() {
        this.isLoading = false;
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('active');
        }
        if (this.chatInput) {
            this.chatInput.disabled = false;
        }
        this.handleInputChange();
    }

    // 显示错误模态框
    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message || '发生未知错误';
        }
        if (this.errorModal) {
            this.errorModal.classList.add('active');
        }
    }

    // 隐藏错误模态框
    hideErrorModal() {
        if (this.errorModal) {
            this.errorModal.classList.remove('active');
        }
    }
}

// 页面加载完成后初始化聊天应用
document.addEventListener('DOMContentLoaded', () => {
    try {
        new DeepSeekChat();
    } catch (error) {
        console.error('初始化聊天应用失败:', error);
    }
});