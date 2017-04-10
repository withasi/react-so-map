/**
 * Created by siwangli on 2016/1/12.
 */
/**
 * 城市信息，来自于原来city.js。暂时处理方法
 */
import str from './citystring';
const CityInfo = {
    _data: str,
    citiesWithNameAsKey: {},
    citiesWithCityCodeAsKey: {},
    citiesWithCityCodeAsId: {},
    cityList: [],
    init: function () {
        for (var a = this._data.split(";"), b = 0; b < a.length;) {
            var c = {
                name: a[b++],
                citycode: a[b++],
                x: a[b++],
                y: a[b++],
                code: a[b++],
                spell: a[b++],
                city_id: a[b++]
            };
            this.cityList.push(c.name + " (" + c.spell + ")");
            this.citiesWithNameAsKey[c.name] = c;
            this.citiesWithCityCodeAsKey[c.citycode] = c;
            this.citiesWithCityCodeAsId[c.city_id] = c
        }
        return this;
    },
    list: function () {
        return this.cityList
    },
    /**
     * 获取城市的电话区号
     * @param name
     * @returns {boolean}
     */
    toCityCode: function (name) {
        var code = false;

        if (name) {
            code = this.citiesWithNameAsKey[name] ? this.citiesWithNameAsKey[name].citycode : (this.citiesWithNameAsKey[name.replace(/[州市县区]$/, '')].citycode ? this.citiesWithNameAsKey[name.replace(/[州市县区]$/, '')] : false);
            if (Object(code) === code) {
                code = code.citycode;
            }
        }

        return code;
    },
    toCityId: function (a) {
        return a && this.citiesWithNameAsKey[a] ? this.citiesWithNameAsKey[a].city_id : !1
    },
    toName: function (code) {
        return code && this.citiesWithCityCodeAsKey[code] ? this.citiesWithCityCodeAsKey[code].name : !1
    },
    getCity: function (a) {
        var city = false;

        if (!a) {
            return false;
        }

        // 前端归一化城市参数
        var map = {
            // '香港特别行政区': '香港',
            // '澳门特别行政区': '澳门'
        };
        if (map[a]) {
            a = map[a];
        }

        if (this.citiesWithCityCodeAsKey[a]) {
            city = this.citiesWithCityCodeAsKey[a];
        } else {
            city = this.citiesWithNameAsKey[a];
            if (!city) {
                a = (a + '').replace(/城区$/, '');
                a = (a + '').replace(/市$/, '');
                city = this.citiesWithNameAsKey[a];
            }
            if (city) {
                city.label = this.formatName(a);
            }
        }

        return city;
    },
    getCityById: function (a) {
        return a ? this.citiesWithCityCodeAsId[a] || this.citiesWithCityCodeAsId[a] : !1
    },
    getCityIdByAdcode: function (adcode) {

//			  if(!adcode)return;

        if (adcode.charAt(2) + adcode.charAt(3) == '90') {
            return adcode;
        }
        var rpids = ',11,31,12,50,81,82,71,'; //直辖市adcode前两位数字
        var city_id_slice_length = 2;
        if (rpids.indexOf(',' + adcode.slice(0, 2) + ',') >= 0) {
            city_id_slice_length = 3;
        }
        return adcode.slice(0, -city_id_slice_length) + '000'.slice(0, city_id_slice_length);
    },
    cityId2Code: function (cityid) {
        var city = this.getCityById(cityid);
        return city ? city.citycode : 'total';
    },
    have_subway: function () {
        var code = So.State.citycode();

        if (code) {
            return window.subway_cities[code] == undefined ? false : true;
        }

        return false;
    },
    getPreferZoom: function (a) {
        var b = 11;
        // 全国zoom 4
        "\u5168\u56fd" == a && (b = 4);
        return b
    },
    formatName: function (name) {
        if (!name) {
            return '';
        }
        // hack 如果以州市县区结尾，且长度大于2，则直接返回名称
        if (name.length > 2 && /[州市县区]$/.test(name) == true) {
            return name;
        }

        var except = [
            '中沙群岛',
            '南沙群岛',
            '西沙群岛',
            '东沙群岛',
            '全国'
        ];

        if (except.indexOf(name) != -1) {
            return name;
        }
        return name + '市';
    }
}
window.subway_cities = {
    '010': '北京',
    '021': '上海',
    '020': '广州',
    '0755': '深圳',
    '025': '南京',
    '028': '成都',
    '023': '重庆',
    '022': '天津',
    '024': '沈阳',
    '0571': '杭州',
    '0512': '苏州',
    '0411': '大连',
    '0431': '长春',
    '029': '西安',
    '0371': '郑州',
    '0871': '昆明',
    '0451': '哈尔滨',
    '027': '武汉',
    '0757': '佛山',
    '0731': '长沙',
    '0510': '无锡',
    '0574': '宁波',
    '0791': '南昌',
    '0771': '南宁'
};
module.exports = CityInfo.init();