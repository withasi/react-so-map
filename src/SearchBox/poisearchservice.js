/**
 * Created by siwangli on 2016/1/14.
 */
import CurrentCityUpdater from '../city/currentcityupdater';
import City from "../city/cityinfo";
import MapUI from "../MapUI";
import {BASE_SERVICE_API, DISTRICT_API, ROAD_DETAIL_API} from '../interface/addressbook';

export default class PoiSearchService {
    /**
     * poi 查找 || 区域查找，sid为1005，regionType为rectangle
     * @param poi
     * @param callback
     */
    static poiSearch(poi, callback) {
        let {mp, url, map, batch, keyword, number, region, adcode, city, src, name, qii, map_cbc, region_id, regionType, sid, sort, price, order, business, ext} = poi;

        let cityname = "", city_id = "", citycode = "";
        if (adcode && name) {
            cityname = name;
            city_id = adcode;
            citycode = city;
        } else {
            let cityInfo = CurrentCityUpdater.city();
            cityname = cityInfo.name || cityInfo.label;
            city_id = City.toCityId(cityname);
            citycode = cityInfo.citycode;
        }

        if (!region) {
            let bounds = MapUI.getCurrentShowBounds(map);
            let ne = bounds.getNorthEast(),
                sw = bounds.getSouthWest();
            region = sw.getLng() + "," + sw.getLat() + ";" + ne.getLng() + "," + ne.getLat();
        }

        let data = {
            keyword: keyword,
            cityname,
            city: citycode,
            cityid: city_id,
            batch: batch || 1,
            number: number || 10,
            citysuggestion: true,
            qii: qii !== false,
            region_id: region_id||"" ,
            map_cbc: map_cbc || "",
            scheme: "https",
            ext:ext||"",
            regionType: regionType || "",//区域搜索的时候此值为rectangle
            sid: sid || 1000,
            mobile: 1,
            src,
            fields:"movies_all",
            region: region,
            mp
        };

        if (sort) data.sort = sort;
        if (price) data.price = price;
        if (order) data.order = order;
        if (business && business.business_switch) {
            data.business_switch = 1;
            data.business_area = business.business_area;
            data.business_name = business.business_name;
        }


        return $.ajax({
            url: url||BASE_SERVICE_API,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data,
            success: function (a) {
                a.batch = parseInt(batch) || 1;
                a.number = number || 10;
                a.keyword = keyword;
                invokeCallback(a, callback)
            },
            error: function () {
                invokeCallback({
                    status: "E1"
                }, callback)
            }
        });

    }

    /*static poiSearchPromise(poi) {
        return new Promise(function(resolve, reject){
            PoiSearchService.poiSearch(poi, function(dt){
                resolve(dt);
            })
        });
    }*/

    /**
     * 根据pguid进行poi search
     * @param opts
     * @param callback
     */
    static poiSearchByPguid(opts, callback) {
        let city = CurrentCityUpdater.city();
        let city_name = city.name || city.label;
        let city_id = City.toCityId(city_name);
        $.ajax({
            url: BASE_SERVICE_API,
            async: true,
            type: "GET",
            dataType: "jsonp",
            data: {
                keyword: opts.pguid,
                mobile: 1,
                sid: 1007,
                cityid: city_id,
                fields: "movies_all"
            },
            cache: true,
            success: function (a) {
                invokeCallback(a, callback)
            },
            error: function () {
                invokeCallback({
                    status: "E1"
                }, callback)
            }
        });
    }

    /**
     * 周边搜索
     * @param poi
     * @param callback
     */
    static circumSearch(poi, callback) {
        let {batch, keyword, number, center, range, sort, price, order, business, map_cbc} = poi;
        var city = CurrentCityUpdater.city();
        var city_name = city.name || city.label;
        var city_id = City.toCityId(city_name);

        let data = {
            keyword: keyword,
            cityname: city_name,
            city: city.citycode,
            cityid: city_id,
            batch: batch || 1,
            number: number || 10,
            sid: 1002,
            mobile: 1,
            map_cbc: map_cbc || "",
            scheme: "https",
            cenX: center.x,
            cenY: center.y,
            fields:"movies_all",
            range: range || 1500
        };

        if (sort) data.sort = sort;
        if (price) data.price = price;
        if (order) data.order = order;
        if (business && business.business_switch) {
            data.business_switch = 1;
            data.business_area = business.business_area;
            data.business_name = business.business_name;
        }

        $.ajax({
            url: BASE_SERVICE_API,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data,
            success: function (a) {
                a.batch = parseInt(batch) || 1;
                a.number = number || 10;
                a.keyword = keyword;
                invokeCallback(a, callback)
            },
            error: function () {
                invokeCallback({
                    status: "E1"
                }, callback)
            }
        });
    }

