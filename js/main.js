// 主应用程序入口
class AuraTab {
    constructor() {
        this.components = {
            clock: new Clock(),
            search: new Search(),
            quickAccess: new QuickAccess()
        };
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
        window.addEventListener('focus', () => this.components.clock?.updateTime());
        document.addEventListener('visibilitychange', () => !document.hidden && this.components.clock?.updateTime());
        console.log('🌟 Aura Tab 初始化完成');
    }

    handleGlobalKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            searchInput?.focus() && searchInput.select();
        } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            this.components.quickAccess?.showAddModal();
        } else if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
            document.querySelectorAll('.context-menu').forEach(m => m.remove());
        }
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