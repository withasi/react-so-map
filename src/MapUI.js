/**
 * Created by siwangli on 2016/1/25.
 */
import React from 'react';
import ReactDom from 'react-dom';
import CurrentCityUpdater from './city/currentcityupdater';
import City from './city/cityinfo';
import {GEOCODE_API} from './interface/addressbook'

const _tempPolyline = new so.maps.Polyline();
const _startEndSize = new so.maps.Size(25, 40);
let _menuControl;//地图右键菜单
let _stepInfoWindow;//上一步，下一步的infowindow
let _buslinePolyline = null;//公交线路折线
let _stationMarkers = [];//公交线路站点marker与_buslinePolyline共同组成公交线路
let _startMarker = null;//路线规划起点marker
let _endMarker = null;//路线规划终点marker

let _videoInfoWindow;



//小提示框
let _smallTiplabel;
let _tipPos;
let _tipName;
let _tipType;

//处理拖动
let user = null;
let label = null;
let p = null;//原始点
let mapUseState = 0;

export default class MapUI {
    static _markers = [];//marker的容器

    /****************************** 生产overlay相关 start ******************************/
    /**
     * 生产普通的marker
     * @param map
     * @param conf
     * @returns {null}
     */
    static getMarker(map, conf, fns) {
        conf = Object.assign({
            map: map,
            draggable: false,
            visible: true,
            flat: false,
            shadow: null
        }, conf);

        var marker = conf.id ? map.getOverlays(conf.id) : null;
        if (marker) {
            marker.clear();
            marker.setOptions(conf);
        } else {
            marker = new so.maps.Marker(conf);
        }

        this._markers[marker.id] = marker;
        /*** 重写on 方法，记录业务上的绑定事件, 提供clear方法，清空所有自定义绑定事件 ***/
        var _on = marker.on;
        marker._event = [];
        marker.on = function (eventName, handler, useCapture) {
            this._event.push([eventName, handler]);
            _on.call(this, eventName, handler, useCapture);
        };
        marker.clear = function () {
            var self = this;
            this._event.map(function (ev) {
                self.off(ev[0], ev[1]);
            })
        };
        /*** end ***/

        if (typeof fns == "object") {
            for (var eventName in fns) {
                let fn = fns[eventName];
                typeof eventName == "string" && $.isFunction(fn) && marker.on(eventName, fn);
            }
        }

        return marker;
    }

    /**
     * 生产poi的marker
     * @param map
     * @param i
     * @returns {so.maps.Label}
     */
    static getPoiMarker(map, i) {
        let id = "poi_marker_" + i;
        let marker = id ? map.getOverlays(id) : null;
        if (marker) {
            //marker.clear();
        } else {
            let index = i + 1;
            let k = 30 - i;
            //let imgUrlNormal = require('./img/poi/marker-0-'+index+'.png');
            //let imgUrlHover = require('./img/poi/marker-1-'+index+'.png');
            //let normalContent = '<div class="poi-on-map"><img src="'+ imgUrlNormal +'" width="20px" height="31px"/></div>';
            //let hoverContent = '<div class="poi-on-map"><img src="'+ imgUrlHover +'" width="20px" height="31px"/></div>';
            marker = new so.maps.Label({
                map: map,
                content: '<div class="poi-on-map poi-on-map-normal">' + index + '</div>',
                //content: normalContent,
                style: {
                    marginTop: "-31px",
                    width: "20px",
                    height: "31px",
                    marginLeft: "-10px"
                },
                zIndex: k
            });
            marker._mouseout_open = true;//用于打开详情时，禁止mouseout操作
            marker.on('mouseover', function () {
                So._curMarker = marker;//解决mouseout有时候不触发的问题
                marker.setContent('<div class="poi-on-map poi-on-map-hover">' + index + '</div>');
                //marker.setContent(hoverContent);
                this.setZIndex(k+20);
                $(marker._listItem).removeClass("poi-list-item").addClass("poi-list-item-hover");
            });
            marker.on('mouseout', function () {
                So._curMarker = null;
                if (marker._mouseout_open) {
                    marker.setContent('<div class="poi-on-map poi-on-map-normal">' + index + '</div>');
                    //marker.setContent(normalContent);
                    $(marker._listItem).removeClass("poi-list-item-hover").addClass("poi-list-item");
                    this.setZIndex(k);
                }
            });
        }
        return marker;
    }

    /**
     * 生产底部麻点的marker
     * @param map
     * @param i
     * @returns {so.maps.Label}
     */
    static getSpotMarker(map, i) {
        let id = "spot_marker_" + i;
        let marker = id ? map.getOverlays(id) : null;
        if (marker) {
            //marker.clear();
        } else {
            marker = new so.maps.Label({
                map: map,
                content: '<div class="spot-map"></div>',
                style: {
                    marginTop: "-4.5px",
                    width: "9px",
                    height: "9px",
                    marginLeft: "-4.5px"
                },//设置style，否则默认会有个边框
                zIndex: 10
            });
            marker._spotFlag = true;
        }
        return marker;
    }

    static getPIDMarker(map, poi){
        let marker = MapUI.getMarker(map, {
            id: "_favor_poi",
            icon: _Favorimg,
            position: new so.maps.LatLng(poi.y, poi.x),
            zIndex: 10002
        }, {
            "click": () => {
                map.showSpotPoiDetail(poi, marker, -84);
            }
        });
        return marker;
    }