    /**
     * 获取道路信息
     * @param data
     * @param callback
     */
    static getRoadsInfo(data, callback) {
        data.mobile = 1;
        data.sid = 39001;
        $.ajax({
            url: ROAD_DETAIL_API,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data,
            success: function (a) {
                invokeCallback(a, callback)
            },
            error: function () {
                invokeCallback({
                    status: "E1"
                }, callback)
            }
        });
    }

    /**
     * 查询行政区划
     * @param poi
     * @param callback
     */
    static distinctSearch(data, callback) {
        data.mobile = 1;
        $.ajax({
            url: DISTRICT_API,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "cbk",
            data,
            success: function (a) {
                invokeCallback(a, callback)
            },
            error: function () {
                invokeCallback({
                    status: "E1"
                }, callback)
            }
        });
    }

    /**
     * 查询行政区划
     * @param poi
     * @param callback
     */
    static citySearch(data, callback) {
        $.ajax({
            url: "/app/city",
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "cb",
            data,
            success: function (a) {
                invokeCallback(a, callback)
            },
            error: function () {
                invokeCallback({
                    status: "E1"
                }, callback)
            }
        });
    }

    /**
     * 获取poi的详细信息
     * @param id
     * @param callback
     * @param opts
     */
    static poiDetail(id, callback, opts) {
        let data = Object.assign({
            pguid: id,
            mobile: 1,
            sid: 1006,
            fields: "movies_all"
        }, opts);
        $.ajax({
            url: BASE_SERVICE_API,
            async: true,
            type: "GET",
            dataType: "jsonp",
            data,
            cache: true,
            success: function (a) {
                invokeCallback(a, callback)
            },
            error: function () {
                invokeCallback({
                    status: "E1"
                }, callback)
            }
        });
    }

    /**
     * 获取bus的详细信息
     * @param id
     * @param callback
     * @param opts
     */
    static busDetail(data, callback) {
        Object.assign(data, {
            mobile: 1,
            sid: 38100
        });
        $.ajax({
            url: ROAD_DETAIL_API,
            async: true,
            type: "GET",
            dataType: "jsonp",
            data,
            cache: true,
            success: function (a) {
                invokeCallback(a, callback)
            },
            error: function () {
                invokeCallback({
                    status: "E1"
                }, callback)
            }
        });
    }

    //之前的超时处理
    static timeout = 30000;
    static timer = null;

    static ajax(a, d, timeout) {
        var local = BASE_SERVICE_API;
        //将关键字添加到cookie，供浏览器检索导航条使用
        if (a.sid != 1004) {
            //So.Cookie.set('keyforsearchbar',a.keyword,true);
        }

        var suc = 0;
        var _city_name = a.cityname || (a.city && City.toName(a.city));
        !a.cityid && (a.cityid = (_city_name && City.toCityId(_city_name)) || CurrentCityUpdater.city().city_id);
        $.ajax({
            url: local,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: a,
            cache: false,
            success: function (a) {
                if (suc === 2) {
                    return false;
                }
                suc = 1;
                invokeCallback(a, d)
            },
            error: function () {
                invokeCallback({
                    status: "E1"
                }, d)
            }
        });

        if (timeout) {
            var self = this;
            if (self.timer) {
                clearTimeout(self.timer);
            }

            self.timer = setTimeout(function () {
                if (suc === 1) {
                    return false;
                }

                suc = 2;

                // 执行超时代码
                self.ajax(a, d, timeout)
            }, this.timeout);
        }
    }
}

function invokeCallback(a, d) {
    a.poi = a.list || a.poi || [];
    a.isBusLine = a.busline ? true : false;
    a.totalcount = a.total || a.totalcount || a.poi.length;
    //let _data = {poi:a.poi,totalcount:a.totalcount,batch:a.batch, number:a.number,keyword:a.keyword};
    d(a);
}
