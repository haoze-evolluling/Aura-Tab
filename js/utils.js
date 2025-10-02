// 工具函数模块
class Utils {
    // 格式化时间
    static formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    // 格式化日期
    static formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekday = weekdays[date.getDay()];
        return `${year}年${month}月${day}日 ${weekday}`;
    }

    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }



    // 验证URL
    static isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // 格式化URL
    static formatUrl(url) {
        // 移除首尾空格
        url = url.trim();
        
        // 如果URL为空，返回空字符串
        if (!url) return '';
        
        // 如果已经包含协议，直接返回
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        // 如果URL以www.开头，添加https://
        if (url.startsWith('www.')) {
            return 'https://' + url;
        }
        
        // 如果URL包含.（可能是域名），添加https://
        if (url.includes('.')) {
            return 'https://' + url;
        }
        
        // 其他情况也添加https://
        return 'https://' + url;
    }

    // 生成随机ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 本地存储操作
    static storage = {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Error writing to localStorage:', error);
                return false;
            }
        }
    };


    // 搜索建议
    static searchSuggestions = [
        'Google',
        'YouTube',
        'GitHub',
        'Stack Overflow',
        'MDN Web Docs',
        'Wikipedia',
        'Twitter',
        'Reddit',
        'Netflix',
        'Amazon'
    ];

    // 获取搜索建议
    static getSearchSuggestions(query) {
        if (!query || query.length < 2) return [];
        
        const lowerQuery = query.toLowerCase();
        return this.searchSuggestions
            .filter(suggestion => suggestion.toLowerCase().includes(lowerQuery))
            .slice(0, 5);
    }

    // 执行搜索
    static performSearch(query) {
        if (this.isValidUrl(query)) {
            window.open(this.formatUrl(query), '_blank');
        } else {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            window.open(searchUrl, '_blank');
        }
    }
}