    /**
     * 小型tip提示框，主要用于聚合的提示，如入出口，停车场等
     */
    static clearSmallTipLabel() {
        _smallTiplabel && _smallTiplabel.setMap(null);
    }

    static showSmallTipLabel(map, name, pos, marginTop) {
        //****1)创建label
        _tipPos = pos;
        _tipName = name;
        let flag = true;
        if (!_smallTiplabel) {
            flag = false;
            _smallTiplabel = new so.maps.Label({
                id: "__spotdetail",
                zIndex: 10000
            });
            _smallTiplabel.on("domready", () => {
                this.setPoiInnerViewBesideLeftCard(map, {x: pos.getLng(), y: pos.getLat()});
            });

            $("#smalllabel_go").live("click", () => {
                map.actions.switchCardType(map, "direction", "none", {
                    endPoi: {
                        name: _tipName,
                        x: _tipPos.getLng(),
                        y: _tipPos.getLat()
                    }
                });
            })
        }

        //****2)构建内容
        let m = document.createElement("div");
        let content = '<div class="small-label-tips">' +
            '<div class="content">' +
            '<span class="label-name">' + name + '</span>' +
            '<span class="label-split">|</span>' +
            '<span class="label-go" title="到这去" id="smalllabel_go"></span>' +
            '</div>' +
            '<div class="label-arrow"></div>' +
            '</div>';
        m.innerHTML = content;

        //****3)计算偏移量
        //由于label只能通过innerhtml填入，因此没法计算宽度。以下求宽度
        let $m = $(m);
        $m.css({"visibility": "#hidden", "position": "absolute"});
        document.body.appendChild(m);
        let marginLeft = $(m).width() / -2;
        $m.remove();


        _smallTiplabel.setOptions({
            map,
            style: {
                border: "none",
                padding: 10,
                marginTop: marginTop || "-62px",
                height: "31px",
                marginLeft: marginLeft + "px"
            },
            content,
            position: pos
        });

        flag && this.setPoiInnerViewBesideLeftCard(map, {x: pos.getLng(), y: pos.getLat()});
    }

    /**
     * poi提示框
     * @param map
     * @param name
     * @param pos
     * @param marginTop
     */
    static showSmallPoiTipLabel(map, name, pos, marginTop, centerFlag) {

        //****1)创建label
        _tipPos = pos;
        _tipName = name;
        let flag = true;
        if (!_smallTiplabel) {
            flag = false;
            _smallTiplabel = new so.maps.Label({
                id: "__spotdetail",
                zIndex: 10000
            });
            _smallTiplabel.on("domready", () => {
                !centerFlag && this.setPoiInnerViewBesideLeftCard(map, {x: pos.getLng(), y: pos.getLat()});
            });

            $("#smalllabel_go").live("click", () => {
                map.actions.switchCardType(map, "direction", "none", {
                    endPoi: {
                        name: _tipName,
                        x: _tipPos.getLng(),
                        y: _tipPos.getLat()
                    }
                });
            })
        }

        //****2)构建内容
        let m = document.createElement("div");
        let content = '<div class="small-label-tips">' +
            '<div class="content">' +
            '<span class="label-name" style="margin-right:0">' + name + '</span>' +
            '</div>' +
            '<div class="label-arrow"></div>' +
            '</div>';
        m.innerHTML = content;

        //****3)计算偏移量
        //由于label只能通过innerhtml填入，因此没法计算宽度。以下求宽度
        let $m = $(m);
        $m.css({"visibility": "#hidden", "position": "absolute"});
        document.body.appendChild(m);
        let marginLeft = $(m).width() / -2;
        $m.remove();

        _smallTiplabel.setOptions({
            map,
            style: {
                border: "none",
                padding: 10,
                marginTop: marginTop || "-63px",
                height: "31px",
                marginLeft: marginLeft + "px"
            },
            content,
            position: pos
        });

        !centerFlag && flag && this.setPoiInnerViewBesideLeftCard(map, {x: pos.getLng(), y: pos.getLat()});
    }

    /**
     * 起点、终点提示框
     * @param map
     * @param type 起点还是终点
     * @param name
     * @param pos
     * @param marginTop
     */
    static showEndTipLabel(map, type, name, pos, marginTop) {
        //****1)创建label
        _tipPos = pos;
        _tipName = name;
        _tipType = type;
        let flag = true;
        if (!_smallTiplabel) {
            flag = false;
            _smallTiplabel = new so.maps.Label({
                id: "__spotdetail",
                zIndex: 10000
            });
            _smallTiplabel.on("domready", () => {
                this.setPoiInnerViewBesideLeftCard(map, {x: pos.getLng(), y: pos.getLat()});
            });
            $("#smalllabel_go").live("click", () => {
                let pt = {
                    name: _tipName,
                    x: _tipPos.getLng(),
                    y: _tipPos.getLat()
                };
                let startPoi, endPoi;
                if(_tipType == "start"){
                    startPoi = pt;
                }else{
                    endPoi = pt;
                }
                map.actions.switchCardType(map, "direction", "none", {
                    startPoi, endPoi
                });
            })
        }


        //****2)构建内容
        let m = document.createElement("div");
        let tip = type == "start" ? "设置起点": "设为终点"
        let content = '<div class="end-label-tips">' +
            '<div class="content">' +
            '<span class="label-name">' + name + '</span>' +
            '<div class="label-go" id="smalllabel_go">'+tip+'</div>' +
            '</div>' +
            '<div class="label-arrow"></div>' +
            '</div>';
        m.innerHTML = content;

        //****3)计算偏移量
        //由于label只能通过innerhtml填入，因此没法计算宽度。以下求宽度
        let $m = $(m);
        $m.css({"visibility": "#hidden", "position": "absolute"});
        document.body.appendChild(m);
        let marginLeft = $(m).width() / -2;
        $m.remove();


        _smallTiplabel.setOptions({
            map,
            style: {
                border: "none",
                padding: 10,
                marginTop: marginTop || "-62px",
                height: "31px",
                marginLeft: marginLeft + "px"
            },
            content,
            position: pos
        });

        flag && this.setPoiInnerViewBesideLeftCard(map, {x: pos.getLng(), y: pos.getLat()});
    }



