/**
 * Created by siwangli on 2015/12/30.
 */
import React from 'react';
import SuggestItem from './suggestitem';

export default class SearchSuggest extends React.Component {
    constructor(...data) {
        super();
        let dt = data[0];
        this.map = dt.map;
    }

    render() {

        let display = this.props.currentCard == "suggest"? {display:"block"} : {display:"none"};
        let poi = this.props.suggestData.poi || [];
        return (
            <div style={display} className="card-content">
                <ul type="none" className="suggest">
                {
                    poi.map((item)=>{
                        return(
                            <SuggestItem data={this.props} key={Math.random()} item ={item} className="item" />
                        )
                    })
                }
                </ul>
            </div>
        );
    }
}

