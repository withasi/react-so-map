import React,{Component} from 'react';
import styles from './index.less';

import PoiSuggestService from '../../../suggest/poisuggestservice';
import MapUI from '../../../../map/overlay/MapUI';

export default class FixLocation extends Component
{
	constructor(props){
		super(props);
	}
	
	render(){
		let info = this.props.marker._poiInfo;
		return(
			<div className={styles.fliwFrame}>
				<input id="fixLocationInput" type="text" className={styles.fliwFrameInput} ref="input" placeholder="请输入我的位置关键字" autoComplete="off"/>
				<div className={styles.sugFrame} id="sugFrame" style={{'display':'none','zIndex': '990'}}>
				</div>
				<div className={styles.fliwFrameDetail}> 
				  <span className={styles.cur_name}>{info.name}</span> 
				  <span className={styles.cur_addr}>{info.address}</span> 
				</div>
				<div className={styles.pos_edit_confirm} style={{'display': 'block'}}> 
				  <div className={styles.pos_edit_lbl}>拖动地图调整位置</div>
				  <div className={styles.pos_cancel_btn} id="fixCancel">取消</div>
				  <div className={styles.pos_confirm_btn} id="sumbitFix">提交</div>
				</div>
			</div>
		)
	}
}