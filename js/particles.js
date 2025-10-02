// 粒子动画模块
class Particles {
    constructor() {
        this.container = document.getElementById('particles');
        this.particles = [];
        this.particleCount = 50;
        this.animationId = null;
        this.init();
    }

    init() {
        if (!this.container) return;
        
        this.createParticles();
        // 移除动画调用以禁用动态效果
        // this.animate();
        this.addEventListeners();
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机大小
        const size = Math.random() * 4 + 2;
        
        // 随机位置
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        // 随机速度
        const vx = (Math.random() - 0.5) * 0.5;
        const vy = (Math.random() - 0.5) * 0.5;
        
        // 随机透明度
        const opacity = Math.random() * 0.3 + 0.1;
        
        // 设置样式 - 使用静态位置
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            opacity: ${opacity};
            background: rgba(255, 255, 255, ${opacity});
            transform: translate(0px, 0px);
        `;

        // 存储粒子数据
        particle.particleData = {
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            size: size,
            opacity: opacity,
            baseOpacity: opacity,
            angle: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02
        };

        this.container.appendChild(particle);
        this.particles.push(particle);
    }

    animate() {
        this.updateParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updateParticles() {
        this.particles.forEach(particle => {
            const data = particle.particleData;
            
            // 更新位置
            data.x += data.vx;
            data.y += data.vy;
            data.angle += data.rotationSpeed;
            
            // 添加轻微的波动
            const wave = Math.sin(data.angle) * 0.5;
            data.x += wave * 0.1;
            data.y += wave * 0.1;
            
            // 边界检测和重置
            if (data.x < -data.size) {
                data.x = window.innerWidth + data.size;
            } else if (data.x > window.innerWidth + data.size) {
                data.x = -data.size;
            }
            
            if (data.y < -data.size) {
                data.y = window.innerHeight + data.size;
            } else if (data.y > window.innerHeight + data.size) {
                data.y = -data.size;
            }
            
            // 更新透明度（呼吸效果）
            const breathe = Math.sin(Date.now() * 0.001 + data.angle) * 0.1;
            data.opacity = Math.max(0.05, data.baseOpacity + breathe);
            
            // 应用变换
            particle.style.transform = `translate(${data.x}px, ${data.y}px) rotate(${data.angle}rad)`;
            particle.style.opacity = data.opacity;
        });
    }

    addEventListeners() {
        // 窗口大小改变时重新计算
        window.addEventListener('resize', Utils.throttle(() => {
            this.handleResize();
        }, 250));

        // 鼠标移动交互
        document.addEventListener('mousemove', Utils.throttle((e) => {
            this.handleMouseMove(e);
        }, 16));

        // 页面可见性改变
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    handleResize() {
        // 重新分布粒子
        this.particles.forEach(particle => {
            const data = particle.particleData;
            if (data.x > window.innerWidth) {
                data.x = Math.random() * window.innerWidth;
            }
            if (data.y > window.innerHeight) {
                data.y = Math.random() * window.innerHeight;
            }
        });
    }

    handleMouseMove(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const influence = 100; // 影响范围

        this.particles.forEach(particle => {
            const data = particle.particleData;
            const dx = mouseX - data.x;
            const dy = mouseY - data.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < influence) {
                const force = (influence - distance) / influence;
                const angle = Math.atan2(dy, dx);
                
                // 推开粒子
                data.vx -= Math.cos(angle) * force * 0.01;
                data.vy -= Math.sin(angle) * force * 0.01;
                
                // 限制速度
                const maxSpeed = 2;
                const speed = Math.sqrt(data.vx * data.vx + data.vy * data.vy);
                if (speed > maxSpeed) {
                    data.vx = (data.vx / speed) * maxSpeed;
                    data.vy = (data.vy / speed) * maxSpeed;
                }
                
                // 增加亮度
                data.opacity = Math.min(0.8, data.baseOpacity + force * 0.3);
            } else {
                // 恢复原始速度
                data.vx *= 0.98;
                data.vy *= 0.98;
                data.opacity = Math.max(data.baseOpacity, data.opacity * 0.98);
            }
        });
    }

    pause() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    resume() {
        if (!this.animationId) {
            this.animate();
        }
    }

    destroy() {
        this.pause();
        
        // 移除所有粒子
        this.particles.forEach(particle => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        });
        
        this.particles = [];
        
        // 移除事件监听器
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }

    // 动态调整粒子数量
    setParticleCount(count) {
        const currentCount = this.particles.length;
        
        if (count > currentCount) {
            // 添加粒子
            for (let i = currentCount; i < count; i++) {
                this.createParticle();
            }
        } else if (count < currentCount) {
            // 移除粒子
            const toRemove = this.particles.splice(count);
            toRemove.forEach(particle => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            });
        }
        
        this.particleCount = count;
    }

    // 根据性能调整粒子数量
    adjustForPerformance() {
        const fps = this.getFPS();
        
        if (fps < 30 && this.particleCount > 20) {
            this.setParticleCount(Math.max(20, this.particleCount - 10));
        } else if (fps > 50 && this.particleCount < 80) {
            this.setParticleCount(Math.min(80, this.particleCount + 5));
        }
    }

    getFPS() {
        // 简单的FPS计算
        if (!this.lastTime) {
            this.lastTime = performance.now();
            this.frameCount = 0;
            return 60;
        }
        
        this.frameCount++;
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;
        
        if (elapsed >= 1000) {
            const fps = (this.frameCount * 1000) / elapsed;
            this.lastTime = currentTime;
            this.frameCount = 0;
            return fps;
        }
        
        return 60; // 默认值
    }

    // 添加特殊效果
    addBurst(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle burst-particle';
            
            const size = Math.random() * 3 + 1;
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 3 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                opacity: 0.8;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
            `;

            particle.particleData = {
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                size: size,
                opacity: 0.8,
                life: 1.0,
                decay: 0.02
            };

            this.container.appendChild(particle);
            
            // 动画爆发粒子
            const animateBurst = () => {
                const data = particle.particleData;
                
                data.x += data.vx;
                data.y += data.vy;
                data.vx *= 0.98;
                data.vy *= 0.98;
                data.life -= data.decay;
                data.opacity = data.life;
                
                particle.style.transform = `translate(${data.x}px, ${data.y}px)`;
                particle.style.opacity = data.opacity;
                
                if (data.life > 0) {
                    requestAnimationFrame(animateBurst);
                } else {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }
            };
            
            animateBurst();
        }
    }
}

// 性能监控和自适应
class PerformanceMonitor {
    constructor(particles) {
        this.particles = particles;
        this.checkInterval = 5000; // 5秒检查一次
        this.init();
    }

    init() {
        // 检测设备性能
        this.detectDeviceCapability();
        
        // 定期性能检查
        setInterval(() => {
            this.particles.adjustForPerformance();
        }, this.checkInterval);
    }

    detectDeviceCapability() {
        // 检测是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // 检测硬件加速支持
        const hasHardwareAcceleration = this.checkHardwareAcceleration();
        
        // 根据设备能力调整粒子数量
        let particleCount = 50;
        
        if (isMobile) {
            particleCount = 20;
        } else if (!hasHardwareAcceleration) {
            particleCount = 30;
        }
        
        this.particles.setParticleCount(particleCount);
    }

    checkHardwareAcceleration() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
    }
}
