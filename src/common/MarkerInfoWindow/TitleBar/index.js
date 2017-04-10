/**
 * Created by wangchao3-pd on 2016/5/30.
 */
import React, {Component, PropTypes} from 'react';
import MultipleTools from '../MultipleTools';
import MapUI from '../../../../map/overlay/MapUI';
import styles from './index.less';
export default class TitleBar extends Component {
	
	handleFix(){

		MapUI.handleFixUserLocation();
	}
	
    render() {
        let {marker} = this.props;
			  let info = marker._poiInfo;
                return (
                    <div className={styles.titleBox}>
                        <div className={styles.title}>{info.self?"我的位置":info.name}</div>
                        <a className={styles.winClose} href="javascript:;" onClick={MapUI.closeInfoWindow}></a>
        					{info.self ? "":<div className={styles.tools}><MultipleTools marker={marker}/></div>}
        					{info.self ? <a onClick={this.handleFix.bind(this)} className={styles.fixBtn} href="javascript:;">定位不对?纠正一下</a>:""}
                    </div>
                )
            }
        }
TitleBar.propTypes = {
    marker: PropTypes.object.isRequired
};