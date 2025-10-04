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
        const modalCard = modal.querySelector('.modal-card');
        modal.classList.remove('closing');
        modal.classList.add('active');
        
        // 强制重新触发动画
        modalCard.style.animation = 'none';
        modalCard.offsetHeight; // 触发重排
        modalCard.style.animation = '';
        
        // 添加键盘事件监听
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
        
        // 添加点击事件监听器
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
        const modal = document.getElementById('searchEngineModal');
        if (!modal?.classList.contains('active')) return;
        
        modal.classList.add('closing');
        setTimeout(() => {
            modal.classList.remove('active', 'closing');
        }, 250);
        
        // 移除键盘事件监听
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    setupSearchEngineModal() {
        const modal = document.getElementById('searchEngineModal');
        const cancelBtn = document.getElementById('searchEngineCancelBtn');
        
        cancelBtn?.addEventListener('click', () => this.hideSearchEngineModal());
        modal?.addEventListener('click', (e) => e.target === modal && this.hideSearchEngineModal());
    }

    // 键盘事件处理
    handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.hideSearchEngineModal();
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'search-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">✓</div>
                <div class="toast-text">${message}</div>
            </div>
        `;
        
        // 应用样式
        Object.assign(toast.style, {
            position: 'fixed',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: '1001',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            background: 'rgba(76, 175, 80, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: '500',
            opacity: '0',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        });
        
        document.body.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-10px)';
            setTimeout(() => toast.parentNode?.removeChild(toast), 300);
        }, 2000);
    }
}

