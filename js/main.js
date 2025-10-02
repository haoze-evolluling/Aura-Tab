// 主应用程序入口
class AuraTab {
    constructor() {
        this.components = {};
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // 等待DOM完全加载
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // 初始化组件
            await this.initializeComponents();
            
            // 设置全局事件监听器
            this.setupGlobalEventListeners();
            
            // 应用初始化完成
            this.isInitialized = true;
            this.onInitialized();
            
            console.log('🌟 Aura Tab 初始化完成');
        } catch (error) {
            console.error('❌ Aura Tab 初始化失败:', error);
            this.handleInitError(error);
        }
    }

    async initializeComponents() {
        // 初始化粒子系统
        this.components.particles = new Particles();
        
        // 初始化性能监控
        this.components.performanceMonitor = new PerformanceMonitor(this.components.particles);
        
        // 初始化时钟组件
        this.components.clock = new Clock();
        
        // 初始化搜索组件
        this.components.search = new Search();
        
        // 初始化快捷访问组件
        this.components.quickAccess = new QuickAccess();
        
        // 等待所有组件初始化完成
        await this.waitForComponentsReady();
    }

    async waitForComponentsReady() {
        // 简单的就绪检查
        return new Promise(resolve => {
            const checkReady = () => {
                const allReady = Object.values(this.components).every(component => {
                    return component && (typeof component.init !== 'function' || component.isInitialized !== false);
                });
                
                if (allReady) {
                    resolve();
                } else {
                    setTimeout(checkReady, 50);
                }
            };
            checkReady();
        });
    }

    setupGlobalEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
        
        // 窗口焦点事件
        window.addEventListener('focus', () => this.handleWindowFocus());
        window.addEventListener('blur', () => this.handleWindowBlur());
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // 网络状态变化
        window.addEventListener('online', () => this.handleNetworkChange(true));
        window.addEventListener('offline', () => this.handleNetworkChange(false));
        
        // 错误处理
        window.addEventListener('error', (e) => this.handleGlobalError(e));
        window.addEventListener('unhandledrejection', (e) => this.handleUnhandledRejection(e));
    }

    handleGlobalKeydown(e) {
        // Ctrl/Cmd + K: 聚焦搜索框
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // Ctrl/Cmd + Shift + A: 添加快捷方式
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            if (this.components.quickAccess) {
                this.components.quickAccess.showAddModal();
            }
        }
        
        // F5: 刷新页面
        if (e.key === 'F5') {
            e.preventDefault();
            window.location.reload();
        }
        
        // Escape: 关闭所有模态框
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    handleWindowFocus() {
        // 窗口获得焦点时的处理
        if (this.components.clock) {
            this.components.clock.updateTime();
        }
        
        // 粒子动画已禁用，无需恢复
        // if (this.components.particles) {
        //     this.components.particles.resume();
        // }
    }

    handleWindowBlur() {
        // 窗口失去焦点时的处理
        // 可以在这里暂停一些动画以节省性能
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // 页面隐藏时暂停动画（粒子动画已禁用）
            // if (this.components.particles) {
            //     this.components.particles.pause();
            // }
        } else {
            // 页面显示时恢复动画（粒子动画已禁用）
            // if (this.components.particles) {
            //     this.components.particles.resume();
            // }
            
            // 更新时钟
            if (this.components.clock) {
                this.components.clock.updateTime();
            }
        }
    }

    handleNetworkChange(isOnline) {
        const status = isOnline ? '已连接' : '已断开';
        console.log(`🌐 网络状态: ${status}`);
        
        // 显示网络状态提示
        this.showNetworkStatus(isOnline);
    }

    showNetworkStatus(isOnline) {
        const toast = document.createElement('div');
        toast.className = 'network-toast glass-card';
        toast.innerHTML = `
            <div class="toast-icon">${isOnline ? '🌐' : '📡'}</div>
            <div class="toast-text">${isOnline ? '网络已连接' : '网络已断开'}</div>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1001;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            opacity: 0;
            transition: all 0.3s ease;
            background: ${isOnline ? 'rgba(107, 255, 107, 0.2)' : 'rgba(255, 107, 107, 0.2)'};
            border: 1px solid ${isOnline ? 'rgba(107, 255, 107, 0.3)' : 'rgba(255, 107, 107, 0.3)'};
        `;

        document.body.appendChild(toast);

        // 显示动画
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    handleGlobalError(e) {
        console.error('🚨 全局错误:', e.error);
        
        // 在开发环境显示错误信息
        if (this.isDevelopment()) {
            this.showErrorToast(`错误: ${e.error.message}`);
        }
    }

    handleUnhandledRejection(e) {
        console.error('🚨 未处理的Promise拒绝:', e.reason);
        
        // 防止默认的错误处理
        e.preventDefault();
        
        if (this.isDevelopment()) {
            this.showErrorToast(`Promise错误: ${e.reason}`);
        }
    }

    handleInitError(error) {
        // 显示初始化错误
        const errorContainer = document.createElement('div');
        errorContainer.className = 'init-error';
        errorContainer.innerHTML = `
            <div class="error-content glass-card">
                <div class="error-icon">⚠️</div>
                <div class="error-title">初始化失败</div>
                <div class="error-message">${error.message}</div>
                <button class="error-retry btn btn-primary" onclick="window.location.reload()">
                    重新加载
                </button>
            </div>
        `;
        
        errorContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        document.body.appendChild(errorContainer);
    }

    closeAllModals() {
        // 关闭所有模态框
        const modals = document.querySelectorAll('.modal-overlay.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        
        // 关闭上下文菜单
        const contextMenus = document.querySelectorAll('.context-menu');
        contextMenus.forEach(menu => {
            menu.remove();
        });
    }

    showErrorToast(message) {
        const toast = document.createElement('div');
        toast.className = 'error-toast glass-card';
        toast.innerHTML = `
            <div class="toast-icon">❌</div>
            <div class="toast-text">${message}</div>
        `;
        
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 1001;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            background: rgba(255, 107, 107, 0.2);
            border: 1px solid rgba(255, 107, 107, 0.3);
            max-width: 400px;
        `;

        document.body.appendChild(toast);

        // 显示动画
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    onInitialized() {
        // 初始化完成后的处理
        document.body.classList.add('app-initialized');
        
        // 显示欢迎消息
        if (this.isFirstVisit()) {
            this.showWelcomeMessage();
        }
        
        // 检查更新
        this.checkForUpdates();
    }

    isFirstVisit() {
        const hasVisited = Utils.storage.get('hasVisited', false);
        if (!hasVisited) {
            Utils.storage.set('hasVisited', true);
            return true;
        }
        return false;
    }

    showWelcomeMessage() {
        const welcome = document.createElement('div');
        welcome.className = 'welcome-message glass-card';
        welcome.innerHTML = `
            <div class="welcome-content">
                <div class="welcome-icon">✨</div>
                <div class="welcome-title">欢迎使用 Aura Tab</div>
                <div class="welcome-text">您的现代化浏览器新标签页已准备就绪</div>
                <div class="welcome-tips">
                    <div class="tip">💡 按 <kbd>Ctrl+K</kbd> 快速搜索</div>
                    <div class="tip">🔗 点击下方添加常用网站</div>
                </div>
                <button class="welcome-close btn btn-primary">开始使用</button>
            </div>
        `;
        
        welcome.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            padding: 2rem;
            max-width: 400px;
            text-align: center;
            opacity: 0;
            transition: all 0.5s ease;
        `;

        document.body.appendChild(welcome);

        // 显示动画
        requestAnimationFrame(() => {
            welcome.style.opacity = '1';
        });

        // 关闭按钮事件
        welcome.querySelector('.welcome-close').addEventListener('click', () => {
            welcome.style.opacity = '0';
            setTimeout(() => {
                if (welcome.parentNode) {
                    welcome.parentNode.removeChild(welcome);
                }
            }, 500);
        });

        // 5秒后自动关闭
        setTimeout(() => {
            if (welcome.parentNode) {
                welcome.style.opacity = '0';
                setTimeout(() => {
                    if (welcome.parentNode) {
                        welcome.parentNode.removeChild(welcome);
                    }
                }, 500);
            }
        }, 8000);
    }

    checkForUpdates() {
        // 检查应用更新（这里可以实现版本检查逻辑）
        const currentVersion = '1.0.0';
        const lastVersion = Utils.storage.get('appVersion', '0.0.0');
        
        if (currentVersion !== lastVersion) {
            Utils.storage.set('appVersion', currentVersion);
            console.log(`🎉 应用已更新到版本 ${currentVersion}`);
        }
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.protocol === 'file:';
    }

    // 销毁应用
    destroy() {
        // 销毁所有组件
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        // 清理全局事件监听器
        document.removeEventListener('keydown', this.handleGlobalKeydown);
        window.removeEventListener('focus', this.handleWindowFocus);
        window.removeEventListener('blur', this.handleWindowBlur);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('online', this.handleNetworkChange);
        window.removeEventListener('offline', this.handleNetworkChange);
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        
        this.isInitialized = false;
        console.log('🔄 Aura Tab 已销毁');
    }
}

// 应用样式
const appStyles = `
    .app-initialized {
        animation: appFadeIn 0.8s ease-out;
    }

    @keyframes appFadeIn {
        from {
            opacity: 0;
            transform: scale(0.98);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .init-error {
        font-family: 'Inter', sans-serif;
    }

    .error-content {
        padding: 2rem;
        text-align: center;
        max-width: 400px;
    }

    .error-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .error-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--text-primary);
    }

    .error-message {
        font-size: 1rem;
        margin-bottom: 2rem;
        color: var(--text-secondary);
        line-height: 1.5;
    }

    .welcome-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .welcome-icon {
        font-size: 3rem;
    }

    .welcome-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-primary);
    }

    .welcome-text {
        color: var(--text-secondary);
        line-height: 1.5;
    }

    .welcome-tips {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin: 1rem 0;
    }

    .tip {
        font-size: 0.9rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    kbd {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 0.2rem 0.4rem;
        font-size: 0.8rem;
        font-family: monospace;
    }

    .toast-icon {
        font-size: 1.2rem;
    }

    .toast-text {
        font-size: 0.9rem;
        color: var(--text-primary);
    }
`;

// 添加样式到页面
if (!document.getElementById('app-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'app-styles';
    styleSheet.textContent = appStyles;
    document.head.appendChild(styleSheet);
}

// 创建并启动应用
let auraTabApp;

// 确保在DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        auraTabApp = new AuraTab();
    });
} else {
    auraTabApp = new AuraTab();
}

// 导出到全局作用域（用于调试）
window.AuraTab = AuraTab;
window.auraTabApp = auraTabApp;
