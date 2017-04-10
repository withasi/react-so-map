/**
 * Created by siwangli on 2017/1/11.
 */
import React from "react";
import SoMap from './src/SoMap';
import Marker from './src/Overlays/Marker';

const _Markers = [
    {
        position: {lat: 39.975065, lng: 116.490241},
    },
    {
        position: {lat: 39.974065, lng: 116.48441},
    },
    {
        position: {lat: 39.984065, lng: 116.48441},
    },

]

export default class App extends React.Component {
    render() {

        return (
            <SoMap mapOptions={{
                zoom: 14,
                center: {lat: 39.975065, lng: 116.490241}
            }} mapComponents={['searchBox']}
                   eventHanders={{
                       'click': mapEvent => {
                           console.log("click position:" + mapEvent.latLng.lat + "," + mapEvent.latLng.lng)
                       },
                       'dragend': mapEvent => {
                           console.log(mapEvent)
                       },
                       'zoom_changed': function () {
                           console.log(this.map.getZoom())
                       },
                       'ready': function () {
                           _Markers.forEach((options, index) => {
                               options.map = this.map;
                               new Marker(options)
                           })
                       }

                   }}
            />
        )

    }
}

