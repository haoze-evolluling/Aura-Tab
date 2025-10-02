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

        // 点击外部隐藏建议
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSuggestions();
            }
        });
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
                    Utils.performSearch(query);
            }
        } else {
            Utils.performSearch(query);
        }

        // 清空搜索框
        this.searchInput.value = '';
        this.hideSuggestions();
    }

    isUrl(text) {
        return Utils.isValidUrl(text) || 
               /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/.test(text);
    }

    setupSearchEngines() {
        this.searchEngines = [
            {
                name: 'Google',
                url: 'https://www.google.com/search?q={query}'
            },
            {
                name: 'Bing',
                url: 'https://www.bing.com/search?q={query}'
            },
            {
                name: 'DuckDuckGo',
                url: 'https://duckduckgo.com/?q={query}'
            },
            {
                name: 'Baidu',
                url: 'https://www.baidu.com/s?wd={query}'
            },
            {
                name: 'YouTube',
                url: 'https://www.youtube.com/results?search_query={query}'
            },
            {
                name: 'GitHub',
                url: 'https://github.com/search?q={query}'
            }
        ];
    }

    getSearchEngines() {
        return this.searchEngines || [];
    }

    // 添加搜索历史功能
    saveSearchHistory(query) {
        const history = Utils.storage.get('searchHistory', []);
        
        // 移除重复项
        const filteredHistory = history.filter(item => item !== query);
        
        // 添加到开头
        filteredHistory.unshift(query);
        
        // 限制历史记录数量
        const limitedHistory = filteredHistory.slice(0, 10);
        
        Utils.storage.set('searchHistory', limitedHistory);
    }

    getSearchHistory() {
        return Utils.storage.get('searchHistory', []);
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
