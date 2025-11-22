/**
 * Aura Tab - 主应用程序模块
 * 负责应用程序的初始化、组件管理和全局事件处理
 */

/**
 * 主应用程序类
 * 管理所有组件的生命周期和全局事件
 */
class AuraTab {
    constructor() {
        this.components = {
            clock: new Clock(),
            search: new Search(),
            quickAccess: new QuickAccess(),
            weather: new Weather()
        };
        this.init();
    }

    /**
     * 初始化应用程序
     */
    init() {
        this.setupGlobalEventListeners();
        this.setupClockUpdates();
        this.logInitialization();
    }

    /**
     * 设置全局事件监听器
     */
    setupGlobalEventListeners() {
        this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this);
        document.addEventListener('keydown', this.handleGlobalKeydown);
    }

    /**
     * 设置时钟更新机制
     */
    setupClockUpdates() {
        this.updateClock = () => this.components.clock?.updateTime();
        this.handleVisibilityChange = () => {
            if (!document.hidden) {
                this.updateClock();
            }
        };
        
        // 窗口获得焦点时更新时间
        window.addEventListener('focus', this.updateClock);
        
        // 页面可见性变化时更新时间
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    /**
     * 处理全局键盘事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleGlobalKeydown(e) {
        // Ctrl/Cmd + K: 聚焦搜索框
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.focusSearchInput();
        }
        // Ctrl/Cmd + Shift + A: 显示添加快捷方式模态框
        else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            this.components.quickAccess?.showAddModal();
        }
        // Escape: 关闭所有模态框和上下文菜单
        else if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    /**
     * 聚焦搜索输入框
     */
    focusSearchInput() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    /**
     * 关闭所有模态框和上下文菜单
     */
    closeAllModals() {
        // 关闭所有激活的模态框
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
        
        // 移除所有上下文菜单
        document.querySelectorAll('.context-menu').forEach(menu => {
            menu.remove();
        });
    }

    /**
     * 记录初始化完成信息
     */
    logInitialization() {
        console.log('🌟 Aura Tab 初始化完成');
        console.log('📋 快捷键提示:');
        console.log('  - Ctrl/Cmd + K: 聚焦搜索框');
        console.log('  - Ctrl/Cmd + Shift + A: 添加快捷方式');
        console.log('  - Escape: 关闭模态框');
        console.log('🌤️ 天气组件已加载');
    }

    /**
     * 销毁应用程序
     */
    destroy() {
        // 销毁所有组件
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        // 清理事件监听器
        document.removeEventListener('keydown', this.handleGlobalKeydown);
        window.removeEventListener('focus', this.updateClock);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
}

/**
 * 应用程序启动函数
 * 根据DOM加载状态决定何时初始化应用
 */
function initializeApp() {
    // 检查DOM是否已加载完成
    if (document.readyState === 'loading') {
        // DOM还在加载中，等待DOMContentLoaded事件
        document.addEventListener('DOMContentLoaded', () => {
            window.auraTabApp = new AuraTab();
        });
    } else {
        // DOM已加载完成，立即初始化
        window.auraTabApp = new AuraTab();
    }
}

// 启动应用程序
initializeApp();

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.AuraTab = AuraTab;
    
    // 提供便捷的全局访问方式
    Object.defineProperty(window, 'quickAccess', {
        get: () => window.auraTabApp?.components?.quickAccess,
        configurable: true
    });
    
    Object.defineProperty(window, 'search', {
        get: () => window.auraTabApp?.components?.search,
        configurable: true
    });
    
    Object.defineProperty(window, 'clock', {
        get: () => window.auraTabApp?.components?.clock,
        configurable: true
    });
    
    Object.defineProperty(window, 'weather', {
        get: () => window.auraTabApp?.components?.weather,
        configurable: true
    });
}