    /**
     * 多城市的poi查询时，展现在全国地图上的marker
     * @param map
     * @param i
     * @returns {so.maps.Label}
     */
    static getMultiPoiMarker(map, conf, fns) {
        let id = "_multicity_marker_" + conf.i;
        conf = Object.assign({
            id,
            map,
            style: {width: '39px'},
            offset: new so.maps.Size(-9, -20),
            clickable: true,
            zIndex: 10001,
            cursor: 'default'
        }, conf);

        var marker = map.getOverlays(id);
        if (marker) {
            marker.clear();
            marker.setOptions(conf);
        } else {
            marker = new so.maps.Label(conf)
        }

        /*** 重写on 方法，记录业务上的绑定事件, 提供clear方法，清空所有自定义绑定事件 ***/
        var _on = marker.on;
        marker._event = [];
        marker.on = function (eventName, handler, useCapture) {
            this._event.push([eventName, handler]);
            _on.call(this, eventName, handler, useCapture);
        };
        marker.clear = function () {
            var self = this;
            this._event.map(function (ev) {
                self.off(ev[0], ev[1]);
            })
        };
        /*** end ***/

        if (typeof fns == "object") {
            for (var eventName in fns) {
                let fn = fns[eventName];
                typeof eventName == "string" && $.isFunction(fn) && marker.on(eventName, fn);
            }
        }

        return marker;
    }




    /**
     * 删除Marker
     * @param a
     */
    static deleteMarker(map, a) {
        a = Array.isArray(a) ? a : [a];
        a.forEach(function (a) {
            "string" != typeof a && (a = a.id);
            if (map.getOverlays(a)) {
                map.removeOverlays(a);
                delete MapUI._markers[a]
            }
        });
    }



    static _currHighLines = [];//绘制道路线
    /**
     * 清除路线
     * @param map
     * @param pguid
     * @param cityid
     */
    static clearRoads() {
        if ($.isArray(this._currHighLines)) {
            this._currHighLines.forEach(item => {
                item.setMap(null)
            })
        }
    }

    /**
     * 绘制当前城市道路
     * @param map
     * @param lines
     * @param strokeColor
     * @param fitview
     * @param keepOverlay
     * @param highColor
     */
    static drawCurrCityRoad(map, lines, strokeColor, fitview, keepOverlay, highColor) {
        keepOverlay || map.removeOverlays(this._currHighLines);
        lines = $.isArray(lines) ? lines : [lines];
        var paths = [],
            bounds = new so.maps.LatLngBounds(),
            centerXY;
        for (var n = 0, data; data = lines[n++];) {
            bounds = strToBounds(data.bounds);
            centerXY = data.centerXY;
            bounds = bounds.union(bounds);
            for (var i = 0, xys; xys = data.lines[i++];) {
                var pt_arr = [];
                for (var j = 0, l = xys.xs.length; j < l; j++) {
                    var xs = parseFloat(xys.xs[j]);
                    var ys = parseFloat(xys.ys[j]);
                    var latlng = new so.maps.LatLng(ys, xs);
                    pt_arr.push(latlng);
                }
                paths.push(pt_arr)
            }
        }

        var pl = new so.maps.Polyline({
            map: map,
            visible: true,
            path: paths,
            strokeColor: highColor || strokeColor || '#53A8D9',
            strokeWeight: 4,
            strokeOpacity: 0.8
        });

        highColor && this._currHighLines.push(pl);
        fitview && this.fitOverlayBesideLeftCard(map, bounds);
    }

    /**
     * 绘制行政区域
     * @param map
     * @param areas
     * @returns {*}
     */
    static drawDistrict(map, areas) {
        var id = "_polygon_district";
        var polygon = map.getOverlays(id);

        if (typeof areas == "string" && areas) {
            var coords = areas.split(';');
            var path = [];
            for (var n = coords.length, j = 0; j < n; j++) {
                var coord = coords[j].split(',');
                var latlng = new so.maps.LatLng(coord[0], coord[1]);
                path.push(latlng);
            }
            if (polygon) {
                polygon.setPath(path);
                polygon.setMap(map);
                return polygon;
            } else {
                return new so.maps.Polygon({
                    id,
                    map,
                    path: path,
                    strokeColor: '#7299e4',
                    strokeWeight: 2,
                    fillColor: '#7299e4',
                    fillOpacity: 0.3,
                    cursor: 'default'
                })
            }
        } else {
            polygon && polygon.setMap(null);
        }
    }

