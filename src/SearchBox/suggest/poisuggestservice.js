/**
 * Created by siwangli on 2016/1/14.
 */

import CurrentCityUpdater from '../../city/currentcityupdater';
import City from "../../city/cityinfo";
import {SUGGEST_API} from '../../interface/addressbook';

export default class PoiSuggestService {
    static suggestSearch(keyword, callback){
        var city = CurrentCityUpdater.city();
        var city_name = city.name || city.label;
        var city_id = City.toCityId(city_name);
        $.ajax({
            url: SUGGEST_API,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: {
                keyword: keyword,
                city: city.citycode,
                cityid: city_id,
                sid: 1014,
                cityname: city_name
            },
            cache: false,
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
     * suggest之后进一步进行查询poi时的接口
     * @param keyword
     * @param batch
     * @param number
     * @param callback
     */
    static suggestSearch2(keyword, callback, batch, number){
        var city = CurrentCityUpdater.city();
        var city_name = city.name || city.label;
        var city_id = City.toCityId(city_name);
        $.ajax({
            url: SUGGEST_API,
            async: true,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: {
                keyword: keyword,
                city: city.citycode,
                cityid: city_id,
                cityname: city_name,
                sid: 1000,
                citysuggestion:true,
                batch:batch||1,
                mobile:1,
                number:number||10,
                qii:true,//?
                routePoint:1,//?
                routeType:1,//?
                routeSelectPOI:0//?


            },
            cache: false,
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

}

function invokeCallback(a, d) {
    a.poi = a.list || a.poi || [];
    a.totalcount = a.total || a.totalcount || a.poi.length;
    //a = _.omit(a, "list", "total", "count");
    a.list = null;
    a.total = null;
    a.count = null;
    d(a);
}
