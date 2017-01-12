/**
 * Created by siwangli on 2016/12/29.
 */
'use strict';
import React from 'react';
import Overlays from './Overlays'
export default class Marker extends Overlays{
    constructor(param) {
        super(param)

        param = param||{};
        param.position = param.position ? new so.maps.LatLng(param.position.lat, param.position.lng) : null;
        new so.maps.Marker(param);
    }
    getBounds = (latLng) => {
        var lng = latLng.getLng();
        var lat = latLng.getLat();
        var zoom = this.get('zoom');
        var centerPoint = Math.pow(2, zoom + 7);
        var totalPixels = centerPoint * 2;
        var pixelsPerLngDegree = totalPixels / 360;
        var pixelsPerLatRadian = totalPixels / (2 * Math.PI);
        var siny = Math.min(Math.max(Math.sin(lat * (Math.PI / 180)), -0.9999), 0.9999);
        var x = centerPoint + lng * pixelsPerLngDegree,
            y = centerPoint - 0.5 * Math.log((1 + siny) / (1 - siny)) * pixelsPerLatRadian;
        var tileSize = this.get('mapType').tileSize;

        var tx = Math.floor(x / tileSize.width);
        var ty = Math.pow(2, zoom) - Math.floor(y / tileSize.height) - 1;

        return [tx, ty];
    }
}
