// 时钟组件模块
class Clock {
    constructor() {
        this.timeElement = document.getElementById('timeDisplay');
        this.dateElement = document.getElementById('dateDisplay');
        this.updateTime();
        this.clockInterval = setInterval(() => this.updateTime(), 1000);
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

    destroy() { 
        clearInterval(this.clockInterval); 
    }
}
