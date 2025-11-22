/**
 * Aura Tab - 天气组件模块
 * 负责天气数据的获取、显示和城市选择功能
 */

/**
 * 城市数据管理器
 * 统一管理全球城市数据，按国家-省份-城市层级组织
 */
class CityDataManager {
    constructor() {
        this.cityData = this.initializeCityData();
        this.searchIndex = this.buildSearchIndex();
    }

    /**
     * 初始化城市数据 - 压缩格式，减少冗余
     */
    initializeCityData() {
        return {
            '中国': { region: '亚洲', provinces: {
                '直辖市': { cities: [
                    { name: '北京', lat: 39.9042, lon: 116.4074, p: 1 },
                    { name: '上海', lat: 31.2304, lon: 121.4737, p: 1 },
                    { name: '天津', lat: 39.0842, lon: 117.2008, p: 1 },
                    { name: '重庆', lat: 29.5630, lon: 106.5516, p: 1 }
                ]},
                '河北省': { cities: [
                    { name: '石家庄', lat: 38.0428, lon: 114.5149, p: 1 },
                    { name: '唐山', lat: 39.6339, lon: 118.1822 },
                    { name: '沧州', lat: 38.3045, lon: 116.8384 }
                ]},
                '山西省': { cities: [
                    { name: '太原', lat: 37.8733, lon: 112.5623, p: 1 },
                    { name: '长治', lat: 36.1825, lon: 113.1114 },
                    { name: '临汾', lat: 36.0883, lon: 111.5183 }
                ]},
                '辽宁省': { cities: [
                    { name: '沈阳', lat: 41.8057, lon: 123.4315, p: 1 },
                    { name: '大连', lat: 38.9140, lon: 121.6147, p: 1 },
                    { name: '鞍山', lat: 41.1200, lon: 122.9922 }
                ]},
                '吉林省': { cities: [
                    { name: '长春', lat: 43.8170, lon: 125.3235, p: 1 },
                    { name: '吉林', lat: 43.8580, lon: 126.5499 },
                    { name: '延吉', lat: 42.9056, lon: 129.5083 }
                ]},
                '黑龙江省': { cities: [
                    { name: '哈尔滨', lat: 45.8038, lon: 126.5350, p: 1 },
                    { name: '大庆', lat: 46.5919, lon: 125.1036 },
                    { name: '齐齐哈尔', lat: 47.3421, lon: 123.9550 }
                ]},
                '江苏省': { cities: [
                    { name: '南京', lat: 32.0603, lon: 118.7969, p: 1 },
                    { name: '苏州', lat: 31.2990, lon: 120.5853, p: 1 },
                    { name: '无锡', lat: 31.5689, lon: 120.2987 }
                ]},
                '浙江省': { cities: [
                    { name: '杭州', lat: 30.2741, lon: 120.1551, p: 1 },
                    { name: '宁波', lat: 29.8683, lon: 121.5440 },
                    { name: '温州', lat: 27.9943, lon: 120.6994 }
                ]},
                '安徽省': { cities: [
                    { name: '合肥', lat: 31.8206, lon: 117.2272, p: 1 },
                    { name: '芜湖', lat: 31.3582, lon: 118.3845 },
                    { name: '滁州', lat: 32.3083, lon: 118.3117 }
                ]},
                '福建省': { cities: [
                    { name: '福州', lat: 26.0745, lon: 119.2965, p: 1 },
                    { name: '厦门', lat: 24.4798, lon: 118.0894, p: 1 },
                    { name: '泉州', lat: 24.9139, lon: 118.5858 }
                ]},
                '江西省': { cities: [
                    { name: '南昌', lat: 28.6832, lon: 115.8921, p: 1 },
                    { name: '赣州', lat: 25.8502, lon: 114.9344 },
                    { name: '九江', lat: 29.7138, lon: 115.9926 }
                ]},
                '山东省': { cities: [
                    { name: '济南', lat: 36.6683, lon: 116.9975, p: 1 },
                    { name: '青岛', lat: 36.0671, lon: 120.3826, p: 1 },
                    { name: '烟台', lat: 37.4633, lon: 121.4479 }
                ]},
                '河南省': { cities: [
                    { name: '郑州', lat: 34.7466, lon: 113.6254, p: 1 },
                    { name: '洛阳', lat: 34.6697, lon: 112.4540 },
                    { name: '南阳', lat: 32.9901, lon: 112.5283 }
                ]},
                '湖北省': { cities: [
                    { name: '武汉', lat: 30.5928, lon: 114.3055, p: 1 },
                    { name: '襄阳', lat: 32.0432, lon: 112.1436 },
                    { name: '宜昌', lat: 30.7140, lon: 111.2847 }
                ]},
                '湖南省': { cities: [
                    { name: '长沙', lat: 28.2282, lon: 112.9389, p: 1 },
                    { name: '岳阳', lat: 29.3721, lon: 113.1326 },
                    { name: '常德', lat: 29.0401, lon: 111.6913 }
                ]},
                '广东省': { cities: [
                    { name: '广州', lat: 23.1291, lon: 113.2644, p: 1 },
                    { name: '深圳', lat: 22.5431, lon: 114.0579, p: 1 },
                    { name: '佛山', lat: 23.0215, lon: 113.1214 }
                ]},
                '海南省': { cities: [
                    { name: '海口', lat: 20.0458, lon: 110.3410, p: 1 },
                    { name: '三亚', lat: 18.2523, lon: 109.5118, p: 1 },
                    { name: '儋州', lat: 19.5160, lon: 109.5768 }
                ]},
                '四川省': { cities: [
                    { name: '成都', lat: 30.5728, lon: 104.0668, p: 1 },
                    { name: '绵阳', lat: 31.4679, lon: 104.7411 },
                    { name: '宜宾', lat: 28.7512, lon: 104.6436 }
                ]},
                '贵州省': { cities: [
                    { name: '贵阳', lat: 26.6477, lon: 106.6302, p: 1 },
                    { name: '遵义', lat: 27.7225, lon: 106.9322 },
                    { name: '毕节', lat: 27.3023, lon: 105.2863 }
                ]},
                '云南省': { cities: [
                    { name: '昆明', lat: 25.0422, lon: 102.7122, p: 1 },
                    { name: '曲靖', lat: 25.4925, lon: 103.7919 },
                    { name: '蒙自', lat: 23.3768, lon: 103.3934 }
                ]},
                '陕西省': { cities: [
                    { name: '西安', lat: 34.3416, lon: 108.9402, p: 1 },
                    { name: '榆林', lat: 38.2900, lon: 109.7423 },
                    { name: '宝鸡', lat: 34.3650, lon: 107.1444 }
                ]},
                '甘肃省': { cities: [
                    { name: '兰州', lat: 36.0611, lon: 103.8343, p: 1 },
                    { name: '庆阳', lat: 35.7380, lon: 107.6353 },
                    { name: '天水', lat: 34.5806, lon: 105.7249 }
                ]},
                '青海省': { cities: [
                    { name: '西宁', lat: 36.6171, lon: 101.7782, p: 1 },
                    { name: '德令哈', lat: 37.3697, lon: 97.3680 },
                    { name: '海东', lat: 36.5050, lon: 102.1068 }
                ]},
                '内蒙古自治区': { cities: [
                    { name: '呼和浩特', lat: 40.8183, lon: 111.6708, p: 1 },
                    { name: '包头', lat: 40.6522, lon: 109.8222 },
                    { name: '鄂尔多斯', lat: 39.6083, lon: 109.7816 }
                ]},
                '广西壮族自治区': { cities: [
                    { name: '南宁', lat: 22.8172, lon: 108.3666, p: 1 },
                    { name: '桂林', lat: 25.2800, lon: 110.2865, p: 1 },
                    { name: '柳州', lat: 24.3255, lon: 109.4344 }
                ]},
                '西藏自治区': { cities: [
                    { name: '拉萨', lat: 29.6456, lon: 91.1172, p: 1 },
                    { name: '日喀则', lat: 29.2718, lon: 88.8805 },
                    { name: '昌都', lat: 31.1444, lon: 97.1725 }
                ]},
                '宁夏回族自治区': { cities: [
                    { name: '银川', lat: 38.4681, lon: 106.2731, p: 1 },
                    { name: '石嘴山', lat: 39.0142, lon: 106.3813 },
                    { name: '吴忠', lat: 37.9944, lon: 106.1969 }
                ]},
                '新疆维吾尔自治区': { cities: [
                    { name: '乌鲁木齐', lat: 43.8256, lon: 87.6168, p: 1 },
                    { name: '昌吉', lat: 44.0150, lon: 87.3130 },
                    { name: '伊宁', lat: 43.9161, lon: 81.3248 }
                ]},
                '香港特别行政区': { cities: [
                    { name: '香港', lat: 22.3193, lon: 114.1694, p: 1 }
                ]},
                '澳门特别行政区': { cities: [
                    { name: '澳门', lat: 22.1987, lon: 113.5439, p: 1 }
                ]},
                '台湾省': { cities: [
                    { name: '台北', lat: 25.0330, lon: 121.5654, p: 1 },
                    { name: '新北', lat: 25.0169, lon: 121.4627 },
                    { name: '桃园', lat: 24.9936, lon: 121.2954 }
                ]}
            }},
            '日本': { region: '亚洲', provinces: {
                '东京都': { cities: [{ name: '东京', lat: 35.6762, lon: 139.6503, p: 1 }]},
                '大阪府': { cities: [{ name: '大阪', lat: 34.6937, lon: 135.5023, p: 1 }]}
            }},
            '韩国': { region: '亚洲', provinces: {
                '首尔特别市': { cities: [{ name: '首尔', lat: 37.5665, lon: 126.9780, p: 1 }]}
            }},
            '新加坡': { region: '亚洲', provinces: {
                '新加坡': { cities: [{ name: '新加坡', lat: 1.3521, lon: 103.8198, p: 1 }]}
            }},
            '美国': { region: '北美洲', provinces: {
                '加利福尼亚州': { cities: [
                    { name: '洛杉矶', lat: 34.0522, lon: -118.2437, p: 1 },
                    { name: '旧金山', lat: 37.7749, lon: -122.4194, p: 1 }
                ]},
                '纽约州': { cities: [{ name: '纽约', lat: 40.7128, lon: -74.0060, p: 1 }]},
                '伊利诺伊州': { cities: [{ name: '芝加哥', lat: 41.8781, lon: -87.6298, p: 1 }]}
            }},
            '英国': { region: '欧洲', provinces: {
                '英格兰': { cities: [{ name: '伦敦', lat: 51.5074, lon: -0.1278, p: 1 }]}
            }},
            '法国': { region: '欧洲', provinces: {
                '法兰西岛': { cities: [{ name: '巴黎', lat: 48.8566, lon: 2.3522, p: 1 }]}
            }},
            '德国': { region: '欧洲', provinces: {
                '柏林州': { cities: [{ name: '柏林', lat: 52.5200, lon: 13.4050, p: 1 }]}
            }},
            '澳大利亚': { region: '大洋洲', provinces: {
                '新南威尔士州': { cities: [{ name: '悉尼', lat: -33.8688, lon: 151.2093, p: 1 }]},
                '维多利亚州': { cities: [{ name: '墨尔本', lat: -37.8136, lon: 144.9631, p: 1 }]}
            }}
        };
    }

