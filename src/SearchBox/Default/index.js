/**
 * Created by siwangli on 2016/5/31.
 */
import React,{Component} from 'react';

import styles from './index.less';
import Title from '../Title/index';
//import Marker from '../Marker/index';
export default class Default extends Component {
    constructor(props){
        super(props);

        //bad: let m = this.props.m
        let m = props.m;

        /*this.state = {
            active:false
        }*/
        this.handleMouseEnter = this.handleMouseEnter.bind(this);   
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.refreshMarkerClick = this.refreshMarkerClick.bind(this);
    }

    componentDidMount(){
        this.props.marker._listItem = this.refs.listitem;
    }
    handleMouseEnter(e){
        //this.setState({active:true});
        $(e.currentTarget).removeClass("poi-list-item").addClass("poi-list-item-hover");
        this.props.marker.emit("mouseover");
    }
    handleMouseLeave(e){
        //this.setState({active:false});
        $(e.currentTarget).removeClass("poi-list-item-hover").addClass("poi-list-item");
        this.props.marker.emit("mouseout");
    }
    handleClick(){
        this.props.showPoiDetail(this.props.poiIndex, this.props.marker, this.props.poi);
        //this.props.map.setCenter(this.props.marker.getPosition());
        this.props.marker._mouseout_open = false;
        this.props.marker.emit("mouseover");
        this.props.marker.setZIndex(35);
        let type = "cl_list";
        if(this.props.poiIndex==1){
            type = "cl_list1";
        }


    }

    refreshMarkerClick(marker){
        if(marker){
            marker.off("click");
            marker.setTitle(this.props.poi.name);
            marker.on("click", this.handleClick);
        }
    }
    render() {
        let poi = this.props.poi;
        let poiIndex = this.props.poiIndex;

        //todo:for test
        //poi.interven = '{"tips": "315曝光失信企业"}';
        this.refreshMarkerClick(this.props.marker);
        return (
            <div ref="listitem" className={styles.poiItem + " poi-list-item"} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} onClick={this.handleClick}>
                <div className="poi-icon">{poiIndex}</div>
                <div className={styles.poiContent}>
                    <div className={styles.topSection}>
                        <div className={styles.info}>
                            <Title poi={poi} />

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}