    /**
     * 清除绘制行政区域
     * @param map
     */
    static clearDistrict(map) {
        var id = "_polygon_district";
        var polygon = map.getOverlays(id);
        polygon && polygon.setMap(null);
    }

    /**
     * 绘制省份区域
     * @param map
     * @param areas
     * @returns {*}
     */
    static drawProvince(map, figure) {
        var figures = figure.split('|');
        var bounds = figures[0].split(';');
        var sw = bounds[0].split(',');
        var ne = bounds[1].split(',');

        bounds = new so.maps.LatLngBounds(
            new so.maps.LatLng(sw[0], sw[1]),
            new so.maps.LatLng(ne[0], ne[1])
        );
        map.fitBounds(bounds);
        if (figures[1]) {
            var areas = figures[1].split('$');
            var result = [];
            for (var len = areas.length, i = 0; i < len; i++) {
                var coords = areas[i].split(';');
                var path = [];
                for (var n = coords.length, j = 0; j < n; j++) {
                    var coord = coords[j].split(',');
                    path.push(new so.maps.LatLng(coord[0], coord[1]));
                }

                var id = "_polygon_province" + i;
                var polygon = map.getOverlays(id);

                if (polygon) {
                    polygon.setPath(path);
                    result.push(polygon);
                } else {
                    var ie = $.browser.msie;
                    var ver = $.browser.version;
                    result.push(new so.maps.Polygon({
                        id,
                        path: path,
                        strokeColor: '#0000FF',
                        strokeWeight: 2,
                        fillOpacity: 0.1,
                        fillColor: '#FFFF00',
                        strokeDashStyle: ie && ver < 9 ? '8 2 1 2' : '5,5',
                        cursor: 'default'
                    }))
                }
            }
            return result;
        }
    }

    /**
     * 绘制圆形
     * @param map
     * @param a
     * @param b
     */
    static drawCircle(map, a, b) {
        return new so.maps.Circle({
            id: "circle",
            center: a,
            map,
            radius: b,
            strokeColor: "#0000ff",
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: "#7674fb",
            fillOpacity: 0.35
        });
    }

    /**
     * 创建label对象
     * @param map
     * @param conf
     * @param fns
     * @returns {*}
     */
    static createLabel(map, conf, fns) {
        var marker;

        if (conf.id) {
            marker = map.getOverlays(conf.id);
        }

        if (marker) {
            marker.clear();
            marker.setOptions(conf);
        } else {
            marker = new so.maps.Label(conf);
        }

        /*** 重写on 方法，记录业务上的绑定事件, 提供clear方法，清空所有自定义绑定事件 ***/
        var _on = marker.on;
        marker._event = [];
        marker.on = function (eventName, handler, useCapture) {
            this._event.push([eventName, handler]);
            _on.call(this, eventName, handler, useCapture);
        };
        marker.clear = function () {
            var self = this;
            this._event.map(function (ev) {
                self.off(ev[0], ev[1]);
            })
        };
        /*** end ***/

        if (typeof fns == "object") {
            for (var eventName in fns) {
                let fn = fns[eventName];
                typeof eventName == "string" && $.isFunction(fn) && marker.on(eventName, fn);
            }
        }

        return marker;
    }

    static findMarker(a) {
        if (typeof a == "object") {
            return a;
        }
        return this._markers[a]
    }

    static unfocusMarker(a) {
        Object.prototype.toString.call(a) === "[object String]" && (a = this.findMarker(a));

        if (null != a && this._selectedMarker == a) {
            this._selectedMarker = null;
            a._isFocused = false;
            so.maps.event.trigger(a, "mouseout");
            a.iw && (a.iw.close(), a.iw.setMap(null));
        }
    }

    // 真实创建marker的函数，自动绑定mouseover, mouseout事件，2个事件都会自动调用配置项的参数
    static _createMarker(conf, iconConf, fns) {
        fns = fns || {};
        var def = iconConf.def;
        var img_src = iconConf.img_src;

        var h = {
            offset: iconConf.offset,
            icon: new so.maps.MarkerImage(
                img_src,
                new so.maps.Size(def.width, def.height),
                new so.maps.Point(Math.abs(def.bk[0]), Math.abs(def.bk[1])),
                typeof def.left != 'undefined' ? new so.maps.Point(def.left, def.top) : false
            )

        };


        var mar = this.getMarker(conf.map, Object.assign(h, conf), fns);
        mar.conf = iconConf;

        return mar;
    }



    /**
     * 清除公交线路polyline和站点marker
     * */
    static hideBusline() {
        if (_buslinePolyline) {
            _buslinePolyline.setMap(null);
            _startMarker.setMap(null);
            _endMarker.setMap(null);
            _stationMarkers.map((marker) => {
                marker.setMap(null);
                ;
            });
        }
    }

