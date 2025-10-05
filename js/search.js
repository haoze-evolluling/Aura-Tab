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
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch();
            }
        });
        this.searchInput.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showSearchEngineModal();
        });
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
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    renderSearchEngines(container) {
        container.innerHTML = this.searchEngines.map(engine => `
            <div class="search-engine-item ${engine.id === this.defaultEngine ? 'selected' : ''}" data-engine="${engine.id}">
                <div class="search-engine-icon">${engine.icon}</div>
                <div class="search-engine-info">
                    <div class="search-engine-name">${engine.name}</div>
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
        if (engine) {
            Utils.showToast(`已设置 ${engine.name} 为默认搜索引擎`, 'success');
        }
    }

    hideSearchEngineModal() {
        const modal = document.getElementById('searchEngineModal');
        if (!modal?.classList.contains('active')) return;
        
        modal.classList.remove('active');
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    setupSearchEngineModal() {
        const modal = document.getElementById('searchEngineModal');
        const cancelBtn = document.getElementById('searchEngineCancelBtn');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideSearchEngineModal());
        }
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideSearchEngineModal();
                }
            });
        }
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.hideSearchEngineModal();
        }
    }
}