    /**
     * 构建搜索索引，提高搜索效率
     */
    buildSearchIndex() {
        const index = {
            cities: new Map(),
            countries: new Map(),
            provinces: new Map()
        };

        Object.entries(this.cityData).forEach(([countryKey, country]) => {
            // 索引国家
            index.countries.set(countryKey.toLowerCase(), country);
            
            Object.entries(country.provinces).forEach(([provinceKey, province]) => {
                // 索引省份
                index.provinces.set(provinceKey.toLowerCase(), province);
                
                province.cities.forEach(city => {
                    // 索引城市
                    const cityKey = city.name.toLowerCase();
                    if (!index.cities.has(cityKey)) {
                        index.cities.set(cityKey, []);
                    }
                    index.cities.get(cityKey).push({
                        ...city,
                        country: countryKey,
                        province: provinceKey,
                        region: country.region
                    });
                });
            });
        });

        return index;
    }

    /**
     * 获取指定热门城市
     */
    getPopularCities() {
        const specifiedPopularCities = [
            '北京', '上海', '广州', '深圳', '厦门', '东京', '新加坡', '首尔', '纽约'
        ];
        
        const popularCities = [];
        
        Object.entries(this.cityData).forEach(([countryKey, country]) => {
            Object.entries(country.provinces).forEach(([provinceKey, province]) => {
                province.cities.forEach(city => {
                    if (specifiedPopularCities.includes(city.name)) {
                        popularCities.push({
                            ...city,
                            country: countryKey,
                            province: provinceKey,
                            region: country.region
                        });
                    }
                });
            });
        });

        return popularCities;
    }