    /**
     * 显示公交线路polyline和站点marker
     * @param {object} map 地图对象
     * @param {object} coordinates 折线的经纬度地理坐标（路径坐标）
     * @param {array} stations 公交线路的站点集合
     * */
    static showBusline(map, coordinates, stations, bCancelFitbound) {
        //创建线路polyline
        if (!_buslinePolyline) {
            _buslinePolyline = new so.maps.Polyline({
                strokeOpacity: 0.9,
                strokeWeight: 6,
                path: coordinates,
                visible: true,
                map: map
            });
        } else {
            _buslinePolyline.setPath(coordinates);
            _buslinePolyline.setMap(map);
            _stationMarkers.map((marker) => {
                marker.setMap(null);
            });
        }
        !bCancelFitbound && this.fitOverlayBesideLeftCard(map, _buslinePolyline, false, true);

        //创建站点marker
        _stationMarkers = stations.map(station => {
            return this.createStationMarker(map, station);
        });

        //设置起始点
        if (!(_startMarker || _endMarker)) {
            _startMarker = this.getRouteStartEndMarker(map, 'start');
            _endMarker = this.getRouteStartEndMarker(map, 'end');
        }
        let len = _stationMarkers.length - 1;
        _startMarker.setOptions({
            map,
            position: _stationMarkers[0].getPosition(),
            draggable: false
        });
        _endMarker.setOptions({
            map,
            position: _stationMarkers[len].getPosition(),
            draggable: false
        })
    }

    /**
     * 获取当前公交线路中的站点marker
     * */
    static getStationMarkers() {
        return _stationMarkers;
    }

    /**
     * 打开上一步、下一步气泡框
     * @param map
     * @param step
     */
    static openStepInfo(map, step) {
        if (!_stepInfoWindow) {
            _stepInfoWindow = new so.maps.InfoWindow({
                map,
                maxWidth: 500,
                //minWidth:410,
                panMargin: new so.maps.Size(450, 100),
                noScroll: true,
                hasCloseButton: false
            });
        }
        _stepInfoWindow.setOptions({
            content: getStepContent(step),
            map
        })
    }

    /**
     * 基础底图的热点
     * @param conf
     * @param basePoiInfo
     * @param fns
     * @returns {*}
     */
    static addBasePoiMarker(conf, basePoiInfo, fns) {
        if (!basePoiInfo) {
            return;
        }

        var iconConf = {};

        if (Object.prototype.toString.call(basePoiInfo) !== "[object Number]" && basePoiInfo === 'none') {
            iconConf = g_markerConf.none;

            return this._createMarker(conf, iconConf, fns);
        }
        if (basePoiInfo == -1) {
            iconConf = g_markerConf.back;
            return this._createMarker(Object.assign({
                zIndex: 6,
                iconType: "back"
            }, conf), iconConf, fns);
        }

        // 其他点走背景点
        if (basePoiInfo >= 100) {
            iconConf = g_markerConf.under;
            return this._createMarker(Object.assign({
                zIndex: 6,
                iconType: "under"
            }, conf), iconConf, fns);
        }

        iconConf = g_markerConf[basePoiInfo] || g_markerConf.list(basePoiInfo);
        if (conf.iconType && typeof (g_markerConf[conf.iconType]) == "function") {
            iconConf = g_markerConf[conf.iconType](conf.map, basePoiInfo);
        }
        conf.zIndex = 10;
        return this._createMarker(conf, iconConf, fns);
    }



    /****************************** 生产overlay相关 end ******************************/

    /****************************** 地图视图定位相关 start ******************************/

    /**
     * 避开左侧的搜索工具卡片位置，让pois点集中显示在右侧地图区域
     * @param map
     * @param bounds
     * @param zoomSpan
     */
    static bFitZoomBaseCurrentZoom(map, start, end, zoomSpan = 2) {
        let curBounds = this.getCurrentShowBounds(map, 450);
        let curne = curBounds.getNorthEast();
        let cursw = curBounds.getSouthWest();
        if (curBounds.contains(new so.maps.LatLng(start.y, start.x)) && curBounds.contains(new so.maps.LatLng(end.y, end.x))) {
            let lngSpan = Math.abs(end.x - start.x);
            let latSpan = Math.abs(end.y - start.y);
            if (lngSpan > latSpan) {
                let span = Math.abs(curne.getLng() - cursw.getLng());
                if (span > lngSpan * zoomSpan) {
                    return true
                }
            } else {
                let span = Math.abs(curne.getLat() - cursw.getLat());
                if (span > latSpan * zoomSpan) {
                    return true
                }
            }
            return false;
        }

        return true;

    }

    /**
     * 避开左侧的搜索工具卡片位置，让pois点集中显示在右侧地图区域
     * @param map
     * @param pois
     */
    static fitBoundsBesideLeftCard(map, pois, smooth) {
        if (pois) {
            if (pois.length == 1) {
                this.setCenterBesideLeftCard(map, pois[0].y, pois[0].x)
            } else {
                let path = [];
                pois.forEach(item => {
                    path.push(new so.maps.LatLng(item.y, item.x));
                });
                if (path.length > 1) {
                    _tempPolyline.setPath(path);

                    this.fitOverlayBesideLeftCard(map, _tempPolyline, smooth);
                }
            }
        }
    }

    /**
     * 设置当个点位地图中心，同时避开左侧卡片
     * @param lat
     * @param lng
     * @param zoom
     */
    static setCenterBesideLeftCard(map, lat, lng, zoom = 14) {
        map.setCenter(new so.maps.LatLng(lat, lng - 0.012));
        map.setZoom(zoom);
        CurrentCityUpdater.updateCity(map)
    }

