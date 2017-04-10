/**
 * Created by siwangli on 2015/12/30.
 */
import React from 'react';
import SearchContent from './SearchContent/index';
import PoiSuggestService from './suggest/poisuggestservice';
import PoiSearchService from './poisearchservice';
import Autosuggest from 'react-autosuggest';
import MapUI from '../MapUI';

export default class SearchBox extends React.Component {
    constructor(data) {
        super(data);
        this.map = data.map;
        this.switchHandler = data.switchHandler;

        //搜索和路线规划的兴趣点都需要10个marker交互
        this.poiMarkers = getPoiMarkers(this.map, 10);

        this.state = {
            currentCard: "search", //none||home||history||suggest||content||detail
            currentMarker: null,//当前的marker
            suggestData: {poi: []},
            poi: [],//搜索真正的poi数据，此数据中包含地理坐标，名称，为真实poi点
            poiList: null,
            poiIndex: -1,
            value: '',
            suggestions: [],
            rightBtnCls: "nav", //nav|close
            isLoading: false
        };


        this.scrollHeight = $(window).height() - 175;//content内容区的高度
        this.searchPoi = this.searchPoi.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsUpdateRequested = this.onSuggestionsUpdateRequested.bind(this);
        this.onSelectedHandler = this.onSelectedHandler.bind(this);
        this.onFlipOver = this.onFlipOver.bind(this);
        this.showPoiDetail = this.showPoiDetail.bind(this);
        this.showPoiList = this.showPoiList.bind(this);
        this.initCurrentMarker = this.initCurrentMarker.bind(this);
        this.initPoiMarkers();

    }



    initPoiMarkers(){

    }


    componentDidMount() {
        let ipt = $(this.refs.searchcontainer).find(".react-autosuggest__input");
        let searchBtn = $(this.refs.searchbtn);

        //绑定输入框事件
        this.bindInputEvent(ipt, searchBtn);

        //绑定搜索按钮事件
        this.bindSearchBtnEvent(ipt, searchBtn)
    }

    componentWillUnmount(){
        this.clearPoiMarkers();
    }

    bindSearchBtnEvent(ipt, searchBtn) {
        searchBtn.on("click", ()=> {
            let keyword = ipt.val().trim();
            if (keyword) {
                this.searchPoi({keyword: keyword})

            }
        })
    }

    onFlipOver(poi) {
        this.searchPoi(poi);
    }

    bindInputEvent(ipt, searchBtn) {
        ipt.on("focus", ()=> {
            let keyword = ipt.val().trim();
            if (keyword) {
                this.setState({
                    currentCard: "suggest"
                });
            } else {
                this.setState({
                    currentCard: "history"
                });
            }
        });
        ipt.on("blur", ()=> {
            this.resetCardState();
        });
        ipt.keypress( (e)=> {
            var key = e.which;
            if (key == 13) {
                searchBtn.click()
            }
        });
    }

    /**
     * 将10个poi marker移除
     * */
    clearPoiMarkers = () => {
        this.map.removeOverlays("_favor_poi");
        this.poiMarkers.forEach(marker => {
            marker._mouseout_open = true;
            marker.emit("mouseout");
            marker._listItem = null;
            marker.setMap(null);
            marker.off('click');
        });
    };
    mouseEnterHandler(e) {
        var ky = $(this.refs.searchcontainer).find(".react-autosuggest__input").val().trim();
        if (this.state.currentCard == "none" && !ky) {
            this.setState({
                currentCard: "home"
            });
        }
    }

    mouseLeaveHandler(e) {
        if (this.state.currentCard == "home") {
            this.resetCardState();
        }
    }


    resetCardState() {
        if (this.state.currentCard != "content" && this.state.currentCard != "detail") {
            this.setState({
                currentCard: "none"
            });
        }

    }

    initState() {
        this.initPoiMarkers();

        this.setState({
            value: '',
            currentCard: "none",
            rightBtnCls: "nav"
        });
    }

