// 搜索组件模块
class Search {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.init();
    }

    init() {
        this.addEventListeners();
        this.setupSearchEngines();
    }

    addEventListeners() {
        if (!this.searchInput) return;

        // 键盘事件
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // 右键事件 - 显示搜索引擎选择
        this.searchInput.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

        // 搜索引擎模态框事件
        this.setupSearchEngineModal();
    }

    handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.performSearch();
        }
    }

    performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;

        // 使用指定搜索引擎进行搜索
        this.performSearchWithEngine(query);

        // 清空搜索框
        this.searchInput.value = '';
    }

    // 使用指定搜索引擎进行搜索
    performSearchWithEngine(query, engineId = null) {
        const targetEngineId = engineId || this.defaultEngine;
        const engine = this.searchEngines.find(e => e.id === targetEngineId);
        
        if (engine) {
            const searchUrl = engine.url.replace('{query}', encodeURIComponent(query));
            window.open(searchUrl, '_blank');
        } else {
            // 回退到默认搜索
            Utils.performSearch(query);
        }
    }

    setupSearchEngines() {
        this.searchEngines = [
            {
                id: 'bing',
                name: '必应',
                url: 'https://www.bing.com/search?q={query}',
                icon: 'B',
                description: '微软搜索引擎'
            },
            {
                id: 'baidu',
                name: '百度',
                url: 'https://www.baidu.com/s?wd={query}',
                icon: '百',
                description: '全球最大的中文搜索引擎'
            },
            {
                id: 'google',
                name: 'Google',
                url: 'https://www.google.com/search?q={query}',
                icon: 'G',
                description: '全球最受欢迎的搜索引擎'
            }
        ];

        // 从本地存储获取默认搜索引擎
        this.defaultEngine = Utils.storage.get('defaultSearchEngine', 'bing');
    }

    getSearchEngines() {
        return this.searchEngines || [];
    }

    // 处理右键菜单
    handleContextMenu(e) {
        e.preventDefault();
        this.showSearchEngineModal();
    }

    // 显示搜索引擎选择模态框
    showSearchEngineModal() {
        const modal = document.getElementById('searchEngineModal');
        const grid = document.getElementById('searchEngineGrid');
        
        if (!modal || !grid) return;

        // 生成搜索引擎选项
        this.renderSearchEngines(grid);
        modal.classList.add('active');
    }

    // 渲染搜索引擎选项
    renderSearchEngines(container) {
        const html = this.searchEngines.map(engine => {
            const isDefault = engine.id === this.defaultEngine;
            return `
                <div class="search-engine-item" data-engine="${engine.id}">
                    <div class="search-engine-icon">${engine.icon}</div>
                    <div class="search-engine-info">
                        <div class="search-engine-name">
                            ${engine.name}
                            ${isDefault ? '<span style="color: #4CAF50; font-size: 0.8em;">（默认）</span>' : ''}
                        </div>
                        <div class="search-engine-desc">${engine.description}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;

        // 添加点击事件
        container.querySelectorAll('.search-engine-item').forEach(item => {
            item.addEventListener('click', () => {
                const engineId = item.dataset.engine;
                this.setDefaultSearchEngine(engineId);
                this.hideSearchEngineModal();
            });
        });
    }

    // 设置默认搜索引擎
    setDefaultSearchEngine(engineId) {
        this.defaultEngine = engineId;
        Utils.storage.set('defaultSearchEngine', engineId);
        
        // 显示提示
        const engine = this.searchEngines.find(e => e.id === engineId);
        if (engine) {
            this.showToast(`已设置 ${engine.name} 为默认搜索引擎`);
        }
    }

    // 隐藏搜索引擎模态框
    hideSearchEngineModal() {
        const modal = document.getElementById('searchEngineModal');
        if (modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    }

    // 设置搜索引擎模态框事件
    setupSearchEngineModal() {
        const modal = document.getElementById('searchEngineModal');
        const cancelBtn = document.getElementById('searchEngineCancelBtn');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideSearchEngineModal();
            });
        }

        if (modal) {
            // 点击模态框外部关闭
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideSearchEngineModal();
                }
            });
        }
    }

    // 显示提示消息
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'search-toast glass-card';
        toast.innerHTML = `
            <div class="toast-icon">✓</div>
            <div class="toast-text">${message}</div>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1001;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            opacity: 0;
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid rgba(76, 175, 80, 0.3);
            color: var(--text-primary);
            font-size: 0.9rem;
            transition: all 0.3s ease;
        `;

        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2000);
    }
}

