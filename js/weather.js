/**
 * Aura Tab - 天气组件模块
 * 负责天气数据的获取、显示和城市选择功能
 */

/**
 * 天气组件类
 * 管理天气数据的获取、显示和城市选择
 */
class Weather {
    constructor() {
        this.currentCity = null;
        this.weatherData = null;
        this.updateInterval = null;
        this.isLoading = false;
        
        // DOM元素
        this.elements = {
            widget: document.getElementById('weatherWidget'),
            icon: document.getElementById('weatherIcon'),
            temp: document.getElementById('weatherTemp'),
            city: document.getElementById('weatherCity'),
            settings: document.getElementById('weatherSettings'),
            modal: document.getElementById('citySelectModal'),
            searchInput: document.getElementById('citySearchInput'),
            cityList: document.getElementById('cityList'),
            cancelBtn: document.getElementById('citySelectCancelBtn')
        };
        
        this.init();
    }

    /**
     * 初始化天气组件
     */
    init() {
        this.loadSavedCity();
        this.setupEventListeners();
        this.loadWeatherData();
        this.setupAutoUpdate();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 设置按钮点击事件
        this.elements.settings?.addEventListener('click', () => {
            this.showCitySelectModal();
        });

        // 城市搜索输入事件
        this.elements.searchInput?.addEventListener('input', (e) => {
            this.searchCities(e.target.value);
        });

        // 取消按钮事件
        this.elements.cancelBtn?.addEventListener('click', () => {
            this.hideCitySelectModal();
        });

        // 模态框背景点击关闭
        this.elements.modal?.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.hideCitySelectModal();
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modal?.classList.contains('active')) {
                this.hideCitySelectModal();
            }
        });
    }

    /**
     * 加载保存的城市设置
     */
    loadSavedCity() {
        const savedCity = localStorage.getItem('auraTabWeatherCity');
        if (savedCity) {
            try {
                this.currentCity = JSON.parse(savedCity);
                this.updateCityDisplay();
            } catch (error) {
                console.warn('无法解析保存的城市数据:', error);
                localStorage.removeItem('auraTabWeatherCity');
            }
        }
    }

    /**
     * 保存城市设置
     */
    saveCity(city) {
        this.currentCity = city;
        localStorage.setItem('auraTabWeatherCity', JSON.stringify(city));
        this.updateCityDisplay();
    }

    /**
     * 更新城市显示
     */
    updateCityDisplay() {
        if (this.currentCity) {
            this.elements.city.textContent = this.currentCity.name;
        } else {
            this.elements.city.textContent = '选择城市';
        }
    }

    /**
     * 显示城市选择模态框
     */
    showCitySelectModal() {
        this.elements.modal?.classList.add('active');
        this.elements.searchInput?.focus();
        this.loadPopularCities();
    }

    /**
     * 隐藏城市选择模态框
     */
    hideCitySelectModal() {
        this.elements.modal?.classList.remove('active');
        this.elements.searchInput.value = '';
        this.elements.cityList.innerHTML = '';
    }

    /**
     * 加载热门城市列表
     */
    async loadPopularCities() {
        const popularCities = [
            { name: '北京', country: '中国', lat: 39.9042, lon: 116.4074 },
            { name: '上海', country: '中国', lat: 31.2304, lon: 121.4737 },
            { name: '广州', country: '中国', lat: 23.1291, lon: 113.2644 },
            { name: '深圳', country: '中国', lat: 22.5431, lon: 114.0579 },
            { name: '杭州', country: '中国', lat: 30.2741, lon: 120.1551 },
            { name: '成都', country: '中国', lat: 30.5728, lon: 104.0668 },
            { name: '西安', country: '中国', lat: 34.3416, lon: 108.9398 },
            { name: '武汉', country: '中国', lat: 30.5928, lon: 114.3055 },
            { name: 'New York', country: '美国', lat: 40.7128, lon: -74.0060 },
            { name: 'London', country: '英国', lat: 51.5074, lon: -0.1278 },
            { name: 'Tokyo', country: '日本', lat: 35.6762, lon: 139.6503 },
            { name: 'Paris', country: '法国', lat: 48.8566, lon: 2.3522 }
        ];

        this.displayCities(popularCities);
    }

    /**
     * 搜索城市
     */
    async searchCities(query) {
        if (!query || query.length < 2) {
            this.loadPopularCities();
            return;
        }

        // 直接使用本地搜索，避免API密钥问题
        this.searchCitiesLocally(query);
    }

    /**
     * 本地城市搜索（备用方案）
     */
    searchCitiesLocally(query) {
        const allCities = [
            { name: '北京', country: '中国', lat: 39.9042, lon: 116.4074 },
            { name: '上海', country: '中国', lat: 31.2304, lon: 121.4737 },
            { name: '广州', country: '中国', lat: 23.1291, lon: 113.2644 },
            { name: '深圳', country: '中国', lat: 22.5431, lon: 114.0579 },
            { name: '杭州', country: '中国', lat: 30.2741, lon: 120.1551 },
            { name: '成都', country: '中国', lat: 30.5728, lon: 104.0668 },
            { name: '西安', country: '中国', lat: 34.3416, lon: 108.9398 },
            { name: '武汉', country: '中国', lat: 30.5928, lon: 114.3055 },
            { name: '南京', country: '中国', lat: 32.0603, lon: 118.7969 },
            { name: '天津', country: '中国', lat: 39.3434, lon: 117.3616 },
            { name: '重庆', country: '中国', lat: 29.4316, lon: 106.9123 },
            { name: '苏州', country: '中国', lat: 31.2989, lon: 120.5853 },
            { name: 'New York', country: '美国', lat: 40.7128, lon: -74.0060 },
            { name: 'London', country: '英国', lat: 51.5074, lon: -0.1278 },
            { name: 'Tokyo', country: '日本', lat: 35.6762, lon: 139.6503 },
            { name: 'Paris', country: '法国', lat: 48.8566, lon: 2.3522 },
            { name: 'Sydney', country: '澳大利亚', lat: -33.8688, lon: 151.2093 },
            { name: 'Los Angeles', country: '美国', lat: 34.0522, lon: -118.2437 },
            { name: 'Chicago', country: '美国', lat: 41.8781, lon: -87.6298 },
            { name: 'Toronto', country: '加拿大', lat: 43.6532, lon: -79.3832 }
        ];

        const filteredCities = allCities.filter(city => 
            city.name.toLowerCase().includes(query.toLowerCase()) ||
            city.country.toLowerCase().includes(query.toLowerCase())
        );

        this.displayCities(filteredCities.slice(0, 10));
    }

    /**
     * 显示城市列表
     */
    displayCities(cities) {
        if (!this.elements.cityList) return;

        this.elements.cityList.innerHTML = '';

        cities.forEach(city => {
            const cityItem = document.createElement('div');
            cityItem.className = 'city-item';
            cityItem.innerHTML = `
                <div>
                    <div class="city-name">${city.name}</div>
                    <div class="city-country">${city.country}</div>
                </div>
                <div class="city-coords">${city.lat.toFixed(2)}, ${city.lon.toFixed(2)}</div>
            `;

            cityItem.addEventListener('click', () => {
                this.selectCity(city);
            });

            this.elements.cityList.appendChild(cityItem);
        });
    }

    /**
     * 选择城市
     */
    selectCity(city) {
        this.saveCity(city);
        this.hideCitySelectModal();
        this.loadWeatherData();
    }

    /**
     * 加载天气数据
     */
    async loadWeatherData() {
        if (!this.currentCity) {
            this.showNoCityState();
            return;
        }

        if (this.isLoading) return;
        this.isLoading = true;

        try {
            // 使用免费的wttr.in API获取天气数据
            const response = await fetch(
                `https://wttr.in/${this.currentCity.lat},${this.currentCity.lon}?format=j1&lang=zh`
            );

            if (!response.ok) {
                throw new Error('天气数据获取失败');
            }

            const data = await response.json();
            this.weatherData = data;
            this.updateWeatherDisplay();
        } catch (error) {
            console.warn('天气数据获取失败:', error);
            // 如果wttr.in失败，尝试使用备用API
            await this.loadWeatherDataFallback();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 备用天气数据获取方法
     */
    async loadWeatherDataFallback() {
        try {
            // 使用免费的Open-Meteo API作为备用
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${this.currentCity.lat}&longitude=${this.currentCity.lon}&current_weather=true&timezone=auto`
            );

            if (!response.ok) {
                throw new Error('备用API也失败');
            }

            const data = await response.json();
            // 转换数据格式以匹配我们的显示方法
            this.weatherData = {
                main: { temp: data.current_weather.temperature },
                weather: [{ 
                    description: this.getWeatherDescription(data.current_weather.weathercode),
                    icon: this.getWeatherIconCode(data.current_weather.weathercode)
                }]
            };
            this.updateWeatherDisplay();
        } catch (error) {
            console.warn('备用天气API也失败:', error);
            this.showErrorState();
        }
    }

    /**
     * 更新天气显示
     */
    updateWeatherDisplay() {
        if (!this.weatherData) return;

        let temp, description, iconCode;

        // 处理wttr.in API数据格式
        if (this.weatherData.current_condition) {
            temp = Math.round(this.weatherData.current_condition.temp_C);
            description = this.weatherData.current_condition.lang_zh[0].value;
            iconCode = this.weatherData.current_condition.weatherCode;
        }
        // 处理Open-Meteo API数据格式
        else if (this.weatherData.main) {
            temp = Math.round(this.weatherData.main.temp);
            description = this.weatherData.weather[0].description;
            iconCode = this.weatherData.weather[0].icon;
        }

        this.elements.temp.textContent = `${temp}°C`;
        this.elements.icon.textContent = this.getWeatherEmoji(iconCode);
        
        // 添加天气描述到城市名称
        if (this.currentCity) {
            this.elements.city.textContent = `${this.currentCity.name} · ${description}`;
        }
    }

    /**
     * 获取天气描述（Open-Meteo天气代码转换）
     */
    getWeatherDescription(code) {
        const descriptions = {
            0: '晴朗',
            1: '主要晴朗',
            2: '部分多云',
            3: '阴天',
            45: '雾',
            48: '霜雾',
            51: '小雨',
            53: '中雨',
            55: '大雨',
            56: '冻雨',
            57: '冻雨',
            61: '小雨',
            63: '中雨',
            65: '大雨',
            66: '冻雨',
            67: '冻雨',
            71: '小雪',
            73: '中雪',
            75: '大雪',
            77: '雪粒',
            80: '小雨',
            81: '中雨',
            82: '大雨',
            85: '小雪',
            86: '大雪',
            95: '雷暴',
            96: '雷暴',
            99: '雷暴'
        };
        return descriptions[code] || '未知';
    }

    /**
     * 获取天气图标代码（Open-Meteo天气代码转换）
     */
    getWeatherIconCode(code) {
        const iconMap = {
            0: '01d', 1: '01d', 2: '02d', 3: '04d',
            45: '50d', 48: '50d',
            51: '09d', 53: '09d', 55: '09d',
            56: '13d', 57: '13d',
            61: '10d', 63: '10d', 65: '10d',
            66: '13d', 67: '13d',
            71: '13d', 73: '13d', 75: '13d', 77: '13d',
            80: '09d', 81: '09d', 82: '09d',
            85: '13d', 86: '13d',
            95: '11d', 96: '11d', 99: '11d'
        };
        return iconMap[code] || '01d';
    }

    /**
     * 获取天气表情符号
     */
    getWeatherEmoji(iconCode) {
        const iconMap = {
            '01d': '☀️', '01n': '🌙',
            '02d': '⛅', '02n': '☁️',
            '03d': '☁️', '03n': '☁️',
            '04d': '☁️', '04n': '☁️',
            '09d': '🌧️', '09n': '🌧️',
            '10d': '🌦️', '10n': '🌧️',
            '11d': '⛈️', '11n': '⛈️',
            '13d': '❄️', '13n': '❄️',
            '50d': '🌫️', '50n': '🌫️'
        };
        return iconMap[iconCode] || '🌤️';
    }

    /**
     * 显示无城市状态
     */
    showNoCityState() {
        this.elements.temp.textContent = '--°C';
        this.elements.icon.textContent = '🌤️';
        this.elements.city.textContent = '选择城市';
    }

    /**
     * 显示错误状态
     */
    showErrorState() {
        this.elements.temp.textContent = '--°C';
        this.elements.icon.textContent = '❌';
        this.elements.city.textContent = '获取失败';
    }

    /**
     * 设置自动更新
     */
    setupAutoUpdate() {
        // 每30分钟更新一次天气数据
        this.updateInterval = setInterval(() => {
            if (this.currentCity) {
                this.loadWeatherData();
            }
        }, 30 * 60 * 1000);
    }

    /**
     * 销毁组件
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.Weather = Weather;
}
