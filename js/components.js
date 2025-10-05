/**
 * Aura Tab - UI组件模块
 * 包含时钟、搜索、快捷访问等UI组件
 */

/**
 * 时钟组件
 * 负责显示当前时间和日期
 */
class Clock {
    constructor() {
        this.timeElement = document.getElementById('timeDisplay');
        this.dateElement = document.getElementById('dateDisplay');
        this.updateTime();
        this.clockInterval = setInterval(() => this.updateTime(), 1000);
    }

    /**
     * 更新时间显示
     */
    updateTime() {
        const now = new Date();
        if (this.timeElement) {
            this.timeElement.textContent = Utils.formatTime(now);
        }
        if (this.dateElement) {
            this.dateElement.textContent = Utils.formatDate(now);
        }
    }

    /**
     * 销毁时钟组件
     */
    destroy() { 
        clearInterval(this.clockInterval); 
    }
}

/**
 * 搜索组件
 * 负责搜索功能和搜索引擎管理
 */
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

    /**
     * 初始化搜索组件
     */
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

    /**
     * 执行搜索
     */
    performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;
        this.performSearchWithEngine(query);
        this.searchInput.value = '';
    }

    /**
     * 使用指定搜索引擎执行搜索
     * @param {string} query - 搜索查询
     * @param {string} engineId - 搜索引擎ID
     */
    performSearchWithEngine(query, engineId = null) {
        const engine = this.searchEngines.find(e => e.id === (engineId || this.defaultEngine));
        if (engine) {
            window.open(engine.url.replace('{query}', encodeURIComponent(query)), '_blank');
        } else {
            Utils.performSearch(query);
        }
    }

    /**
     * 显示搜索引擎选择模态框
     */
    showSearchEngineModal() {
        const modal = document.getElementById('searchEngineModal');
        const grid = document.getElementById('searchEngineGrid');
        if (!modal || !grid) return;
        
        this.renderSearchEngines(grid);
        modal.classList.add('active');
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * 渲染搜索引擎列表
     * @param {HTMLElement} container - 容器元素
     */
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

    /**
     * 设置默认搜索引擎
     * @param {string} engineId - 搜索引擎ID
     */
    setDefaultSearchEngine(engineId) {
        this.defaultEngine = engineId;
        Utils.storage.set('defaultSearchEngine', engineId);
        const engine = this.searchEngines.find(e => e.id === engineId);
        if (engine) {
            Utils.showToast(`已设置 ${engine.name} 为默认搜索引擎`, 'success');
        }
    }

    /**
     * 隐藏搜索引擎选择模态框
     */
    hideSearchEngineModal() {
        const modal = document.getElementById('searchEngineModal');
        if (!modal?.classList.contains('active')) return;
        
        modal.classList.remove('active');
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * 设置搜索引擎模态框事件
     */
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

    /**
     * 处理键盘事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.hideSearchEngineModal();
        }
    }
}

/**
 * 快捷访问组件
 * 负责管理快捷方式书签
 */
class QuickAccess {
    constructor() {
        this.elements = {
            grid: document.getElementById('quickAccessGrid'),
            addBtn: document.getElementById('addShortcutBtn'),
            modal: document.getElementById('modalOverlay'),
            form: document.getElementById('shortcutForm'),
            cancelBtn: document.getElementById('cancelBtn')
        };
        this.shortcuts = Utils.storage.get('quickAccessShortcuts', []);
        this.init();
    }

    /**
     * 初始化快捷访问组件
     */
    init() {
        this.renderShortcuts();
        this.addEventListeners();
        this.loadDefaultShortcuts();
    }

    /**
     * 添加事件监听器
     */
    addEventListeners() {
        if (this.elements.addBtn) {
            this.elements.addBtn.addEventListener('click', () => this.showAddModal());
        }
        if (this.elements.form) {
            this.elements.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        if (this.elements.cancelBtn) {
            this.elements.cancelBtn.addEventListener('click', () => this.hideModal());
        }
        if (this.elements.modal) {
            this.elements.modal.addEventListener('click', (e) => {
                if (e.target === this.elements.modal) {
                    this.hideModal();
                }
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modal?.classList.contains('active')) {
                this.hideModal();
            }
        });
    }

    /**
     * 加载默认快捷方式
     */
    loadDefaultShortcuts() {
        if (this.shortcuts.length === 0) {
            this.shortcuts = [
                { id: Utils.generateId(), name: '百度', url: 'https://www.baidu.com' },
                { id: Utils.generateId(), name: 'B站', url: 'https://www.bilibili.com' },
                { id: Utils.generateId(), name: '网易云音乐', url: 'https://music.163.com' },
                { id: Utils.generateId(), name: '知乎', url: 'https://www.zhihu.com' }
            ];
            this.saveShortcuts();
            this.renderShortcuts();
        }
    }

    /**
     * 渲染快捷方式列表
     */
    renderShortcuts() {
        if (!this.elements.grid) return;
        if (this.shortcuts.length === 0) {
            this.elements.grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔗</div>
                    <div class="empty-text">暂无快捷方式</div>
                    <div class="empty-subtext">点击下方按钮添加常用网站</div>
                </div>
            `;
            return;
        }
        this.elements.grid.innerHTML = this.shortcuts.map(s => `
            <a href="${s.url}" class="shortcut-btn" target="_blank" rel="noopener noreferrer" data-id="${s.id}">
                <div class="shortcut-icon">
                    <img src="${this.getFaviconUrl(s.url)}" alt="${s.name}" loading="lazy" onerror="window.quickAccess.handleIconError(this, '${s.url}')">
                    <div class="fallback-icon" style="display: none;">🌐</div>
                </div>
                <div class="shortcut-name">${s.name}</div>
                <button class="delete-shortcut" data-id="${s.id}" title="删除">×</button>
            </a>
        `).join('');
        
        this.elements.grid.querySelectorAll('.delete-shortcut').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.deleteShortcut(btn.getAttribute('data-id'));
            });
        });
        
        this.elements.grid.querySelectorAll('.shortcut-btn').forEach(btn => {
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, btn.getAttribute('data-id'));
            });
        });
    }

    /**
     * 获取网站图标URL
     * @param {string} url - 网站URL
     * @returns {string} 图标URL
     */
    getFaviconUrl(url) {
        try { 
            return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; 
        } catch { 
            return this.getDefaultIcon(); 
        }
    }

    /**
     * 获取多个图标源
     * @param {string} url - 网站URL
     * @returns {Array} 图标URL数组
     */
    getFaviconSources(url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            return [
                `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
                `https://statics.dnspod.cn/proxy_favicon/_/favicon?domain=${domain}`,
                `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`
            ];
        } catch { 
            return [this.getDefaultIcon()]; 
        }
    }

    /**
     * 获取默认图标
     * @returns {string} 默认图标SVG
     */
    getDefaultIcon() {
        return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
    }

    /**
     * 处理图标加载错误
     * @param {HTMLImageElement} imgElement - 图片元素
     * @param {string} url - 网站URL
     */
    handleIconError(imgElement, url) {
        const sources = this.getFaviconSources(url);
        const currentIndex = sources.findIndex(src => src === imgElement.src);
        const nextIndex = currentIndex === -1 ? 0 : currentIndex + 1;
        if (nextIndex < sources.length) {
            imgElement.src = sources[nextIndex];
        } else {
            imgElement.style.display = 'none';
            const fallbackIcon = imgElement.nextElementSibling;
            if (fallbackIcon?.classList.contains('fallback-icon')) {
                fallbackIcon.style.display = 'flex';
            }
        }
    }

    /**
     * 显示添加快捷方式模态框
     */
    showAddModal() {
        if (!this.elements.modal) return;
        this.elements.modal.classList.add('active');
        document.getElementById('shortcutName').value = '';
        document.getElementById('shortcutUrl').value = '';
        setTimeout(() => {
            const nameInput = document.getElementById('shortcutName');
            if (nameInput) {
                nameInput.focus();
            }
        }, 150);
    }

    /**
     * 隐藏模态框
     */
    hideModal() {
        if (!this.elements.modal?.classList.contains('active')) return;
        this.elements.modal.classList.remove('active');
    }

    /**
     * 处理表单提交
     * @param {Event} e - 提交事件
     */
    handleFormSubmit(e) {
        e.preventDefault();
        const nameInput = document.getElementById('shortcutName');
        const urlInput = document.getElementById('shortcutUrl');
        if (!nameInput || !urlInput) return;
        
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        
        if (!name || !url) {
            Utils.showToast('请填写完整信息', 'error');
            return;
        }
        
        if (!Utils.isValidUrl(Utils.formatUrl(url))) {
            Utils.showToast('请输入有效的网址', 'error');
            return;
        }
        
        this.addShortcut({ name, url: Utils.formatUrl(url) });
        this.hideModal();
    }

    /**
     * 添加快捷方式
     * @param {Object} shortcutData - 快捷方式数据
     */
    addShortcut(shortcutData) {
        const shortcut = { id: Utils.generateId(), ...shortcutData };
        this.shortcuts.push(shortcut);
        this.saveShortcuts();
        this.renderShortcuts();
        Utils.showToast(`已添加 ${shortcut.name}`, 'success');
    }

    /**
     * 删除快捷方式
     * @param {string} id - 快捷方式ID
     */
    deleteShortcut(id) {
        const shortcut = this.shortcuts.find(s => s.id === id);
        if (!shortcut) return;
        
        if (confirm(`确定要删除 "${shortcut.name}" 吗？`)) {
            this.shortcuts = this.shortcuts.filter(s => s.id !== id);
            this.saveShortcuts();
            this.renderShortcuts();
            Utils.showToast(`已删除 ${shortcut.name}`, 'success');
        }
    }

    /**
     * 显示上下文菜单
     * @param {MouseEvent} e - 鼠标事件
     * @param {string} shortcutId - 快捷方式ID
     */
    showContextMenu(e, shortcutId) {
        document.querySelector('.context-menu')?.remove();
        const shortcut = this.shortcuts.find(s => s.id === shortcutId);
        if (!shortcut) return;
        
        const menu = document.createElement('div');
        menu.className = 'context-menu glass-card';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="delete">
                <span class="context-menu-icon">🗑️</span>
                <span>删除</span>
            </div>
            <div class="context-menu-item" data-action="copy">
                <span class="context-menu-icon">📋</span>
                <span>复制链接</span>
            </div>
        `;
        menu.style.cssText = `
            position: fixed; 
            top: ${e.clientY}px; 
            left: ${e.clientX}px; 
            z-index: 1000; 
            padding: 0.5rem 0; 
            min-width: 120px; 
            opacity: 0;
        `;
        document.body.appendChild(menu);
        
        // 触发动画
        setTimeout(() => {
            menu.classList.add('show');
        }, 10);
        
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.getAttribute('data-action');
            if (action) {
                this.handleContextMenuAction(action, shortcutId);
                menu.remove();
            }
        });
        
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.classList.remove('show');
                setTimeout(() => menu.remove(), 200);
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }

    /**
     * 处理上下文菜单操作
     * @param {string} action - 操作类型
     * @param {string} shortcutId - 快捷方式ID
     */
    handleContextMenuAction(action, shortcutId) {
        const shortcut = this.shortcuts.find(s => s.id === shortcutId);
        if (!shortcut) return;
        
        if (action === 'delete') {
            this.deleteShortcut(shortcutId);
        } else if (action === 'copy') {
            navigator.clipboard.writeText(shortcut.url).then(() => {
                Utils.showToast('链接已复制到剪贴板', 'success');
            });
        }
    }

    /**
     * 保存快捷方式到本地存储
     */
    saveShortcuts() { 
        Utils.storage.set('quickAccessShortcuts', this.shortcuts); 
    }
}

// 添加上下文菜单和空状态样式
const quickAccessStyles = `
    .context-menu {
        background: rgba(255, 255, 255, 0.1) !important;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transform: scale(0.9) translateY(-10px);
        opacity: 0;
        transition: transform 0.2s ease-out, opacity 0.2s ease-out;
    }

    .context-menu.show {
        transform: scale(1) translateY(0);
        opacity: 1;
    }

    .context-menu-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: transform 0.1s ease-out;
        font-size: 0.9rem;
    }

    .context-menu-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .context-menu-item:active {
        transform: scale(0.95);
    }

    .context-menu-icon {
        font-size: 0.8rem;
    }

    .empty-state {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 1rem;
        text-align: center;
        opacity: 0.7;
    }

    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .empty-text {
        font-size: 1.1rem;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }

    .empty-subtext {
        font-size: 0.9rem;
        color: var(--text-secondary);
    }

    .shortcut-icon img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
    }

    .fallback-icon {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    }
`;

// 添加样式到页面
if (!document.getElementById('quick-access-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'quick-access-styles';
    styleSheet.textContent = quickAccessStyles;
    document.head.appendChild(styleSheet);
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.Clock = Clock;
    window.Search = Search;
    window.QuickAccess = QuickAccess;
}
