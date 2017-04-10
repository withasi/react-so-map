/**
 * Created by siwangli on 2016/1/11.
 */
let _api_index = 0;
let _cache = null;
let _lnglatToPoi_cache = {};
let _city = undefined;
let _defaultCity = {
    citycode: "010",
    name: "北京",
    label: "北京市"
}
import City from "./cityinfo";
import {CITY_INFO_API,REGEOCODE_API} from '../interface/addressbook';
let city_id ="";
_defaultCity = (city_id?City.getCityById(city_id):_defaultCity);
export default class CurrentCityUpdater {
    /**
     * 带参数就是设置当前城市状态，否则获取当前城市信息
     * 替代之前：So.StateView.city
     * @param cityInfo
     */
    static city(cityInfo, map){
        if (cityInfo) {
            if (_city && _city.citycode == cityInfo.citycode) {
                return cityInfo;
            }
            //只有当search 返回 的firstCity 与当前城市不同的情况下才更新，避免北京索搜公交显示张家口城市切换的bug
            if (_city && !(_city.name == cityInfo.name || _city.name == cityInfo.label)) {
                if(So['_pauseChangeCity']){
                    if(_city.name !== So['_pauseChangeCity'] && So['_pauseChangeCity'].indexOf(_city.name) === -1){
                        if(map){
                            this._lastRegeo = null;
                            map.cityChanged.dispatch(cityInfo, _city);
                        }
                        _city = cityInfo;
                    }
                    So['_pauseChangeCity'] = null;
                }else{
                    if(map){
                        this._lastRegeo = null;
                        map.cityChanged.dispatch(cityInfo, _city);
                    }
                    _city = cityInfo;
                }
            }
            if(!_city) _city = cityInfo;
        }

        _city = _city || _defaultCity;
        return _city
    }
    /**
     * 设置当前城市信息
     * @param cityInfo
     */
    static setCity(cityInfo){
        if (cityInfo && cityInfo.city_id) {
            _city = City.getCityById(cityInfo.city_id);
        }
    }

    /**
     * 更新城市，在地图放缩和地图有移动时触发。
     * @param map
     */
    static updateCity(map) {
        var center = map.getCenter(),
            zoom = map.getZoom();
        // 如果切换的中心距离小于10000米且zoom没有翻越8
        if (!this._lastRegeo || !(10000 > this._lastRegeo.center.distanceTo(center) && 0 < (this._lastRegeo.level - 8) * (zoom - 8))) {
            this._lastRegeo = {
                center: center,
                level: zoom
            };

            _api_index++;
            var self = this, api_index = _api_index, times = 0;

            var locationError = this.locationError.bind(this);
            var locationSuccess = this.locationSuccess.bind(this);
            var bounds = map.getBounds();
            if (bounds) {
                var sw = bounds.getSouthWest();
                var ne = bounds.getNorthEast();
                //var pt = map.getMapCanvasProjection().fromContainerPixelToLatLng(new so.maps.Point(434, 0));
                //var region = pt.getLng() + ';' + sw.getLat() + ';' + ne.getLng() + ';' + ne.getLat();
                var region = sw.getLng() + ';' + sw.getLat() + ';' + ne.getLng() + ';' + ne.getLat();

                this.getCityInfoByBound({region: region}, function (data) {
                    if (data && data.info === 'OK') {
                        locationSuccess(map, center, data.area.adcode+"", data.area.name);
                    } else {
                        locationError();
                    }
                })
            } else {
                this.regeocode(center, function (res) {
                    if (_api_index != api_index) {
                        return;
                    }

                    // 如果状态码不ok，重新发起请求
                    if (!(res.status == '1' && res.info == 'OK')) {
                        setTimeout(self.regeocode, times * 1000);
                        times++;
                        return false;
                    }

                    times = 0;

                    if (!res.regeocode) {
                        // 如果是未知位置，比上一个解析成功的中心点距离大于20km，才显示未知位置，该策略作为临时策略，修复“岱山县”等初始化中心点未知的问题，需要从接口层解决
                        self.locationError();
                    } else {
                        var cityInfo = res.regeocode.addressComponent;
                        var province = cityInfo.province;
                        var cityName = Object.prototype.toString.call(cityInfo.city) == "[object String]" && cityInfo.city;
                        var district = Object.prototype.toString.call(cityInfo.district) == "[object String]" && cityInfo.district;

                        //hack for 直辖市
                        var exceptCities = ['北京市', '上海市', '重庆市', '天津市'];
                        if (!cityName) {
                            if ($.inArray(province, exceptCities) != -1) {
                                cityName = province;
                            } else {
                                cityName = district || province;
                            }
                        }
                        self.locationSuccess(cityInfo.adcode + '', cityName);
                        // self.locationSuccess(map, center,cityInfo.adcode + '', cityName);
                    }
                });
            }
        }
    }

