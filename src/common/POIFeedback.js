/**
 * Created by siwangli on 2016/4/6.
 */
import React from 'react';

export default class POIFeedback extends React.Component {
    constructor() {
        super();
    }

    render() {
        return <div style={style.content}>
            <p>在<span>当前视野内</span>未找到相关地点</p>
            <p>您可以更换关键词再尝试，也可以在360地图<a href="http://info.so.com//map_suggest.html" target="_blank">反馈中心</a>添加该地点
            </p>
        </div>
    }
}


let style = {
    fontTitle: {
        fontWeight: "bold",
        color: "#666",
        marginBottom: 5
    },
    content: {
        margin: "10px 28px",
        color: "#9c9b96"
    }
}



