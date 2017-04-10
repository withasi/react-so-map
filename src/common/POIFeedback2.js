/**
 * Created by siwangli on 2016/4/6.
 */
import React, {PropTypes} from 'react';
export default class POIFeedback2 extends React.Component {
    render() {
        let {keyword, list} = this.props;
        let city = "北京";
        let bShow = city == "全国" ? "none" : "";
        let fanwei = (<span>
                        <span style={style.fontWeight}>{city}</span>及
                        <span style={style.fontWeight}>全国</span>范围内没有找到相关的地点。
                    </span>);
        if (list && list.cond && list.cond.widely) {
            fanwei = <span><span style={style.fontWeight}>当前视野范围内</span>没有找到相关的地点。</span>
        }
        return (
            <div style={style.content}>
                <p><abc style={{display: bShow}}>在{fanwei}</abc></p>
                <form style={{marginTop: 10}} action="http://wenda.so.com/home/ask/" method="get" target="_blank">
                    <div>您可以在问答提问，让其他网友帮您解决问题：</div>
                    <div>
                        <input style={style.wendaInput} name="q" type="text" onChange={() => {
                        }}
                               value={"想知道：" + city + " " + keyword + " 在哪？"}/>
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
                    <li>在360搜索中查找“<a href={"https://www.so.com/s?ie=utf-8&q=" + keyword + "&src=tab_map"}
                                     target="_blank">{keyword}</a>”
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

POIFeedback2.propTypes = {
    keyword: PropTypes.string.isRequired
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



