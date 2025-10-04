// 工具函数模块
class Utils {
    static formatTime(date) {
        return [date.getHours(), date.getMinutes(), date.getSeconds()]
            .map(n => n.toString().padStart(2, '0')).join(':');
    }

    static formatDate(date) {
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日 ${weekdays[date.getDay()]}`;
    }

    static debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    static isValidUrl(string) {
        try { new URL(string); return true; } catch { return false; }
    }

    static formatUrl(url) {
        url = url.trim();
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return 'https://' + (url.startsWith('www.') ? url : url);
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static storage = {
        get(key, defaultValue = null) {
            try { return JSON.parse(localStorage.getItem(key)) || defaultValue; }
            catch { return defaultValue; }
        },
        set(key, value) {
            try { localStorage.setItem(key, JSON.stringify(value)); return true; }
            catch { return false; }
        }
    };

    static searchSuggestions = ['Google', 'YouTube', 'GitHub', 'Stack Overflow', 'MDN Web Docs', 'Wikipedia', 'Twitter', 'Reddit', 'Netflix', 'Amazon'];

    static getSearchSuggestions(query) {
        if (!query || query.length < 2) return [];
        const lowerQuery = query.toLowerCase();
        return this.searchSuggestions.filter(s => s.toLowerCase().includes(lowerQuery)).slice(0, 5);
    }

    static performSearch(query) {
        const url = this.isValidUrl(query) ? this.formatUrl(query) : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    }
}
