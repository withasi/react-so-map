/*
* @Author: leozhao
* @Date:   2017-03-25 18:42:19
* @Last Modified by:   leozhao
* @Last Modified time: 2017-03-25 18:42:40
*/

'use strict';
/**
 * Created by siwangli on 2016/4/19.
 */
const SERVICE_HOST = '//ditu.so.com/';
const REST_HOST = So.serviceUrl.restapi || '//restapi.map.so.com';

/**
 * base service api
 */
export const BASE_SERVICE_API = REST_HOST + '/newapi';
//export const BASE_SERVICE_API = "//restapi.liudaiming.merger_test.m.map.test.so.com/api/simple";

/**
 * 地图默认热点
 * @type {*}
 */
export const BASE_SPOT_API = So.serviceUrl.hotspot_url || '//map{n}.ssl.qhimg.com/sotile/hotspot.php';

/**
 * 分享时，生成微缩图
 * @type {*}
 */
export const SHARE_API = So.serviceUrl.static_map_url || '//map0.ssl.qhimg.com/static';

/**
 * 路线和道路，以及公交站点详情
 * @type {*}
 */
export const ROAD_DETAIL_API = So.serviceUrl.road_bus_detail_url || "//restapi.map.so.com/api/simple";


/**
 * query service api
 */
export const SUGGEST_API = BASE_SERVICE_API;//suggest的请求地址
export const DIRECTION_API = So.serviceUrl.busroute_url || '//restapi.map.so.com/api/simple';//导航的请求地址


/**
 * city search
 */
export const CITY_INFO_API = (So.serviceUrl.roaming_city_url || '//restapi.map.so.com/api/simple') + '/?sid=7002&expected_level=city';//获取城市信息
export const GEOCODE_API = So.serviceUrl.geocoder_url || '//restapi.map.so.com/api/simple';//地址编码
export const REGEOCODE_API = GEOCODE_API + '/?sid=7001&number=10&addr_desc=true&&show_addr=true&formatted=true';//反地址编码


/**
 * app service
 */
export const APP_API = SERVICE_HOST + 'app/';

/**
 * poi 麻点图层 service api
 */
export const POI_TILELAYER_API = APP_API + 'bgpng.php';

/**
 * 麻点 service api
 */
export const SPOT_SERVICE_API = APP_API + 'pit';


/**
 * weather service
 */
export const WEATHER_API = 'http://cdn.weather.hao.360.cn/sed_api_weather_info.php?app=soComMap';


/**
 * district service
 */
export const DISTRICT_API = So.serviceUrl.area_figure_url || '//map0.ssl.qhimg.com/figure/';

/**
 * shenghuo api
 */
export const SHENGHUO_API = SERVICE_HOST + 'shenghuo/detail';

/**
 * shenbian api
 */
export const SHENBIAN_API = So.serviceUrl.shenbian || '//shenbian.so.com';

/**
 * 小水滴 api
 */
export const DROPLET_API = '//map.so.com/app/shuidi/tile';

/**
 * 实时交通路况的更新时间 api
 */
export const REAL_TRAFFIC_TIME_API = So.serviceUrl.realtime_traffic_url || "//ditu.so.com/app/traffic.php";


/**
 * 短讯预览 api
 */
export const MSG_REVIEW_API = So.serviceUrl.sms_preview_url || "/app/sms/preview";

/**
 * 底图热点版本，此值在原来版本中是直接写入到index.php中
 * @type {number}
 */
So.hotspotVersion = So.hotspotVersion || 11;