    /**
     * 为overler避开左侧的搜索工具卡片位置，让pois点集中显示在右侧地图区域
     * @param map
     * @param pois
     * @param smooth
     * @param besideLeft
     */
    static fitOverlayBesideLeftCard(map, overlay, smooth, besideLeft) {
        let bounds = overlay instanceof so.maps.LatLngBounds ? overlay : overlay.getBounds();
        if (bounds) {
            let left = !besideLeft && $(".left-card").height() < 100 ? 0 : 436;
            map.fitBounds(bounds, null, {left, top: 78, right: 67, bottom: 30}, smooth);
            setTimeout(() => {
                CurrentCityUpdater.updateCity(map)

            })
        }
    }

    /**
     * 让poi避开左侧卡片，平移到当前视图可见区域
     * @param map
     * @param lng
     */
    static setPoiInnerViewBesideLeftCard(map, poi, left = 436, top = 82, right = 69, bottom = 25) {
        let proj = map.getMapCanvasProjection();
        if (!proj)return;//地图初始化时候，虽然已经ready但有时候获取projection还会为undefined
        let ptTemp = map.getMapCanvasProjection().fromLatLngToContainerPixel(new so.maps.LatLng(poi.y, poi.x));
        let x = ptTemp.getX();
        let y = ptTemp.getY();
        let el = map.getContainer();
        let width = $(el).width();
        let height = $(el).height();
        let offsetX = 0;
        let offsetY = 0;
        let label = map.getOverlays("__spotdetail");
        let st = label.getStyle();
        let marginLeft = parseInt(st.marginLeft) - 2;
        let marginTop = parseInt(st.marginTop) - 2;
        left = $(".left-card").height() < 100 ? 0 : left;

        if (x < left - marginLeft) {
            offsetX = left - x + -marginLeft;
        } else if (width - x < right) {
            offsetX = width - x - right + marginLeft;
        }


        if (y < top - marginTop) {
            offsetY = top - y - marginTop;
        } else if (height - y < bottom) {
            offsetY = height - y - bottom;
        }

        if (offsetX || offsetY) {
            map.panBy(offsetX, offsetY);
        }
    }

    /**
     * 获得当期可视范围内的范围，因为左侧显示搜索列表框的内容
     * @param map
     * @returns {LatLngBounds}
     */
    static getCurrentShowBounds(map, left = 436, top = 82, right = 69, bottom = 25) {
        let bounds = map.getBounds();
        let pt = map.getMapCanvasProjection().fromContainerPixelToLatLng(new so.maps.Point(left, top));
        let sw = bounds.getSouthWest();
        sw.lng = Math.max(sw.lng, pt.lng);
        return new so.maps.LatLngBounds(sw, bounds.getNorthEast())
    }

    /**
     * 将地图设置到全国
     * @param map
     */
    static setMapToCountryView(map) {
        let city = City.getCity('全国');
        map.setZoom(4, true);
        map.setCenter(new so.maps.LatLng(city.y, city.x));
    }

    /****************************** 地图视图定位相关 end ******************************/


    /**
     * 预置起始点的路径规划，主要用于右键设置路径规划和拖动起始点的路径规划
     * @param type
     * @param callback
     */
    static directionForPreset(type, position, map, callback) {
        CurrentCityUpdater.lnglatToAddress(position, function (data) {
            //如果返回数据出错则使用默认信息
            data = data || {
                    address: "未知地址",
                    citycode: "0",
                    cityid: "0",
                    name: "未知道路",
                    x: position.lng,
                    y: position.lat
                };
            let rt = {};
            if (type == "start") {
                So.origin_mark = true;
                rt = {startPoi: data}
            } else if (type == "end") {
                So.destination_mark = true;
                rt = {endPoi: data}
            }
            callback(map, "direction", "none", rt);
        });
    }

    /****************************** 几个开关 start ******************************/
    /**
     * 禁止右键菜单展现
     */
    static disableContextMenu() {
        _menuControl && (_menuControl.enable = false);
    }

    /**
     * 设置右键菜单展现
     */
    static enableContextMenu() {
        _menuControl && (_menuControl.enable = true);
    }

    /**
     * 显示基础底图的poi开关
     * @type {boolean}
     */
    static showBasePOIFlag = true;

    /**
     * 打开显示BaseTilePOI
     */
    static enableBaseTilePOI() {
        this.showBasePOIFlag = true;
    }

    /**
     * 打开显示BaseTilePOI
     */
    static disableBaseTilePOI() {
        this.showBasePOIFlag = false;
    }

    /****************************** 几个开关 end ******************************/



    //获取地图覆盖物
    static getMapOverlay(type, value) {
        switch (type) {
            case "user":
                return new so.maps.Marker({
                    position: value.xy,
                    map: value.map,
                    icon: this.getMarkerImage("user"),
                    zIndex: 998
                });
                break;
            case "draggingLabel":
                return new so.maps.Label({
                    content: "<div style='font-weight: bold'>" + value.name + "</div><div style='overflow:hidden;text-overflow: ellipsis;'>" + value.address + "</div>",
                    map: value.map,
                    clickable: !!0,
                    style: {
                        boxShadow: '2px 2px 4px #aaa',
                        width: '300px',
                        padding: '10px',
                        backgroundColor: '#fff',
                        fontSize: '14px',
                        overflow: 'hidden'
                    },
                    position: value.position,
                    offset: new so.maps.Size(-150, -130),
                    zIndex: 998
                })
                break;
            case "fixLabel":
                return new so.maps.Label({
                    content: value.content, map: value.map,
                    style: {
                        boxShadow: '0 0 5px 0 rgba(0,0,0,.3)',
                        width: '350px',
                        height: '140px',
                        backgroundColor: '#fff',
                        fontSize: '14px'
                    },
                    position: value.position,
                    offset: new so.maps.Size(-175, -200)
                })
                break;
        }
    }

