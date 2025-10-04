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

    // 销毁时钟
    destroy() {
        this.stopClock();
    }
}

