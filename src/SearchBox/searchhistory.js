/**
 * Created by siwangli on 2015/12/30.
 */
import React from 'react';
import HomeCard from './homecard';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {getHistory, delOneHistory, clearHistory} from '../common/PoiLocalStorage';
import GgBox from '../ggBox/index';

export default class SearchHistory extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            refresh: !0
        }
    }

    componentDidMount() {
        /*//上下一定键盘，进行选中
         $(document).keydown((e)=>{
         switch (event.keyCode) {
         case 38:
         if(this.props.currentCard == "history" && e.target.className==this.props.inputClass){

         }
         break;
         case 40:
         if(this.props.currentCard == "history" && e.target.className==this.props.inputClass){

         }
         break;
         }

         })*/
    }

    mouseEnterHandler = (e) => {
        let cur = $(e.currentTarget);
        cur.css("background-color", "#eee");
        cur.find('span').css({"background-color": "#eee"});
    };

    mouseLeaveHandler = (e) => {
        let cur = $(e.currentTarget);
        cur.css("background-color", "");
        cur.find('span').css({"background-color": ""});
    };

    clickHandler = (e) => {
        let poi = JSON.parse(e.target.getAttribute("data-poi"));
        let {pguid, keyword} = poi;
        if(!pguid || this.props.searchCardType =="nearby"){
            this.props.currentViewSearchPoi({keyword, pguid});
        }else {
            this.props.searchByPGUID && this.props.searchByPGUID(pguid, keyword)
        }


    };

    delItem(index) {
        delOneHistory(index);
//			this.props.initState　&&　this.props.initState("history");
        this.setState({
            refresh: !this.state.refresh
        })
    }

    getHistoryContent() {
        let historys = getHistory(5);
        let that = this;
        if (historys.length > 0) {
            return (
                <div className="card-content card-history"
                     style={{'border': 0, 'boxShadow': 'none', 'borderTop': '1px solid #f1f0ed'}}>
                    <ul type="none" className="history">
                        {
                            historys.map((item, index) => {
                                if (item && item.keyword) {
                                    return (
                                        <li
                                            onMouseEnter={this.mouseEnterHandler} onMouseLeave={this.mouseLeaveHandler}
                                            key={index} className="item">
                                            <span style={{
                                                'position': 'absolute',
                                                'height': '40px',
                                                'width': '24px',
                                                'backgroundColor': '#fff',
                                                'left': '-24px',
                                                'top': '-1px'
                                            }}></span>
                                            <a data-poi={JSON.stringify(item)} onClick={this.clickHandler}
                                               href='javascript:;' className='keywordBtn'>{item.keyword}
                                            </a>
                                            <a href='javascript:;' className='delItemBtn'
                                               onClick={that.delItem.bind(that, index)}></a></li>
                                    )
                                }
                            })
                        }
                    </ul>
                    {/*<div className="clear-history" onMouseDown={this.clearHistory}>
                     <p>删除历史记录</p>
                     </div>*/}
                </div>
            )
        }
    }

    clearHistory = () => {
        clearHistory();
        this.props.initState && this.props.initState("none");
    };

    render() {
        return (
            <ReactCSSTransitionGroup transitionName="showpoilist" transitionEnterTimeout={500}
                                     transitionLeaveTimeout={500} transitionAppear={true}
                                     transitionAppearTimeout={500}>
                <div style={St}>
                    <HomeCard {...this.props}/>
                    {this.state.refresh ? this.getHistoryContent() : this.getHistoryContent()}
                    <GgBox boxType={'gsb'} {...this.props}/>
                </div>
            </ReactCSSTransitionGroup>
        )
    }
}
const St = {
    backgroundColor: '#fff',
    borderRadius: '2px',
    border: '1px solid #f1f0ed',
    boxShadow: '2px 2px 4px #aaa',
    marginTop: '10px'
}


module.exports = SearchHistory;
