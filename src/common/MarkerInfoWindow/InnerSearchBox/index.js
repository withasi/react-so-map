/**
 * Created by wangchao3-pd on 2016/5/30.
 */
import React, {Component, PropTypes} from 'react';
import MapUI from '../../../../map/overlay/MapUI';
import styles from './index.less';
export default class InnerSearchBox extends Component {
    renderSearchBox() {
        const {currentIndex} = this.props;
        switch (currentIndex) {
            case 0:
                return <div className={styles.searchBox}>
                    <input onKeyPress={this.directionOnPress} ref="ipt" className={styles.input} type="text" placeholder="请输入起点"/>
                    <span className={styles.btn} data-type="transit" onClick={this.searchWithTransit}>公交</span>
                    <span className={styles.btn} data-type="driving" onClick={this.searchWithDriving}>驾车</span>
                </div>;
            case 1:
                return <div className={styles.searchBox}>
                    <input onKeyPress={this.directionOnPress} ref="ipt" className={styles.input} type="text" placeholder="请输入终点"/>
                    <span className={styles.btn} data-directiontype="transit" onClick={this.searchWithTransit}>公交</span>
                    <span className={styles.btn} data-directiontype="driving" onClick={this.searchWithDriving}>驾车</span>
                </div>;
            case 2:
                return <div className={styles.searchBox}>
                    <input ref="ipt" style={{width: '132px'}} onKeyPress={this.searchOnPress} className={styles.input}
                           type="text" placeholder="搜索周边信息"/>
                    <span className={styles.btn} data-type="nearby" onClick={this.searchWithKeyword}>搜索</span>
                    <span className={styles.keyword} onClick={()=>this.searchOnClick("酒店")}>酒店</span>
                    <span className={styles.keyword} onClick={()=>this.searchOnClick("餐厅")}>餐厅</span>
                    <span className={styles.keyword} onClick={()=>this.searchOnClick("银行")}>银行</span>
                    <span className={styles.keyword} onClick={()=>this.searchOnClick("医院")}>医院</span>
                </div>;
            default:
                return;
        }
    }

    render() {
        return this.renderSearchBox();
    }

    clearOverlay = ()=> {
        this.props.map.removeMarkMarkers();//主清除用户自定义的标记
        MapUI.hideBusline();
        MapUI.closeInfoWindow();
    };
    searchWithTransit = (e)=> {
        let {currentIndex, poiInfo, switchLeftCard, map} = this.props;
        let ipt = this.refs.ipt;
        let keyword = ipt.value.trim();
        if (!keyword) return;
        switch (currentIndex) {
            case 0 :
                switchLeftCard(map, "direction", "none", {
                    startPoi: {name: keyword},
                    endPoi: poiInfo,
                    directionType: 'transit'
                });
                break;
            case 1 :
                switchLeftCard(map, "direction", "none", {
                    startPoi: poiInfo,
                    endPoi: {name: keyword},
                    directionType: 'transit'
                });
                break;
            default:
                break;
        }
        this.clearOverlay();
    };
    searchWithDriving = (e)=> {
        let {currentIndex, poiInfo, switchLeftCard, map} = this.props;
        let ipt = this.refs.ipt;
        let keyword = ipt.value.trim();
        if (!keyword) return;
        switch (currentIndex) {
            case 0 :
                switchLeftCard(map, "direction", "none", {
                    startPoi: {name: keyword},
                    endPoi: poiInfo,
                    shouldTrigger: true,
                    directionType: 'driving'
                });
                break;
            case 1 :
                switchLeftCard(map, "direction", "none", {
                    startPoi: poiInfo,
                    endPoi: {name: keyword},
                    shouldTrigger: true,
                    directionType: 'driving'
                });
                break;
            default:
                break;
        }
        this.clearOverlay();

    };
    searchOnPress = (e) => {
        let {poiInfo, switchLeftCard, map} = this.props;
        var key = e.which;
        if (key == 13) {
            let keyword = e.target.value.trim();
            if (!keyword) return;
            poiInfo._keyword = keyword;
            switchLeftCard(map, "nearby", undefined, undefined, undefined, poiInfo);
            this.clearOverlay();
        }
    };
    directionOnPress = (e) => {
        var key = e.which;
        if (key == 13) {
            this.searchWithTransit(e)
        }
    };
    searchWithKeyword = (e)=> {
        let {poiInfo, switchLeftCard, map} = this.props;
        let ipt = this.refs.ipt;
        let keyword = ipt.value.trim();
        if (!keyword) return;
        poiInfo._keyword = keyword;
        switchLeftCard(map, "nearby", "none", undefined, undefined, poiInfo);
        this.clearOverlay();
    };
    searchOnClick = (kw)=> {
        let {poiInfo, switchLeftCard, map} = this.props;
        poiInfo._keyword = kw;
        switchLeftCard(map, "nearby", "none", undefined, undefined, poiInfo);
        this.clearOverlay();
    };

}
InnerSearchBox.propTypes = {
    poiInfo: PropTypes.object.isRequired,
    currentIndex: PropTypes.number.isRequired,
    switchLeftCard: PropTypes.func.isRequired
};
