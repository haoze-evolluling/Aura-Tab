// 时钟组件模块
class Clock {
    constructor() {
        this.timeElement = document.getElementById('timeDisplay');
        this.dateElement = document.getElementById('dateDisplay');
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
            transform: translate(-50%, -50%);
            z-index: 1000;
            padding: 1.5rem;
            min-width: 300px;
            opacity: 0;
            /* 移除过渡效果 */
        `;

        // 添加到页面
        document.body.appendChild(tooltip);

        // 直接显示
        tooltip.style.opacity = '1';

        // 3秒后自动隐藏
        setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        }, 3000);

        // 点击隐藏
        tooltip.addEventListener('click', () => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        });
    }


    // 销毁时钟
    destroy() {
        this.stopClock();
        
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

`;

// 添加样式到页面
if (!document.getElementById('clock-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'clock-styles';
    styleSheet.textContent = timeTooltipStyles;
    document.head.appendChild(styleSheet);
}