    /**
     * 搜索城市 - 支持按国家、省份、城市名称搜索
     */
    searchCities(query) {
        if (!query || query.length < 1) {
            return this.getPopularCities().slice(0, 20);
        }

        const lowerQuery = query.toLowerCase();
        const results = new Set();
        
        // 按城市名称搜索
        this.searchIndex.cities.forEach((cities, cityKey) => {
            if (cityKey.includes(lowerQuery)) {
                cities.forEach(city => results.add(JSON.stringify(city)));
            }
        });

        // 按省份名称搜索
        this.searchIndex.provinces.forEach((province, provinceKey) => {
            if (provinceKey.includes(lowerQuery)) {
                province.cities.forEach(city => {
                    results.add(JSON.stringify({
                        ...city,
                        country: this.getCountryByProvince(provinceKey),
                        province: provinceKey,
                        region: this.getRegionByProvince(provinceKey)
                    }));
                });
            }
        });

        // 按国家名称搜索
        this.searchIndex.countries.forEach((country, countryKey) => {
            if (countryKey.includes(lowerQuery)) {
                Object.entries(country.provinces).forEach(([provinceKey, province]) => {
                    province.cities.forEach(city => {
                        results.add(JSON.stringify({
                            ...city,
                            country: countryKey,
                            province: provinceKey,
                            region: country.region
                        }));
                    });
                });
            }
        });

        // 转换回对象数组并限制数量
        return Array.from(results)
            .map(cityStr => JSON.parse(cityStr))
            .slice(0, 20);
    }

