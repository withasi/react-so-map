/**
 * Created by wangchao3-pd on 2016/5/30.
 */
import React,{Component,PropTypes} from 'react';
import TitleBar from './TitleBar';
import SearchFilter from './SearchFilter';
import InnerSearchBox from './InnerSearchBox';
import styles from './index.less';
import CurrentCityUpdater from '../../../map/city/currentcityupdater';
import City from "../../../map/city/cityinfo";
import {ROAD_DETAIL_API} from '../../../../interface/addressbook';
import MapUI from '../../../map/overlay/MapUI';
export default class MarkerInfoWindow extends Component {
    constructor() {
        super();
        this.state = {
            linesNames: '',
            currentIndex:0
        }
    }
    toggleFilter = (index) =>{
        this.setState({currentIndex:index});
    };

    getStationInfo=(marker)=>{
        const _self = this;
        var city = CurrentCityUpdater.city();
        var city_name = city.name || city.label;
        var city_id = City.toCityId(city_name);
        $.ajax({
            url: ROAD_DETAIL_API,
            type: "GET",
            dataType: "jsonp",
            jsonp: "jsoncallback",
            data: {
                name: marker._poiInfo.name, //公交站名
                sid: 38102, //38102 固定为38102,
                pid: marker._poiInfo.pguid,
                adcode: city_id //城市id
            },
            cache: false,
            success: function (json) {
                json&& _self.setState({
                   linesNames:json.linesNames
                })
            },
            error: function () {
            }
        });
    };
    componentDidMount() {
        let marker = this.props.marker;
        let map = marker.map;
        let poiInfo = marker._poiInfo;
        if(poiInfo&&poiInfo.station_no){
            this.getStationInfo(marker);
        }
       map.infoWindowClose.add(MapUI.closeInfoWindow);
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.marker!==this.props.marker){
            let marker = nextProps.marker;
            let poiInfo = marker._poiInfo;
            /*if(poiInfo&&poiInfo.station_no){
                this.getStationInfo(marker);
            }*/
        }
    }

    // tmpForTest(val){
    //     return (<a href="javascript:;" className={styles.tmpBtn} onClick={this.handleClick.bind(this,val)}>{val}</a>)
    // }

    // handleClick(type){
    //     if(type === '定位正确'){
    //         this.props.marker.map.actions.feedbackUserLocation(this.props.marker._poiInfo);
    //     }else if(type === '定位不对?纠正一下'){
    //         MapUI.handleFixUserLocation();
    //     }
    // }

    render() {
        let {marker} = this.props;
        let map = marker.map;
        let switchCardType = map.actions.switchCardType;
        let contentDiv = '' ;
        let poiInfo = marker._poiInfo;
        if(poiInfo){
            if(poiInfo.station_no){
                contentDiv = <div className={styles.linesNames}>途经公交：{this.state.linesNames}</div>;
            }else{
                contentDiv =  <div className={styles.linesNames}>地址：{poiInfo.address||poiInfo.name}</div>
            }
        }

        return (
            <div className={styles.markerInfoWrapper}>
                <div className={styles.markerInfoWindow}>
					<TitleBar marker={marker}/>
                    {contentDiv}
                    <div className={styles.searchWrapper}>
                        <SearchFilter toggleFilter={this.toggleFilter} currentIndex={this.state.currentIndex}/>
                        <InnerSearchBox map={map} poiInfo={poiInfo} currentIndex={this.state.currentIndex} switchLeftCard={switchCardType}/>
                    </div>
                </div>
            </div>
        )
    }
}

MarkerInfoWindow.propTypes = {
    marker:PropTypes.object.isRequired
};
