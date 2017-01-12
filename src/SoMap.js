/**
 * Created by siwangli on 2016/12/29.
 */
'use strict';
import React from 'react';

export default class SoMap extends React.Component {
    constructor(param) {
        super(param);
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
            <div ref="mapContainer" style={st.container} />
        )
    }
}


const st = {
    container:{
        width:"100%",
        height:"100%"
    }

}