    /**
     * 根据省份获取国家名称
     */
    getCountryByProvince(provinceKey) {
        for (const [countryKey, country] of Object.entries(this.cityData)) {
            if (Object.keys(country.provinces).some(key => key.toLowerCase() === provinceKey)) {
                return countryKey;
            }
        }
        return '';
    }

    /**
     * 根据省份获取地区名称
     */
    getRegionByProvince(provinceKey) {
        for (const [countryKey, country] of Object.entries(this.cityData)) {
            if (Object.keys(country.provinces).some(key => key.toLowerCase() === provinceKey)) {
                return country.region;
            }
        }
        return '';
    }

    /**
     * 根据坐标查找最近的城市
     */
    findNearestCity(lat, lon) {
        let nearestCity = null;
        let minDistance = Infinity;

        Object.entries(this.cityData).forEach(([countryKey, country]) => {
            Object.entries(country.provinces).forEach(([provinceKey, province]) => {
                province.cities.forEach(city => {
                    const distance = Math.sqrt(
                        Math.pow(city.lat - lat, 2) + Math.pow(city.lon - lon, 2)
                    );
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestCity = {
                            ...city,
                            country: countryKey,
                            province: provinceKey,
                            region: country.region
                        };
                    }
                });
            });
        });

        return nearestCity;
    }

    /**
     * 获取所有国家列表
     */
    getAllCountries() {
        return Object.entries(this.cityData).map(([countryKey, country]) => ({
            name: countryKey,
            region: country.region
        }));
    }

    /**
     * 根据国家获取省份列表
     */
    getProvincesByCountry(countryName) {
        const country = this.cityData[countryName];
        if (!country) return [];
        
        return Object.entries(country.provinces).map(([provinceKey, province]) => ({
            name: provinceKey,
            cityCount: province.cities.length
        }));
    }

    /**
     * 根据国家和省份获取城市列表
     */
    getCitiesByCountryAndProvince(countryName, provinceName) {
        const country = this.cityData[countryName];
        if (!country) return [];
        
        const province = country.provinces[provinceName];
        if (!province) return [];
        
        return province.cities.map(city => ({
            ...city,
            country: countryName,
            province: provinceName,
            region: country.region
        }));
    }
}

/**
 * 天气API管理器
 * 负责从不同天气API获取数据
 */
class WeatherAPIManager {
    /**
     * 并行获取天气数据
     * 同时向wttr.in和Open-Meteo API发送请求，优先展示先返回的结果
     */
    static async fetchWeatherDataParallel(lat, lon) {
        const wttrPromise = this.fetchFromWttr(lat, lon);
        const openMeteoPromise = this.fetchFromOpenMeteo(lat, lon);

        // 使用Promise.race获取最先返回的结果
        return await Promise.race([wttrPromise, openMeteoPromise]);
    }

    /**
     * 从wttr.in API获取天气数据
     */
    static async fetchFromWttr(lat, lon) {
        const response = await fetch(
            `https://wttr.in/${lat},${lon}?format=j1&lang=zh`
        );

        if (!response.ok) {
            throw new Error('wttr.in API请求失败');
        }

        const data = await response.json();
        return {
            source: 'wttr',
            data: data
        };
    }

