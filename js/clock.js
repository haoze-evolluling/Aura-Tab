// 时钟组件模块
class Clock {
    constructor() {
        this.timeElement = document.getElementById('timeDisplay');
        this.dateElement = document.getElementById('dateDisplay');
        this.isTooltipVisible = false; // 添加状态标记
        this.currentTooltip = null; // 当前显示的tooltip引用
        this.currentBackdrop = null; // 当前显示的backdrop引用
        this.init();
    }

    init() {
        this.updateTime();
        this.startClock();
        this.addEventListeners();
    }

    updateTime() {
        const now = new Date();
        
        if (this.timeElement) {
            this.timeElement.textContent = Utils.formatTime(now);
        }
        
        if (this.dateElement) {
            this.dateElement.textContent = Utils.formatDate(now);
        }
    }

    startClock() {
        // 立即更新一次
        this.updateTime();
        
        // 每秒更新一次
        this.clockInterval = setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    stopClock() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
            this.clockInterval = null;
        }
    }

    addEventListeners() {
        // 当页面获得焦点时重新同步时间
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateTime();
            }
        });

        // 当窗口获得焦点时重新同步时间
        window.addEventListener('focus', () => {
            this.updateTime();
        });

        // 添加时钟点击事件，显示更多时间信息
        if (this.timeElement) {
            this.timeElement.addEventListener('click', () => {
                this.showTimeDetails();
            });
        }
    }

    showTimeDetails() {
        // 如果已经有窗口显示，则不打开新的
        if (this.isTooltipVisible) {
            return;
        }

        const now = new Date();
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const utcTime = now.toUTCString();
        const localTime = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        });

        // 创建背景遮罩
        const backdrop = document.createElement('div');
        backdrop.className = 'time-tooltip-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            z-index: 999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // 创建时间详情提示
        const tooltip = document.createElement('div');
        tooltip.className = 'time-tooltip glass-card';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-item">
                    <span class="tooltip-label">本地时间:</span>
                    <span class="tooltip-value">${localTime}</span>
                </div>
                <div class="tooltip-item">
                    <span class="tooltip-label">时区:</span>
                    <span class="tooltip-value">${timeZone}</span>
                </div>
                <div class="tooltip-item">
                    <span class="tooltip-label">UTC时间:</span>
                    <span class="tooltip-value">${utcTime}</span>
                </div>
            </div>
        `;

        // 添加样式
        tooltip.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            z-index: 1000;
            padding: 1.5rem;
            min-width: 300px;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;

        // 设置状态
        this.isTooltipVisible = true;
        this.currentTooltip = tooltip;
        this.currentBackdrop = backdrop;

        // 添加到页面
        document.body.appendChild(backdrop);
        document.body.appendChild(tooltip);

        // 使用弹性动画显示
        requestAnimationFrame(() => {
            backdrop.style.opacity = '1';
            tooltip.style.animation = 'tooltipBounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translate(-50%, -50%) scale(1)';
        });

        // 3秒后自动隐藏
        const autoHideTimer = setTimeout(() => {
            this.hideTooltip(tooltip, backdrop);
        }, 3000);

        // 点击隐藏
        const hideHandler = () => {
            clearTimeout(autoHideTimer);
            this.hideTooltip(tooltip, backdrop);
        };
        
        tooltip.addEventListener('click', hideHandler);
        backdrop.addEventListener('click', hideHandler);
    }

    hideTooltip(tooltip, backdrop) {
        if (!tooltip || !tooltip.parentNode) {
            return;
        }

        // 使用弹性关闭动画
        if (backdrop && backdrop.parentNode) {
            backdrop.style.opacity = '0';
        }
        tooltip.style.animation = 'tooltipBounceOut 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53)';
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translate(-50%, -50%) scale(0.8)';

        setTimeout(() => {
            if (backdrop && backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
            }
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
            // 重置状态
            this.isTooltipVisible = false;
            this.currentTooltip = null;
            this.currentBackdrop = null;
        }, 300);
    }


    // 销毁时钟
    destroy() {
        this.stopClock();
        
        // 清理当前显示的tooltip
        if (this.currentTooltip) {
            this.hideTooltip(this.currentTooltip, this.currentBackdrop);
        }
        
        // 移除事件监听器
        if (this.timeElement) {
            this.timeElement.removeEventListener('click', this.showTimeDetails);
        }
    }
}

// 添加时间详情提示的CSS样式
const timeTooltipStyles = `
    .time-tooltip {
        background: rgba(255, 255, 255, 0.1) !important;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform, opacity;
    }

    .time-tooltip:hover {
        background: rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(255, 255, 255, 0.3);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .tooltip-content {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .tooltip-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        transition: all 0.2s ease;
    }

    .tooltip-item:hover {
        transform: translateX(2px);
    }

    .tooltip-label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        font-weight: 500;
    }

    .tooltip-value {
        font-size: 0.9rem;
        color: var(--text-primary);
        font-family: 'Courier New', monospace;
    }

    /* 添加弹性动画关键帧 */
    @keyframes tooltipBounceIn {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3) rotate(-10deg);
        }
        50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.05) rotate(2deg);
        }
        70% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(0.98) rotate(-1deg);
        }
        100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }
    }

    @keyframes tooltipBounceOut {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }
        30% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1.02) rotate(1deg);
        }
        100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8) rotate(-5deg);
        }
    }

    /* 添加背景模糊遮罩动画 */
    @keyframes backdropFadeIn {
        0% {
            opacity: 0;
            backdrop-filter: blur(0px);
        }
        100% {
            opacity: 1;
            backdrop-filter: blur(20px);
        }
    }

    @keyframes backdropFadeOut {
        0% {
            opacity: 1;
            backdrop-filter: blur(20px);
        }
        100% {
            opacity: 0;
            backdrop-filter: blur(0px);
        }
    }

`;

// 添加样式到页面
if (!document.getElementById('clock-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'clock-styles';
    styleSheet.textContent = timeTooltipStyles;
    document.head.appendChild(styleSheet);
}
