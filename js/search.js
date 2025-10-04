// 搜索组件模块
class Search {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchEngines = [
            { id: 'bing', name: '必应', url: 'https://www.bing.com/search?q={query}', icon: 'B', description: '微软搜索引擎' },
            { id: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd={query}', icon: '百', description: '全球最大的中文搜索引擎' },
            { id: 'google', name: 'Google', url: 'https://www.google.com/search?q={query}', icon: 'G', description: '全球最受欢迎的搜索引擎' }
        ];
        this.defaultEngine = Utils.storage.get('defaultSearchEngine', 'bing');
        this.init();
    }

    init() {
        if (!this.searchInput) return;
        this.searchInput.addEventListener('keydown', (e) => e.key === 'Enter' && (e.preventDefault(), this.performSearch()));
        this.searchInput.addEventListener('contextmenu', (e) => (e.preventDefault(), this.showSearchEngineModal()));
        this.setupSearchEngineModal();
    }

    performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;
        this.performSearchWithEngine(query);
        this.searchInput.value = '';
    }

    performSearchWithEngine(query, engineId = null) {
        const engine = this.searchEngines.find(e => e.id === (engineId || this.defaultEngine));
        if (engine) {
            window.open(engine.url.replace('{query}', encodeURIComponent(query)), '_blank');
        } else {
            Utils.performSearch(query);
        }
    }

    showSearchEngineModal() {
        const modal = document.getElementById('searchEngineModal');
        const grid = document.getElementById('searchEngineGrid');
        if (!modal || !grid) return;
        this.renderSearchEngines(grid);
        modal.classList.add('active');
    }

    renderSearchEngines(container) {
        container.innerHTML = this.searchEngines.map(engine => `
            <div class="search-engine-item" data-engine="${engine.id}">
                <div class="search-engine-icon">${engine.icon}</div>
                <div class="search-engine-info">
                    <div class="search-engine-name">
                        ${engine.name}${engine.id === this.defaultEngine ? '<span style="color: #4CAF50; font-size: 0.8em;">（默认）</span>' : ''}
                    </div>
                    <div class="search-engine-desc">${engine.description}</div>
                </div>
            </div>
        `).join('');
        container.querySelectorAll('.search-engine-item').forEach(item => {
            item.addEventListener('click', () => {
                this.setDefaultSearchEngine(item.dataset.engine);
                this.hideSearchEngineModal();
            });
        });
    }

    setDefaultSearchEngine(engineId) {
        this.defaultEngine = engineId;
        Utils.storage.set('defaultSearchEngine', engineId);
        const engine = this.searchEngines.find(e => e.id === engineId);
        engine && this.showToast(`已设置 ${engine.name} 为默认搜索引擎`);
    }

    hideSearchEngineModal() {
        document.getElementById('searchEngineModal')?.classList.remove('active');
    }

    setupSearchEngineModal() {
        const modal = document.getElementById('searchEngineModal');
        const cancelBtn = document.getElementById('searchEngineCancelBtn');
        cancelBtn?.addEventListener('click', () => this.hideSearchEngineModal());
        modal?.addEventListener('click', (e) => e.target === modal && this.hideSearchEngineModal());
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'search-toast glass-card';
        toast.innerHTML = `<div class="toast-icon">✓</div><div class="toast-text">${message}</div>`;
        toast.style.cssText = `position: fixed; top: 2rem; left: 50%; transform: translateX(-50%); z-index: 1001; padding: 0.75rem 1.5rem; border-radius: 8px; display: flex; align-items: center; gap: 0.5rem; opacity: 0; background: rgba(76, 175, 80, 0.2); border: 1px solid rgba(76, 175, 80, 0.3); color: var(--text-primary); font-size: 0.9rem; transition: all 0.3s ease;`;
        document.body.appendChild(toast);
        setTimeout(() => toast.style.opacity = '1', 10);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.parentNode?.removeChild(toast), 300);
        }, 2000);
    }
}