    static backToOrig(map) {

        if (user) {
            map.off("dragstart", handleDragState);
            map.off("center_changed", handleDragState);
            map.off("idle", handleDragState);

            this.handleDetailFixLabel();
            this.closeInfoWindow();
        }
    }

    //获取当前地图的状态
    static getMapUseState() {
        return mapUseState;
    }

    //选择起点终点
    static setMapUseState(v) {
        mapUseState = v;
    }

    //ip location
    static setCenter(map, loc, surp) {

        this.backToOrig(map);
        if (user) {
            user.off('click');
            user.setMap(null);
            user = null;
        }

        if (!map || !loc)return;

        let xy = new so.maps.LatLng(loc.y, loc.x),
            zoom = Math.max(14, map.zoom);

        mapUseState = 0;

        if (surp !== 'err' && surp !== 'hasDefault') {//异常中断或者有预设城市的情况下不需要重置中心点
            map.setCenter(xy);
            map.setZoom(zoom);
            map.emit("idle");
        }

        user = this.getMapOverlay("user", {xy: xy, map: map});
        user.__id__ = "iplocation";
        user._poiInfo = Object.assign({}, loc, {self: !0});

        user.on('click', (e) => {
            //地图在路线情况下的使用情况
            let inputs = $(".suggest-input input.react-autosuggest__input");
            if (inputs.length && (!$(inputs[0]).val() || !$(inputs[1]).val())) {
                if (!$(inputs[0]).val()) {
                    map.actions.selectRoutePoi(user._poiInfo, "start");
                } else {
                    map.actions.selectRoutePoi(user._poiInfo, "end");
                }
            } else {

                this.openDefaultPoiInfoWindow(user);
            }
        })
    }



    //ip location 纠错
    static handleFixUserLocation() {
        if (user) {
            let map = user.map,
                info = user._poiInfo;

            this.closeInfoWindow();
            map.actions.init(map);
            map.actions.switchCardType(map, "search");
            this.clearSmallTipLabel();
            this.handleDetailFixLabel();

            user.setIcon(this.getMarkerImage("fix"));

            setTimeout(() => {
                this.handleDetailFixLabel(!0, map)
            }, 10);//异步最后执行

            p = map.mapCanvasProjection.fromLatLngToContainerPixel(user.position);

            map.on("dragstart", handleDragState);
            map.on('center_changed', handleDragState);
            map.on('idle', handleDragState);
        }
    }



    /***********************默认info window end******************************/


    /***********************小水滴视频info window start******************************/
    static closeVideoInfoWindow = () => {
        if (_videoInfoWindow) {
            _videoInfoWindow.close();
            //ReactDom.unmountComponentAtNode(_videoInfoWindowContainer );
        }
    };



    static closeVideoInfoWindow2() {
        this.clearSmallTipLabel();
    }

    static openVideoInfoWindow2(marker, poi, marginTop, marginLeft) {
        //****1)创建label
        let pos = marker.getPosition();
        let map = marker.getMap();
        let flag = true;
        _tipPos = pos;
        if (!_smallTiplabel) {
            flag = false;
            _smallTiplabel = new so.maps.Label({
                id: "__spotdetail",
                zIndex: 10000
            });
            _smallTiplabel.on("domready", () => {
                this.setPoiInnerViewBesideLeftCard(map, {x: pos.getLng(), y: pos.getLat()});
            });
        }
        $("#droplet_info .winClose").live("click", () => {
            this.closeVideoInfoWindow2()
        });

        //****2)构建内容
        let {poi_name, video, direct, zhibo, r} = poi;
        let videoName = zhibo == 0 ? '<span class="down-text">画面拍摄于 <span id="video-time"/></span>' : '<span class="down-text">正在播放</span>';

        let video_url = 'https://ditu.so.com/trafficlive/?sn=' + video[0].sn + '&zhibo=' + zhibo + '&direct=' + direct + '&r=' + encodeURIComponent(r) + '&src=pc&t=' + (new Date()).getTime();
        let content = `<div id="droplet_info">
            <div class="content">
                <div class="title">
                    ${poi_name}
                    <em class="video-tips">实景路况</em>
                    <a class="winClose" href="javascript:;"></a>
                </div>
                <iframe id="video_frame" class="player-frame" src=${video_url}></iframe>
                <div class="down">
                    <div class="droplet-player"></div>
                    <div class="down-title">${video[0].title || ""}</div>
                    ${videoName}
                </div>
            </div>
            <div class="label-arrow"></div>
            </div>`;


        //****3)计算偏移量
        if (!marginLeft) {
            let m = document.createElement("div");
            m.innerHTML = content;
            //由于label只能通过innerhtml填入，因此没法计算宽度。以下求宽度
            let $m = $(m);
            $m.css({"visibility": "#hidden", "position": "absolute"});
            document.body.appendChild(m);
            marginLeft = $(m).width() / -2;
            $m.remove();
        }

        _smallTiplabel.setOptions({
            map,
            style: {
                border: "none",
                padding: 10,
                marginTop: marginTop + "px",
                marginLeft: marginLeft + "px"
            },
            content,
            position: pos
        });

        flag && this.setPoiInnerViewBesideLeftCard(map, {x: pos.getLng(), y: pos.getLat()});

    }

