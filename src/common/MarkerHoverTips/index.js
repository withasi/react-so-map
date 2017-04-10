/**
 * Created by wangchao3-pd on 2016/6/23.
 */
import React,{Component,PropTypes} from 'react';
import closeImg from '../../../../img/close.png'
export default class MarkerHoverTips extends Component{
    render(){
        let {info,tipsType} = this.props;
        let content = null;
        if(tipsType=='hover'){
            content = <div style={styles.content}>
                <h3 style={styles.title}>{info.title}</h3>
                <p style={styles.time}>预计结束时间：{getTime(info.etime_ts)}</p>
            </div>
        }else{
            let startDesc = info.stime_ts ? <p style={styles.time}>起始时间：{getTime(info.stime_ts)}</p> : '';
            let endDesc = info.etime_ts ? <p style={styles.time}>预计结束时间：{getTime(info.etime_ts)}</p> : '';
            let desc = info.desc ? <p style={styles.detail}>详情：{info.desc}</p> : '';
            content = <div style={styles.content}>
                <span onClick={this.closeWindow} style={styles.closeBtn}></span>
                <h3 style={styles.title}>{info.title}</h3>
                {startDesc}
                {endDesc}
                {desc}
            </div>
        }
        return (
            <div style={styles.wrapper}>
                {content}
            </div>
        )
    }
    closeWindow = () =>{
        this.props.infoWindow.close();
    }
}
function getTime(ts){
    var dt = new Date(ts*1000);
    var hour = dt.getHours();
    var min = dt.getMinutes();
    hour = hour < 10 ? '0'+hour : hour;
    min = min < 10 ? '0' + min: min;
    return dt.getFullYear()+"年"+ (dt.getMonth()+1)+"月"+dt.getDate()+"日 "+ hour+":"+min;
}
var styles = {
    wrapper:{
        position:'relative',
        paddingLeft:22,
        background:'#fff'
    },
    content:{
        paddingTop:15,
        paddingBottom:20,
        color:'#535353'
    },
    title:{
        paddingBottom:10,
        borderBottom:'1px solid #e5e5e5',
        fontSize:14,
        fontWeight:700
    },
    time:{
        marginTop:5,
        paddingRight:20,
        fontSize:12
    },
    detail:{
        marginTop:15,
        paddingRight:20
    },
    closeBtn:{
        position: 'absolute',
        top: 12,
        right: 12,
        width: 14,
        height: 15,
        background: 'url('+closeImg+') no-repeat 0 0',
        cursor: 'pointer'
    }
};