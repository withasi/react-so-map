/**
 * Created by wangchao3-pd on 2016/3/25.
 */
import React,{Component} from 'react';
import Default from '../Default/index';
export default class SearchListItem extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return <Default poi = {this.props.poi || []} {...this.props}/> ;
    }
}