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
}
