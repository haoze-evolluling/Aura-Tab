// 快捷访问组件模块
class QuickAccess {
    constructor() {
        this.quickAccessGrid = document.getElementById('quickAccessGrid');
        this.addShortcutBtn = document.getElementById('addShortcutBtn');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.shortcutForm = document.getElementById('shortcutForm');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        this.shortcuts = [];
        this.init();
    }

    init() {
        this.loadShortcuts();
        this.renderShortcuts();
        this.addEventListeners();
        this.loadDefaultShortcuts();
    }

    addEventListeners() {
        // 添加快捷方式按钮
        if (this.addShortcutBtn) {
            this.addShortcutBtn.addEventListener('click', () => this.showAddModal());
        }

        // 表单提交
        if (this.shortcutForm) {
            this.shortcutForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // 取消按钮
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.hideModal());
        }

        // 模态框覆盖层点击
        if (this.modalOverlay) {
            this.modalOverlay.addEventListener('click', (e) => {
                if (e.target === this.modalOverlay) {
                    this.hideModal();
                }
            });
        }

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalOverlay.classList.contains('active')) {
                this.hideModal();
            }
        });
    }

    loadShortcuts() {
        this.shortcuts = Utils.storage.get('quickAccessShortcuts', []);
    }

    saveShortcuts() {
        Utils.storage.set('quickAccessShortcuts', this.shortcuts);
    }

    loadDefaultShortcuts() {
        // 如果没有快捷方式，加载默认的
        if (this.shortcuts.length === 0) {
            this.shortcuts = [
                {
                    id: Utils.generateId(),
                    name: 'Google',
                    url: 'https://www.google.com'
                },
                {
                    id: Utils.generateId(),
                    name: 'YouTube',
                    url: 'https://www.youtube.com'
                },
                {
                    id: Utils.generateId(),
                    name: 'GitHub',
                    url: 'https://github.com'
                },
                {
                    id: Utils.generateId(),
                    name: 'Stack Overflow',
                    url: 'https://stackoverflow.com'
                },
                {
                    id: Utils.generateId(),
                    name: 'MDN',
                    url: 'https://developer.mozilla.org'
                },
                {
                    id: Utils.generateId(),
                    name: 'Twitter',
                    url: 'https://twitter.com'
                }
            ];
            this.saveShortcuts();
            this.renderShortcuts();
        }
    }

    renderShortcuts() {
        if (!this.quickAccessGrid) return;

        if (this.shortcuts.length === 0) {
            this.quickAccessGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔗</div>
                    <div class="empty-text">暂无快捷方式</div>
                    <div class="empty-subtext">点击下方按钮添加常用网站</div>
                </div>
            `;
            return;
        }

        const html = this.shortcuts.map(shortcut => {
            const favicon = this.getFaviconUrl(shortcut.url);
            
            return `
                <a href="${shortcut.url}" 
                   class="shortcut-btn" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   data-id="${shortcut.id}">
                    <div class="shortcut-icon">
                        <img src="${favicon}" 
                             alt="${shortcut.name}" 
                             loading="lazy"
                             onerror="window.quickAccess.handleIconError(this, '${shortcut.url}')">
                        <div class="fallback-icon" style="display: none;">🌐</div>
                    </div>
                    <div class="shortcut-name">${shortcut.name}</div>
                    <button class="delete-shortcut" data-id="${shortcut.id}" title="删除">×</button>
                </a>
            `;
        }).join('');

        this.quickAccessGrid.innerHTML = html;

        // 添加删除事件监听器
        this.quickAccessGrid.querySelectorAll('.delete-shortcut').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-id');
                this.deleteShortcut(id);
            });
        });

        // 添加右键菜单
        this.quickAccessGrid.querySelectorAll('.shortcut-btn').forEach(btn => {
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                this.showContextMenu(e, id);
            });
        });
    }

    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            // 使用Google的favicon服务，这是最可靠的选择
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        } catch (error) {
            return this.getDefaultIcon();
        }
    }

    // 获取备用图标源列表 (精简版：Google → 腾讯 → 网站本身)
    getFaviconSources(url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            
            return [
                // 1. Google favicon服务
                `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
                // 2. favicon服务
                `https://statics.dnspod.cn/proxy_favicon/_/favicon?domain=${domain}`,
                // 3. 网站自身的favicon
                `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`
            ];
        } catch (error) {
            return [this.getDefaultIcon()];
        }
    }

    // 获取默认SVG图标
    getDefaultIcon() {
        return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
    }

    // 处理图标加载失败的回退逻辑 (精简版：Google → 腾讯 → 网站本身)
    handleIconError(imgElement, url) {
        const currentSrc = imgElement.src;
        const sources = this.getFaviconSources(url);
        
        // 找到当前失败的源在列表中的位置
        let currentIndex = sources.findIndex(src => src === currentSrc);
        
        // 如果找不到当前源，从第一个开始
        if (currentIndex === -1) {
            currentIndex = 0;
        }
        
        // 尝试下一个源
        const nextIndex = currentIndex + 1;
        
        if (nextIndex < sources.length) {
            // 还有其他源可以尝试
            const sourceNames = ['Google', '腾讯', '网站本身'];
            console.log(`图标加载失败，尝试${sourceNames[nextIndex]}服务: ${sources[nextIndex]}`);
            imgElement.src = sources[nextIndex];
        } else {
            // 所有源都失败了，显示默认图标
            console.log(`所有图标源都失败，显示默认图标: ${url}`);
            imgElement.style.display = 'none';
            const fallbackIcon = imgElement.nextElementSibling;
            if (fallbackIcon && fallbackIcon.classList.contains('fallback-icon')) {
                fallbackIcon.style.display = 'flex';
            }
        }
    }


    showAddModal() {
        if (this.modalOverlay) {
            this.modalOverlay.classList.add('active');
            
            // 清空表单
            const nameInput = document.getElementById('shortcutName');
            const urlInput = document.getElementById('shortcutUrl');
            if (nameInput) nameInput.value = '';
            if (urlInput) urlInput.value = '';
            
            // 聚焦到名称输入框
            setTimeout(() => {
                if (nameInput) nameInput.focus();
            }, 100);
        }
    }

    hideModal() {
        if (this.modalOverlay) {
            this.modalOverlay.classList.remove('active');
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const nameInput = document.getElementById('shortcutName');
        const urlInput = document.getElementById('shortcutUrl');
        
        if (!nameInput || !urlInput) return;
        
        const name = nameInput.value.trim();
        const url = urlInput.value.trim();
        
        if (!name || !url) {
            this.showError('请填写完整信息');
            return;
        }

        if (!Utils.isValidUrl(Utils.formatUrl(url))) {
            this.showError('请输入有效的网址');
            return;
        }

        this.addShortcut({
            name: name,
            url: Utils.formatUrl(url)
        });

        this.hideModal();
    }

    addShortcut(shortcutData) {
        const shortcut = {
            id: Utils.generateId(),
            name: shortcutData.name,
            url: shortcutData.url
        };

        this.shortcuts.push(shortcut);
        this.saveShortcuts();
        this.renderShortcuts();

        // 显示成功提示
        this.showSuccess(`已添加 ${shortcut.name}`);
    }

    deleteShortcut(id) {
        const shortcut = this.shortcuts.find(s => s.id === id);
        if (!shortcut) return;

        if (confirm(`确定要删除 "${shortcut.name}" 吗？`)) {
            this.shortcuts = this.shortcuts.filter(s => s.id !== id);
            this.saveShortcuts();
            this.renderShortcuts();
            this.showSuccess(`已删除 ${shortcut.name}`);
        }
    }


    showContextMenu(e, shortcutId) {
        // 移除现有的上下文菜单
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

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
            transform: scale(0.95);
            /* 移除过渡效果 */
        `;

        document.body.appendChild(menu);

        // 直接显示
        menu.style.opacity = '1';
        menu.style.transform = 'scale(1)';

        // 添加事件监听器
        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.context-menu-item')?.getAttribute('data-action');
            if (action) {
                this.handleContextMenuAction(action, shortcutId);
                menu.remove();
            }
        });

        // 点击外部关闭
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    }

    handleContextMenuAction(action, shortcutId) {
        const shortcut = this.shortcuts.find(s => s.id === shortcutId);
        if (!shortcut) return;

        switch (action) {
            case 'delete':
                this.deleteShortcut(shortcutId);
                break;
            case 'copy':
                navigator.clipboard.writeText(shortcut.url).then(() => {
                    this.showSuccess('链接已复制到剪贴板');
                });
                break;
        }
    }


    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} glass-card`;
        toast.textContent = message;
        
        toast.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 1001;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 0.9rem;
            opacity: 0;
            transform: translateX(100%);
        `;

        if (type === 'error') {
            toast.style.background = 'rgba(255, 107, 107, 0.2)';
            toast.style.borderColor = 'rgba(255, 107, 107, 0.3)';
        } else if (type === 'success') {
            toast.style.background = 'rgba(107, 255, 107, 0.2)';
            toast.style.borderColor = 'rgba(107, 255, 107, 0.3)';
        }

        document.body.appendChild(toast);

        // 直接显示
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';

        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
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
    }

    .context-menu-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        cursor: pointer;
        transition: var(--transition);
        font-size: 0.9rem;
    }

    .context-menu-item:hover {
        background: rgba(255, 255, 255, 0.1);
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