    /**
     * 根据区域获取当前城市信息
     * @param param
     * @param func
     */
    static getCityInfoByBound(param, func) {
        $.ajax({
            url: CITY_INFO_API,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: param,
            cache: true,
            success: function (data) {
                func(data);
            },
            error: function () {
                func({status: "E1"});
            }
        });
    }


    static regeocode(center, callback) {
        center.lng = center.lng || center.x;
        center.lat = center.lat || center.y;
        if (!center || !center.lng || !center.lat) return !1;
        $.ajax({
            url: REGEOCODE_API,
            async: !1,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: {
                x: center.lng,
                y: center.lat,
                radius: 1000,
                extensions: 'all'
            },
            success: callback,
            error: function () {
            }
        })
    }

    static _calcCache(a, b, c) {
        a = "cache_" + a + "_" + b;
        c && (_lnglatToPoi_cache[a] =
            JSON.stringify(c));
        return _lnglatToPoi_cache[a]
    }

    static lnglatToAddress(lnglat, fn) {
        var d = this._calcCache(lnglat.getLng(), lnglat.getLat());

        if (d) {
            fn(this.eval(d));
        } else {
            var self = this;
            this.regeocode(lnglat, function (res) {
                var geo = self.formatGeoRes(lnglat, res);
                self._calcCache(lnglat.getLng(), lnglat.getLat(), geo);
                fn(geo);
            });
        }
    }
    static eval(a) {
        if (Object.prototype.toString.call(a) == "[object String]") try {
            return eval("(" + a + ")")
        } catch (b) {
            return null
        }
        return a
    }

    /**
     * 格式化经纬度反解数据格式
     * @param {LNGLAT} lnglat 经纬度信息对象
     * @param {Data} geo 经纬度反解接口返回结果
     */
    static formatGeoRes(lnglat, res) {
        if ("1" == res.status && "OK" == res.info) {
            var adcode = '';
            var road = {},
                poi = {};
            var province = '';

            if (res.regeocode) {
                var tmp = res.regeocode;
                var addressComponent = tmp.addressComponent;

                if (tmp.pois && tmp.pois[0]) {
                    poi = tmp.pois[0];
                }

                if (addressComponent.streetNumber) {
                    road = addressComponent.streetNumber;
                }

                adcode = addressComponent.adcode + '';
                province = addressComponent.province;

            }

            var _geo = {};

            if (poi.distance) {
                poi.distance = parseFloat(poi.distance);
                _geo = poi;
            }

            if (road.distance && (road.distance = parseFloat(road.distance), !$.isNumeric(_geo.distance) || road.distance < _geo.distance)) {
                _geo = road;
                _geo.name = road.street;
            }
            _geo.name = road.street;
            var geo = {};
            // 统一的cityid规则
            var cityid = City.getCityIdByAdcode(adcode);
            geo.citycode = City.cityId2Code(cityid);
            geo.cityid = cityid;
            geo.name = _geo.name || "未知道路";
            geo.address = res.regeocode.formatted_address;
            geo.x = lnglat.getLng();
            geo.y = lnglat.getLat();

            return geo;
        }

        return false;
    }

    static locationError() {
        if (_cache && _cache.distanceTo(center) > 20000) {
            _city = {
                citycode: "",
                city_id: '',
                name: "",
                spell: "",
                label: "全国"
            };
        }
    }
    static locationSuccess(map, center, adcode, cityName) {
        var cityid = City.getCityIdByAdcode(adcode);
        var cityCode = City.cityId2Code(cityid);

        _cache = center;
        if (!cityCode || 8 > map.getZoom()) {
            cityCode = "total", cityName = "";
        }

        var cityName1 = City.toName(cityCode);
        var _city_1 = City.citiesWithCityCodeAsKey[cityCode];
        this.city({
            citycode: cityCode,
            name: cityName1,
            spell: _city_1 && _city_1.spell || '',
            city_id: _city_1 && _city_1.city_id || '',
            label: cityName || cityName1
        },map);
    }
}






