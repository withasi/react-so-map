/**
 * Created by siwangli on 2016/5/18.
 */
import React, {Component} from 'react';

import styles from './index.less';

export default class Title extends Component {



    getName(poi) {
        return (
            <span className={styles.name}>{poi.name}{this.getRoadEl(poi)}</span>
        )
    }

    getRoadEl(poi) {
        if (poi.geoType == "road") {
            if (poi.numname) {
                return (
                    <div className={styles.roadPanel}>
                        {/*
                         <span className={styles.roadLength}>{formatDistance(poi.length)}</span>
                         */}
                        <span className={styles.roadMark}>{poi.numname}</span>
                    </div>
                )
            } else {
                return <span className={styles.roadMark}>道路</span>
            }
        }
    }


    render() {
        let poi = this.props.poi;
        return (
            <div className={styles.title}>
                {this.getName(poi)}
            </div>
        )
    }

    updateDetailUrl(poi,origin,primary){
        let checkMaps = {
            32 : 'ctrip',
            12 : 'dianping'
        }
        if(poi.detail && poi.detail.business_url && poi.detail.poi_main_cat_new){
            let index = poi.detail.poi_main_cat_new;
            if(checkMaps[index] && (poi.detail.primary === checkMaps[index] || poi.detail.business_url.indexOf(checkMaps[index]) > -1)){
                return primary ? checkMaps[index] : poi.detail.business_url;
            }else{
                return primary ? 0 : origin
            }
        }else{
            return primary ? 0 : origin
        }
    }


}

// 格式化距离
/*function formatDistance(a) {
 if (/^[\d.]+$/.test(a)) {
 if (1E3 >= a) return a = a.toFixed(2), a + "米";
 a = Math.round(a / 100) / 10;
 return a + "公里"
 }
 return a
 }*/

/**
 * 打点
 * @param e
 */
const sendTrace = e => {

    e.stopPropagation();
    return false;
};
const sendDetailTrace = e => {

    e.stopPropagation();
    return false;
};