    switchPanel() {
        if (this.state.rightBtnCls == "nav") {
            let type = this.props.currentCardType == "search" ? "direction" : "search";
            this.switchHandler(type);
        } else {
            this.initState();
        }
    }

    searchPoi(poi) {
        Object.assign(poi, {map: this.map});
        PoiSearchService.poiSearch(poi, (dt)=> {
            //console.log(dt)
            this.setState({
                poiList: dt,
                currentCard: "content"
            });
        })
    }

    onSelectedHandler(event, { suggestion, suggestionValue, method }) {
        this.searchPoi({keyword: suggestionValue})
    }

    onChange(event, { newValue }) {
        let currentCard = this.state.currentCard;
        if (this.state.currentCard != "suggest" && newValue.trim()) {
            currentCard = "suggest";
        }

        let rightBtnCls = this.state.rightBtnCls;
        //叉掉按钮和导航按钮切换
        if (newValue) {
            rightBtnCls = "close"
        } else {
            rightBtnCls = "nav"
        }

        this.setState({
            value: newValue,
            currentCard,
            rightBtnCls
        });
    }

    onSuggestionsUpdateRequested({ value }) {
        this.setState({
            isLoading: true
        });

        PoiSuggestService.suggestSearch(value, (dt)=> {
            const suggestions = dt.poi;
            if (value === this.state.value) {
                this.setState({
                    isLoading: false,
                    suggestions
                });
            } else { // Ignore suggestions if input value changed
                this.setState({
                    isLoading: false
                });
            }
        });
    }

    getCard() {
        if (this.state.currentCard == 'content') {
            return <SearchContent {...this.props} poiMarkers = {this.poiMarkers} scrollHeight={this.scrollHeight} poiList={this.state.poiList} onFlipOver={this.onFlipOver}
                                  showPoiDetail={this.showPoiDetail}/>
        }

        if (this.state.currentCard == 'suggest') {
            return ''
        }

    }

    showPoiDetail(poiIndex, currentMarker) {
        //回复marker的状态
        this.initCurrentMarker();

        this.setState({
            currentCard: 'detail',
            poiIndex,
            currentMarker
        })
    }

    showPoiList() {
        //回复marker的状态
        this.initCurrentMarker();
        this.setState({
            currentCard: 'content'
        })
    }

    initCurrentMarker(){
        let marker = this.state.currentMarker;
        if(marker){
            marker._mouseout_open = true;
            marker.emit("mouseout")
        }
    }

    render() {
        const { value, suggestions, isLoading, rightBtnCls } = this.state;
        const inputProps = {
            placeholder: "搜地点、查公交、找路线",
            value,
            onChange: this.onChange
        };
        const status = (isLoading ? 'Loading...' : 'Type to load suggestions');

        const btnTips = rightBtnCls == "nav" ? "导航" : "关闭";
        return (
            <div className="search-box" onMouseEnter={this.mouseEnterHandler.bind(this)}
                 onMouseLeave={this.mouseLeaveHandler.bind(this)}>
                <div ref="searchcontainer" className="search-container">
                    <div className="action-container">
                        <div ref="searchbtn" className="search">
                            搜索
                        </div>
                    </div>
                    <Autosuggest suggestions={suggestions}
                                 onSuggestionsUpdateRequested={this.onSuggestionsUpdateRequested}
                                 getSuggestionValue={getSuggestionValue}
                                 renderSuggestion={renderSuggestion}
                                 inputProps={inputProps}
                                 onSuggestionSelected={this.onSelectedHandler}
                    />
                </div>
                {this.getCard()}
            </div>
        );
    }
}


function getSuggestionValue(suggestion) {
    return suggestion.name;
}
function renderSuggestion(suggestion) {
    return (
        <span>{suggestion.name}</span>
    );
}

function getPoiMarkers(map, num) {
    let rt = [];
    for (let i = 0; i < num; i++) {
        let label = MapUI.getPoiMarker(map, i);
        rt.push(label);
    }
    return rt;
}


