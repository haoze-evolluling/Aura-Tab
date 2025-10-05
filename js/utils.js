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
        try { 
            new URL(string); 
            return true; 
        } catch { 
            return false; 
        }
    }

    static formatUrl(url) {
        url = url.trim();
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return 'https://' + url;
    }

    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    static storage = {
        get(key, defaultValue = null) {
            try { 
                return JSON.parse(localStorage.getItem(key)) || defaultValue; 
            } catch { 
                return defaultValue; 
            }
        },
        set(key, value) {
            try { 
                localStorage.setItem(key, JSON.stringify(value)); 
                return true; 
            } catch { 
                return false; 
            }
        }
    };

    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} glass-card`;
        toast.textContent = message;
        
        const styles = {
            position: 'fixed', 
            top: '2rem', 
            right: '2rem', 
            zIndex: '1001',
            padding: '1rem 1.5rem', 
            borderRadius: '8px', 
            color: 'var(--text-primary)',
            fontSize: '0.9rem', 
            opacity: '0', 
            transform: 'translateX(100%)',
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out'
        };
        
        if (type === 'error') {
            styles.background = 'rgba(255, 107, 107, 0.2)';
            styles.borderColor = 'rgba(255, 107, 107, 0.3)';
        } else if (type === 'success') {
            styles.background = 'rgba(107, 255, 107, 0.2)';
            styles.borderColor = 'rgba(107, 255, 107, 0.3)';
        }
        
        Object.assign(toast.style, styles);
        document.body.appendChild(toast);
        
        // 触发进入动画
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // 3秒后开始退出动画
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.parentNode?.removeChild(toast), 300);
        }, 3000);
    }

    static performSearch(query) {
        const url = this.isValidUrl(query) ? this.formatUrl(query) : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    }
}
