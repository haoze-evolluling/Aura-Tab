// 主应用程序入口
class AuraTab {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // 初始化组件
        this.components.clock = new Clock();
        this.components.search = new Search();
        this.components.quickAccess = new QuickAccess();
        
        // 设置全局事件监听器
        this.setupGlobalEventListeners();
        
        console.log('🌟 Aura Tab 初始化完成');
    }

    setupGlobalEventListeners() {
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
        
        // 窗口焦点事件
        window.addEventListener('focus', () => {
            if (this.components.clock) {
                this.components.clock.updateTime();
            }
        });
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.components.clock) {
                this.components.clock.updateTime();
            }
        });
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
        
        // Escape: 关闭所有模态框
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
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

// 导出快捷访问组件到全局作用域，用于图标错误处理
Object.defineProperty(window, 'quickAccess', {
    get() {
        return auraTabApp?.components?.quickAccess;
    }
});