    /***********************小水滴视频info window end******************************/


    /**
     * 获取当前经纬度的poi地址信息
     * @param position 经纬度
     * @param callback 回调函数
     */
    static getAdressByLngLat(position, callback) {
        CurrentCityUpdater.lnglatToAddress(position, function (data) {
            //如果返回数据出错则使用默认信息
            data = data || {
                    address: "未知地址",
                    citycode: "0",
                    cityid: "0",
                    name: "未知道路",
                    x: position.lng,
                    y: position.lat
                };
            let poiInfo = data;
            callback(poiInfo);
        });

    }


}
const getStepContent = function (step) {
    "use strict";

}

const strToBounds = function (str) {
    var arrs = str.split(';');
    var ne = arrs[0].split(',');
    var sw = arrs[1].split(',');
    sw = new so.maps.LatLng(sw[0], sw[1]);
    ne = new so.maps.LatLng(ne[0], ne[1]);
    return new so.maps.LatLngBounds(sw, ne);
}

/*****************************************************/
/*g_markerConf 为mark的icon设置对象，从map-ui.js中拷贝而来*/
/*****************************************************/
const g_markerConf = {
    hotspot: function (map, info) {
        info = info || {};
        var id = info.ic;
        id = id.split('_');

        var zoom = map.getZoom();
        var offset = {};

        var width = info.i[2] + 2;
        var height = info.i[3] + 2;
        var left_offset = offset[zoom] && offset[zoom].left || 0;
        var top_offset = offset[zoom] && offset[zoom].top || 0;

        var left = width / 2 - left_offset;
        var top = height / 2 - top_offset;
        var bk_x = id[0] * 30;
        var bk_y = id[1] * 30;
        return {
            img_src: 'https://ditu.so.com/img/marker_hotspot.png?v=20170327',
            def: {
                bk: [bk_x, bk_y],
                width: width,
                height: height,
                top: top,
                left: left
            },
            over: {
                bk: [bk_x, bk_y],
                width: width,
                height: height,
                top: top,
                left: left
            }
        }
    },
    // 无状态点
    none: {
        def: {
            bk: [-73, 0],
            width: 27,
            height: 32
            // @api todo left top
        },
        offset: {
            x: 0,
            y: -37
        },
        over: {
            bk: [-146, 0],
            width: 32,
            height: 36,
            left: 15,
            top: 36
        }
    },
    // 底部平铺点
    under: {
        def: {
            bk: [-465, 0],
            width: 10,
            height: 14,
            top: 15,
            left: 6
        },
        offset: {
            x: 0,
            y: -10
        },
        over: {
            bk: [-443, 0],
            width: 12,
            height: 16,
            top: 16,
            left: 7
        }
    },
    back: {
        def: {
            bk: [-443, 0],
            width: 12,
            height: 16,
            left: 6,
            top: 18
        },
        offset: {
            x: 0,
            y: -10
        }
    },
    // 普通poi
    list: function (index) {
        return {
            def: {
                bk: [-37 * index, -43],
                width: 27,
                height: 33,
                left: 12,
                top: 33
            },
            offset: {
                x: 0,
                y: -35
            },
            over: {
                bk: [-37 * index, -222],
                width: 35,
                height: 38,
                left: 14,
                top: 38
            }
        }
    }
}


let isDragging = !!0;
function handleDragState(e) {

    if (!user)return;

    let map = user.map,
        info = user._poiInfo;
    let ll = null;

    switch (e.type) {
        case 'dragstart':
            MapUI.closeInfoWindow();
            MapUI.handleDetailFixLabel();
            user.setAnimation(so.maps.Animation.BOUNCE);

            isDragging = !0;

            break;
        case 'center_changed':

            if (!isDragging)return;

            MapUI.handleDetailFixLabel();

            ll = map.mapCanvasProjection.fromContainerPixelToLatLng(p);

            user.setPosition(ll);

            if (label) {
                label.setPosition(ll);
            } else {
                label = MapUI.getMapOverlay("draggingLabel", {
                    name: info.name,
                    address: info.address,
                    map: map,
                    position: ll
                })
            }
            break;
        case 'idle':

            if (!isDragging)return;

            label.setMap(null);
            label = null;

            ll = map.mapCanvasProjection.fromContainerPixelToLatLng(p);

            user.setAnimation(so.maps.Animation.DOWN);

            isDragging = !!0;

            $.ajax(GEOCODE_API + '?sid=7001&x=' + ll.getLng().toString() + '&y=' + ll.getLat().toString() + '&addr_desc=true', {
                dataType: 'jsonp',
                callback: 'callback',
                success: (res) => {

                    ll = map.mapCanvasProjection.fromContainerPixelToLatLng(p);

                    let info = user._poiInfo;
                    let n = res.location ? res.location + '附近' : "未知";
                    let addr = res.address ? res.address : "未知地址";
                    user._poiInfo = Object.assign({}, info, {
                        name: n,
                        address: addr,
                        x: ll.getLng().toString(),
                        y: ll.getLat().toString(),
                        city: res.city_name
                    });
                    MapUI.handleDetailFixLabel(!0, map);
                }
            })

            break;
    }

}

