/**
 * Created by siwangli on 2016/12/29.
 */
'use strict';
import React from 'react';
import SearchBox from './SearchBox/index';
import DirectionBox from './DirectionBox/index';
import './css/main';
/***** 兼容性全局变量 end ******/
export default class SoMap extends React.Component {
    constructor(param) {
        super(param);

        this.state={
            ready:false
        }
    }


    getMapOptions(opts) {
        opts = opts||{};
        opts.center = opts.center ? new so.maps.LatLng(opts.center.lat, opts.center.lng) : new so.maps.LatLng(39.924216, 116.397865);

        let config = {
            zoom: 11,
            minZoom: 3,
            maxZoom: 18,
            keyboardEnable: false,
            doubleClickZoom: true,
            scaleControl: true,
            scrollwheel: true
        };
        return Object.assign(config, opts||{});
    }

    createMap(options) {
        let mapOptions = this.getMapOptions(options);
        let eventHanders = this.props.eventHanders||{};

        this.map = new so.maps.Map(this.refs.mapContainer, mapOptions);
        this.bindMapEvent(this.map, eventHanders);

        this.map.on('ready', () => {
            this.setState({
                ready:true
            })
        });

    }

    renderComponents(cs){
        if(this.state.ready){
            return cs.map((item, i)=>{
                switch(item){
                    case "searchBox":
                        return <SearchBox key={i} map={this.map}/>
                    case "directionBox":
                        return <DirectionBox key={i} map={this.map}/>
                }
            })
        }
    }

    componentDidMount() {
        this.createMap(this.props.mapOptions)
    }

    componentWillUnmount() {
       this.map = null;
    }

    bindMapEvent(map, eventHanders) {
        for(let n in eventHanders){
            map.on(n, eventHanders[n].bind(this))
        }
    }

    render() {
        return (
            <div style={st.container}>
                <div ref="mapContainer" style={st.container} />
                {this.renderComponents(this.props.mapComponents||[])}
            </div>
        )
    }
}


const st = {
    container:{
        width:"100%",
        height:"100%"
    }

}
