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
        const updateClock = () => this.components.clock?.updateTime();
        window.addEventListener('focus', updateClock);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                updateClock();
            }
        });
        console.log('🌟 Aura Tab 初始化完成');
    }

    handleGlobalKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
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
const auraTabApp = document.readyState === 'loading' 
    ? (document.addEventListener('DOMContentLoaded', () => new AuraTab()), null)
    : new AuraTab();

// 导出到全局作用域
Object.assign(window, { AuraTab, auraTabApp });
Object.defineProperty(window, 'quickAccess', {
    get: () => auraTabApp?.components?.quickAccess
});
