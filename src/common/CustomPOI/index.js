/**
 * Created by siwangli on 2016/9/21.
 */
import React, {Component} from 'react';
import st from './index.less'

export default class CustomPOI extends Component {

    renderOperateArea() {
        if (this.poi) {
            return (
                <div className={st.opercont}>
                    <span className={st.name}>{this.poi.name}</span>
                    <span className={st.btn} onMouseDown={this.openSetPanel}>修改</span>
                    <span className={st.btn} onMouseDown={this.removeHistory}>清空</span>
                </div>
            )
        } else {
            return (
                <div className={st.opercont}>
                    <span className={st.btn}>设置</span>
                </div>
            )
        }
    }
    render() {
        const cls = this.props.type == "home" ? st.home : st.company;
        this.poi = JSON.parse(this.getHistory(this.props.type));
        return (
            <div onMouseDown={this.clickHandler}
                 onMouseEnter={this.props.onMouseEnterHandler} onMouseLeave={this.props.onMouseLeaveHandler}
                 className={cls}>
                <span className={st.title}>{this.props.title}</span>
                {this.renderOperateArea()}
            </div>
        )
    }
    clickHandler = e => {
        if (this.poi) {
            this.props.setStatAndEnd(this.poi);
            this.props.doQueryDirection({
                keyword:this.poi.name
            });
        } else {
            this.openSetPanel(e);
        }
    };
    openSetPanel = e => {
        this.props.actions.handlePop({
            type:'location',
            info:{
                type:this.props.type,
                poi: this.poi||null
            }
        });
        e.stopPropagation();
    };
    getHistory(type) {
        if (window.localStorage) {
            return localStorage.getItem(type + "_poi");
        }
    }
    removeHistory = e => {
        if (window.localStorage) {
            this.poi = null;
            localStorage.removeItem(this.props.type + "_poi");
        }
        e.stopPropagation();
    }
}

