/**
 * Aura Tab - 核心工具模块
 * 提供基础工具函数、存储管理、通知系统等核心功能
 */

// 工具函数类
class Utils {
    /**
     * 格式化时间为 HH:MM:SS 格式
     * @param {Date} date - 日期对象
     * @returns {string} 格式化后的时间字符串
     */
    static formatTime(date) {
        return [date.getHours(), date.getMinutes(), date.getSeconds()]
            .map(n => n.toString().padStart(2, '0')).join(':');
    }

    /**
     * 格式化日期为中文格式
     * @param {Date} date - 日期对象
     * @returns {string} 格式化后的日期字符串
     */
    static formatDate(date) {
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return `${date.getFullYear()}年${(date.getMonth() + 1).toString().padStart(2, '0')}月${date.getDate().toString().padStart(2, '0')}日 ${weekdays[date.getDay()]}`;
    }

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
    static debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    /**
     * 验证URL是否有效
     * @param {string} string - 要验证的字符串
     * @returns {boolean} 是否为有效URL
     */
    static isValidUrl(string) {
        try { 
            new URL(string); 
            return true; 
        } catch { 
            return false; 
        }
    }

    /**
     * 格式化URL，自动添加协议
     * @param {string} url - 原始URL
     * @returns {string} 格式化后的URL
     */
    static formatUrl(url) {
        url = url.trim();
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return 'https://' + url;
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一标识符
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 本地存储管理
     */
    static storage = {
        /**
         * 获取存储的数据
         * @param {string} key - 存储键
         * @param {*} defaultValue - 默认值
         * @returns {*} 存储的数据或默认值
         */
        get(key, defaultValue = null) {
            try { 
                return JSON.parse(localStorage.getItem(key)) || defaultValue; 
            } catch { 
                return defaultValue; 
            }
        },
        
        /**
         * 设置存储的数据
         * @param {string} key - 存储键
         * @param {*} value - 要存储的值
         * @returns {boolean} 是否成功
         */
        set(key, value) {
            try { 
                localStorage.setItem(key, JSON.stringify(value)); 
                return true; 
            } catch { 
                return false; 
            }
        }
    };

    /**
     * 显示通知消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 (info, success, error)
     */
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

    /**
     * 执行搜索操作
     * @param {string} query - 搜索查询
     */
    static performSearch(query) {
        const url = this.isValidUrl(query) ? this.formatUrl(query) : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.Utils = Utils;
}
