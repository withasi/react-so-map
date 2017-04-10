/**
 * Created by siwangli on 2016/11/25.
 */
import React, {PropTypes} from 'react';
import CurrentCityUpdater from '../../map/city/currentcityupdater';
export default class NearbyPOIFeedback extends React.Component {
    render() {
        let {keyword, name} = this.props;
        const value1 = "想知道：" + name + " 附近的 " + keyword + " 在哪？";
        const value2 = name + "附近的" + keyword;
        return (
            <div style={style.content}>
                <p>没有找到相关的地点。</p>
                <form style={{marginTop: 10}} action="http://wenda.so.com/home/as/" method="get" target="_blank">
                    <div>您可以在问答提问，让其他网友帮您解决问题：</div>
                    <div>
                        <input style={style.wendaInput} name="q" type="text" onChange={() => {
                        }}
                               value={value1}/>
                    </div>
                    <div>
                        <input style={style.wendaBtn} type="submit" value="我要提问"/>
                    </div>
                    <input type="hidden" name="src" value="tab_map"/>
                </form>

                <div style={{marginTop: 10}}>您还可以：</div>
                <ul>
                    <li>看看输入的文字是否有误</li>
                    <li>尝试更换输入文字：去掉过于冗长的部分，并用空格键将多个关键词分开</li>
                    <li>在360搜索中查找“<a href={"https://www.so.com/s?ie=utf-8&q=" + value2 + "&src=tab_map"}
                                     target="_blank">{value2}</a>”
                    </li>
                    <li>在360地图“<a href="http://info.so.com/map_add_pos.html" target="_blank">添加地址</a>”</li>
                </ul>

                <div style={style.bottom}>360地图提醒您：结果有错误？请到<a href="http://info.so.com//map_suggest.html"
                                                              target="_blank">反馈中心</a>反馈问题。
                </div>

            </div>
        )
    }
}

NearbyPOIFeedback.propTypes = {
    keyword: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
}


let style = {
    fontWeight: {
        fontWeight: "bold",
        color: "#666",
    },

    content: {
        fontSize: "14px",
        margin: "10px 28px",
        color: "#9c9b96"
    },

    bottom: {
        marginTop: 10,
        color: "#0dbf57",
        padding: "16px 0",
        borderTop: "1px solid #ededed"
    },

    wendaInput: {
        border: "1px solid #ccc",
        height: 22,
        lineHeight: "22px",
        padding: 3,
        width: "100%"
    },
    wendaBtn: {
        background: "#FCFCFC",
        border: "1px solid #BFBFBF",
        cursor: "pointer",
        height: 25,
        width: 70,
        marginTop: 5
    }
}



