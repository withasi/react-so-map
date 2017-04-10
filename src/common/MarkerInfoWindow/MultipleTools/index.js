/**
 * Created by wangchao3-pd on 2016/6/6.
 */
import React,{Component,PropTypes} from 'react';
import MapUI from '../../../../map/overlay/MapUI';
import styles from './index.less';
export default class MultipleTools extends Component {
    constructor(props) {
        super(props);
    }
    sendMessage=()=>{
        //todo:发送消息

    }
    addFavorite=()=>{
        //todo:添加到收藏夹

    }
    share=()=>{
        let map = this.props.marker.getMap();
        map.actions.handlePop({
            type : 'share',
            info : {
                poi : this.props.marker._poiInfo
            }
        })

    }

    del=()=>{
        MapUI.closeInfoWindow();
        this.props.marker.setMap(null)
    }

    render(){
        return (
            <div className={styles.tools}>
                {/*<span className={styles.sendMessage} onClick={this.sendMessage}> </span>
                <span className={styles.addFavorite} onClick={this.addFavorite}> </span>*/}
                <span title="删除" className={styles.del} onClick={this.del}> </span>
                <span title="分享" className={styles.share} onClick={this.share}> </span>
                <span title="编辑" className={styles.fix}><a className={styles.issue} target="_blank" href={'http://info.so.com//map_fix_pos.html?pid='+this.props.marker._poiInfo.pguid}> </a></span>
            </div>
        )
    }
}
MultipleTools.propTypes = {

};