    /**
     * 从Open-Meteo API获取天气数据
     */
    static async fetchFromOpenMeteo(lat, lon) {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
        );

        if (!response.ok) {
            throw new Error('Open-Meteo API请求失败');
        }

        const data = await response.json();
        return {
            source: 'openmeteo',
            data: data
        };
    }
}

/**
 * 天气数据处理工具
 * 负责处理不同API返回的天气数据格式
 */
class WeatherDataProcessor {
    /**
     * 获取天气描述（Open-Meteo天气代码转换）
     */
    static getWeatherDescription(code) {
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
    static getWeatherIconCode(code) {
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
    static getWeatherEmoji(iconCode) {
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
     * 处理天气数据并提取显示信息
     */
    static processWeatherData(weatherData) {
        if (!weatherData) return null;

        let temp, description, iconCode;

        // 根据数据源处理不同的数据格式
        if (weatherData.source === 'wttr') {
            // 处理wttr.in API数据格式
            const wttrData = weatherData.data;
            if (wttrData.current_condition) {
                temp = Math.round(wttrData.current_condition.temp_C);
                description = wttrData.current_condition.lang_zh[0].value;
                iconCode = wttrData.current_condition.weatherCode;
            }
        } else if (weatherData.source === 'openmeteo') {
            // 处理Open-Meteo API数据格式
            const openMeteoData = weatherData.data;
            if (openMeteoData.current_weather) {
                temp = Math.round(openMeteoData.current_weather.temperature);
                description = this.getWeatherDescription(openMeteoData.current_weather.weathercode);
                iconCode = this.getWeatherIconCode(openMeteoData.current_weather.weathercode);
            }
        }

        return {
            temp: temp,
            description: description,
            iconCode: iconCode,
            emoji: this.getWeatherEmoji(iconCode)
        };
    }
}

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
        this.cityDataManager = new CityDataManager(); // 使用统一的城市数据管理器
        
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
        const popularCities = this.cityDataManager.getPopularCities();
        this.displayCities(popularCities);
    }

    /**
     * 搜索城市
     */
    async searchCities(query) {
        const results = this.cityDataManager.searchCities(query);
        this.displayCities(results);
    }


    /**
     * 显示城市列表 - 优化层级显示
     */
    displayCities(cities) {
        if (!this.elements.cityList) return;

        this.elements.cityList.innerHTML = '';

        cities.forEach(city => {
            const cityItem = document.createElement('div');
            cityItem.className = 'city-item';
            
            // 构建层级显示信息：国家 > 省份 > 城市
            let locationInfo = '';
            if (city.country && city.province) {
                // 如果省份和国家不同，显示完整层级
                if (city.province !== city.country) {
                locationInfo = `${city.province}, ${city.country}`;
                } else {
                    // 如果省份就是国家（如直辖市），只显示国家
                    locationInfo = city.country;
                }
            } else if (city.country) {
                locationInfo = city.country;
            }
            
            // 添加地区信息（如果有）
            if (city.region && city.region !== city.country) {
                locationInfo += ` (${city.region})`;
            }
            
            cityItem.innerHTML = `
                <div class="city-info">
                    <div class="city-name">${city.name}</div>
                    <div class="city-location">${locationInfo}</div>
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
            // 使用WeatherAPIManager获取天气数据
            const weatherData = await WeatherAPIManager.fetchWeatherDataParallel(
                this.currentCity.lat, 
                this.currentCity.lon
            );
            this.weatherData = weatherData;
            this.updateWeatherDisplay();
        } catch (error) {
            console.warn('所有天气API都获取失败:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 更新天气显示
     */
    updateWeatherDisplay() {
        if (!this.weatherData) return;

        // 使用WeatherDataProcessor处理天气数据
        const processedData = WeatherDataProcessor.processWeatherData(this.weatherData);
        if (!processedData) return;

        this.elements.temp.textContent = `${processedData.temp}°C`;
        this.elements.icon.textContent = processedData.emoji;
        
        // 添加天气描述到城市名称
        if (this.currentCity) {
            this.elements.city.textContent = `${this.currentCity.name} · ${processedData.description}`;
        }
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
    window.CityDataManager = CityDataManager;
    window.WeatherAPIManager = WeatherAPIManager;
    window.WeatherDataProcessor = WeatherDataProcessor;
}
