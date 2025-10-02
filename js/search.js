// 搜索组件模块
class Search {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchSuggestions = document.getElementById('searchSuggestions');
        this.currentSuggestions = [];
        this.selectedIndex = -1;
        this.init();
    }

    init() {
        this.addEventListeners();
        this.setupSearchEngines();
    }

    addEventListeners() {
        if (!this.searchInput) return;

        // 输入事件 - 使用防抖
        this.searchInput.addEventListener('input', 
            Utils.debounce((e) => this.handleInput(e), 300)
        );

        // 键盘事件
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // 焦点事件
        this.searchInput.addEventListener('focus', () => this.handleFocus());
        this.searchInput.addEventListener('blur', () => this.handleBlur());

        // 右键事件 - 显示搜索引擎选择
        this.searchInput.addEventListener('contextmenu', (e) => this.handleContextMenu(e));

        // 点击外部隐藏建议
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSuggestions();
            }
        });

        // 搜索引擎模态框事件
        this.setupSearchEngineModal();
    }

    handleInput(e) {
        const query = e.target.value.trim();
        
        if (query.length === 0) {
            this.hideSuggestions();
            return;
        }

        if (query.length >= 2) {
            this.showSuggestions(query);
        }
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                this.performSearch();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateSuggestions(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateSuggestions(-1);
                break;
            case 'Escape':
                this.hideSuggestions();
                this.searchInput.blur();
                break;
            case 'Tab':
                if (this.selectedIndex >= 0 && this.currentSuggestions.length > 0) {
                    e.preventDefault();
                    this.selectSuggestion(this.selectedIndex);
                }
                break;
        }
    }

    handleFocus() {
        const query = this.searchInput.value.trim();
        if (query.length >= 2) {
            this.showSuggestions(query);
        }
    }

    handleBlur() {
        // 延迟隐藏，以便点击建议项
        setTimeout(() => {
            this.hideSuggestions();
        }, 150);
    }

    showSuggestions(query) {
        // 获取搜索建议
        const suggestions = this.getSuggestions(query);
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.currentSuggestions = suggestions;
        this.selectedIndex = -1;
        this.renderSuggestions();
    }

    getSuggestions(query) {
        const suggestions = [];
        
        // 添加直接搜索选项
        suggestions.push({
            type: 'search',
            text: `搜索 "${query}"`,
            query: query,
            icon: 'search'
        });

        // 如果是URL，添加直接访问选项
        if (this.isUrl(query)) {
            suggestions.push({
                type: 'url',
                text: `访问 ${query}`,
                query: query,
                icon: 'link'
            });
        }

        // 添加搜索引擎建议
        const engines = this.getSearchEngines();
        engines.forEach(engine => {
            if (engine.name.toLowerCase().includes(query.toLowerCase())) {
                suggestions.push({
                    type: 'engine',
                    text: `在 ${engine.name} 中搜索`,
                    query: query,
                    engine: engine,
                    icon: 'search'
                });
            }
        });

        // 添加常用网站建议
        const sites = Utils.getSearchSuggestions(query);
        sites.forEach(site => {
            suggestions.push({
                type: 'site',
                text: site,
                query: site,
                icon: 'globe'
            });
        });

        return suggestions.slice(0, 6); // 限制建议数量
    }

    renderSuggestions() {
        if (!this.searchSuggestions) return;

        const html = this.currentSuggestions.map((suggestion, index) => {
            const isSelected = index === this.selectedIndex;
            const iconHtml = this.getIconHtml(suggestion.icon);
            
            return `
                <div class="suggestion-item ${isSelected ? 'selected' : ''}" 
                     data-index="${index}">
                    <div class="suggestion-icon">${iconHtml}</div>
                    <div class="suggestion-text">${suggestion.text}</div>
                </div>
            `;
        }).join('');

        this.searchSuggestions.innerHTML = html;
        this.searchSuggestions.classList.add('active');

        // 添加点击事件
        this.searchSuggestions.querySelectorAll('.suggestion-item').forEach((item, index) => {
            item.addEventListener('click', () => this.selectSuggestion(index));
        });
    }

    getIconHtml(iconType) {
        const icons = {
            search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
            link: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
            globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
        };
        return icons[iconType] || icons.search;
    }

    hideSuggestions() {
        if (this.searchSuggestions) {
            this.searchSuggestions.classList.remove('active');
        }
        this.currentSuggestions = [];
        this.selectedIndex = -1;
    }

    navigateSuggestions(direction) {
        if (this.currentSuggestions.length === 0) return;

        this.selectedIndex += direction;

        if (this.selectedIndex < -1) {
            this.selectedIndex = this.currentSuggestions.length - 1;
        } else if (this.selectedIndex >= this.currentSuggestions.length) {
            this.selectedIndex = -1;
        }

        this.updateSuggestionSelection();
    }

    updateSuggestionSelection() {
        if (!this.searchSuggestions) return;

        const items = this.searchSuggestions.querySelectorAll('.suggestion-item');
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
        });
    }

    selectSuggestion(index) {
        if (index < 0 || index >= this.currentSuggestions.length) return;

        const suggestion = this.currentSuggestions[index];
        this.searchInput.value = suggestion.query;
        this.hideSuggestions();
        this.performSearch(suggestion);
    }

    performSearch(suggestion = null) {
        const query = this.searchInput.value.trim();
        if (!query) return;

        if (suggestion) {
            switch (suggestion.type) {
                case 'url':
                    window.open(Utils.formatUrl(query), '_blank');
                    break;
                case 'engine':
                    window.open(suggestion.engine.url.replace('{query}', encodeURIComponent(query)), '_blank');
                    break;
                case 'site':
                    window.open(`https://www.google.com/search?q=site:${query}`, '_blank');
                    break;
                default:
                    this.performSearchWithEngine(query);
            }
        } else {
            this.performSearchWithEngine(query);
        }

        // 清空搜索框
        this.searchInput.value = '';
        this.hideSuggestions();
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

    isUrl(text) {
        return Utils.isValidUrl(text) || 
               /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/.test(text);
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

        const modalCard = modal.querySelector('.modal-card');

        // 生成搜索引擎选项
        this.renderSearchEngines(grid);
        
        // 移除可能存在的关闭类
        modal.classList.remove('closing');
        
        // 添加动画类以启用will-change
        if (modalCard) modalCard.classList.add('animating');
        
        modal.classList.add('active');
        
        // 动画完成后清理动画类
        setTimeout(() => {
            if (modalCard) modalCard.classList.remove('animating');
        }, 350);
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
            const modalCard = modal.querySelector('.modal-card');
            
            // 添加动画类以启用will-change
            if (modalCard) modalCard.classList.add('animating');
            
            // 添加关闭动画类
            modal.classList.add('closing');
            
            // 等待动画完成后移除active类和清理动画类
            setTimeout(() => {
                modal.classList.remove('active', 'closing');
                if (modalCard) modalCard.classList.remove('animating');
            }, 250); // 与CSS动画时间一致
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

// 添加搜索建议样式
const searchSuggestionStyles = `
    .suggestion-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: var(--transition);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .suggestion-item:last-child {
        border-bottom: none;
    }

    .suggestion-item:hover,
    .suggestion-item.selected {
        background: rgba(255, 255, 255, 0.1);
    }

    .suggestion-icon {
        color: var(--text-muted);
        flex-shrink: 0;
    }

    .suggestion-text {
        flex: 1;
        font-size: 0.9rem;
        color: var(--text-primary);
    }

    .search-suggestions {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
`;

// 添加样式到页面
if (!document.getElementById('search-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'search-styles';
    styleSheet.textContent = searchSuggestionStyles;
    document.head.appendChild(styleSheet);
}
