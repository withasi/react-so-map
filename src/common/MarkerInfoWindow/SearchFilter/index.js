/**
 * Created by wangchao3-pd on 2016/5/30.
 */
import React,{Component,PropTypes} from 'react';
import styles from './index.less';
const _liArr = ['到这里去', '从这里出发', '在附近找'];
export default class SearchFilter extends Component {
    renderLi(){
        const {currentIndex,toggleFilter} = this.props;
        return _liArr.map((li,index)=>{
            if(currentIndex==index){
                return <li className={styles.tab} style={{color:'#3295f0'}} key={index}>{li}</li>;
            }
            return <li className={styles.tab} onClick={()=>{toggleFilter(index)}} key={index}>{li}</li>;
        });
    }
    render(){
        return (
            <ul className={styles.ulTab}>
                {this.renderLi()}
            </ul>
        )
    }
}
SearchFilter.propTypes = {
    toggleFilter:PropTypes.func.isRequired,
    currentIndex:PropTypes.number.isRequired
};