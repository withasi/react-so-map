/**
 * Created by siwangli on 2016/3/24.
 */
import React from 'react';
import SearchListItem from '../SearchListItem/index';
import {Scrollbars} from 'react-custom-scrollbars';
import Page from '../Page/index';
import POIFeedback2 from './../../common/POIFeedback2';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import MapUI from '../../MapUI';
//import Tabs, { TabPane } from 'rc-tabs';
//import TabContent from 'rc-tabs/lib/TabContent';
//import ScrollableInkTabBar from 'rc-tabs/lib/TabContent';
let _click_js, _pv_js;
const _bcThred = 8;
export default class SearchContent extends React.Component {
    constructor(data) {
        super(data);
        this.map = data.map;
        this.lines = this.formatBuslines();
        this.state = {
            curIndex: 0,
            initialed: true,
            isExpanded: data.poiList && data.poiList.busline ? data.poiList.busline.map(() => {
                    return false
                }) : [],
            bulineOpenIndex: null,
            fold: data.dt && data.dt.batch == 1 ? data.dt.fold != data.dt.poi.length : false,
            buslinefold: data.poiList ? data.poiList.busline && data.poiList.busline.length > 0 : false
        };

        //如果通过buslineid查找，则直接展开，并指定打开那个index
        this.initBuslineByIdState(data.poiList.buslineById);
    }

    /* componentWillReceiveProps(nextProps) {
     let {poiList} = nextProps.poiList;
     this.setState({
     buslinefold: poiList ? poiList.busline && poiList.busline.length > 0 : false
     })
     }*/


    /**
     * onebox跳转进来时，直接展开指定路线，并打开指定的站点信息
     * http://ditu.so.com/?type=busdetail&src=onebox&new=1&c=%E8%8B%8F%E5%B7%9E%E5%B8%82&lineid=9281d314ff8f33de&index=1
     */
    initBuslineByIdState(buslineById) {
        if (buslineById) {
            this.state.isExpanded = [true];
            //打开线路指定的站点index
            this.bulineOpenIndex = buslineById.index != undefined ? buslineById.index : undefined;
        }
    }

    componentDidMount() {

    }


    render() {
        return (
            <ReactCSSTransitionGroup transitionName="showpoilist" transitionEnterTimeout={500}
                                     transitionLeaveTimeout={500} transitionAppear={true}
                                     transitionAppearTimeout={500}>
                <div className="search-card-content">
                    {this.getResultList(this.props.poiList)}
                </div>
            </ReactCSSTransitionGroup>
        )
    }

    unFold = () => {
        this.setState({
            fold: 0
        }, () => {
            MapUI.fitBoundsBesideLeftCard(this.map, this.props.poiList.poi, true);
        });
    }
    unFoldBusline = () => {
        this.setState({
            buslinefold: 0
        }, () => {
            MapUI.fitBoundsBesideLeftCard(this.map, this.props.poiList.poi, true);
        });
    }

    showPagerOrFold(list) {
        if (list.poi && list.poi.length > 0) {
            if (this.state.fold) {
                return (
                    <div className="show-all-poi" onClick={this.unFold}>
                        <a>查看全部{list.totalcount}条结果</a>
                        <span className="icon"></span>
                    </div>
                )
            } else {
                this.refs.ScrollArea && this.refs.ScrollArea.scrollToTop();
                return <Page totalCount={list.totalcount}
                             curPage={list.batch}
                             pageSize={10}
                             queryTempParam={this.props.queryTempParam}
                             onFlipOver={this.props.onFlipOver}
                />
            }
        }
    }

    /**
     * 过滤poi。主要用于折叠poi列表；
     * @param res
     * @returns {*}
     */
    filter = (res) => {
        var except = ['火车票', '飞机票'];
        if (-1 != $.inArray(this.props.keyword, except)) {
            return res;
        }

        var poi = res.poi,
            me = this,
            rest = [],
            fold = res.fold || 0;

        $.each(poi, function (_, p) {
            // 精确匹配、地铁、公交站
            if (p.name.replace(/[\(（].*?[\)）]/g, '') === me.keyword) {
                rest.push(p);
            }
        });

        if (fold) {
            rest = poi.slice(0, fold);
        }

        var r = $.extend({}, res, true);
        r.poi = rest;
        return r;
    };

    showBuslinegerOrFold(list) {
        if (this.state.buslinefold && list.poi && list.poi.length > 0) {
            return (
                <div className="show-all-poi" onClick={this.unFoldBusline}>
                    <a> 查找其他名称中含有"{this.props.keyword}"的结果</a>
                    <span className="icon"></span>
                </div>
            )
        }
    }


    renderPoilist(list) {
        let pois = list.poi;
        if (Array.isArray(pois) && pois.length > 0) {


            return (
                <div id="e_map_idea">
                    {
                        pois.map((item, index) => {
                            let pos = new so.maps.LatLng(item.y, item.x);
                            let marker = this.props.poiMarkers[index];
                            if (item.y && item.x) {
                                marker.setOptions({
                                    position: pos,
                                    map: this.map
                                });
                            }

                            return (
                                <SearchListItem
                                    map={this.map}
                                    marker={marker}
                                    poi={item}
                                    key={index}
                                    keyword={this.props.keyword}
                                    poiIndex={index + 1}
                                    showPoiDetail={this.props.showPoiDetail}/>
                            )
                        })
                    }
                    {this.showPagerOrFold(list)}
                </div>
            )
        } else {

            if (this.props.contentType == "search") {
                return <POIFeedback2 keyword={this.props.keyword} list={list}/>
            }
        }
    }

    getBuslineResult(list) {
        if (list && list.isBusLine) {
            return null;
        }
    }





    getPoisResult(list) {
        list = this.state.fold ? this.filter(list) : list;
        if (list) {
            return (
                <div>
                    {this.renderPoilist(list)}
                </div>
            )
        }
    }



    getResultList(list) {
        if (list) {
            return (
                <div ref="scrollCont">
                    <Scrollbars ref="ScrollArea" style={{height: "100%"}}>
                        {this.getBuslineResult(list)}
                        {!this.state.buslinefold && this.getPoisResult(list)}
                    </Scrollbars>
                </div>
            )
        }
    }

    /**
     * 展现底部广告的打点
     * 20161222.广告那边有统计，暂时剔除掉
     */
    onUpdate = () => {
        const height = $(this.refs.scrollCont).height();
        for (let i = 0; i < 3; i++) {
            let bt = $(this.refs["ad_bottom" + i]);
            if (bt.length > 0) {
                if (bt.position().top < height && !bt.data("hasshow")) {
                    bt.data("hasshow", 1);

                }
            }
        }
    };



    /**
     * 创建所有线路
     * */
    formatBuslines() {
        let poiList = this.props && this.props.poiList || null;
        if (poiList && poiList.busline && poiList.busline.length > 0) {
            return poiList.busline.map(busline => {
                let stations = busline.stations;
                return {
                    coordinates: this.formateCoordinates(busline),
                    stations
                }
            })
        }
    }

    /**
     * 画出公交线路折线
     * */
    formateCoordinates(busline) {
        let xs = busline.xs;
        let ys = busline.ys;
        let coordinates = [];
        for (let i = 0; i < xs.length; i++) {
            coordinates.push(new so.maps.LatLng(ys[i], xs[i]));
        }
        return coordinates;
    }



}

/**
 * 注入广告的打点依赖
 * @param click_js
 * @param pv_js
 */
const insertAd = (click_js, pv_js) => {
    if (click_js || pv_js) {
        $('#bc_container').html('').append(click_js || '').append(pv_js || '')
    }
}