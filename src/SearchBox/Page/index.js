/**
 * Created by wangchao3-pd on 2016/3/30.
 */
import React ,{Component} from 'react';
import styles from './index.less';
export default class Page extends Component {
    constructor() {
        super();
        this.clickHandler = this.clickHandler.bind(this);
    }

    clickHandler(e) {
        let pn = e.target.getAttribute("data-pn");
        let q = this.props.queryTempParam;
        this.props.onFlipOver(Object.assign(q, {batch: pn}));
    }

    getPage() {
        let totalCount = parseInt(this.props.totalCount);
        let curPage = parseInt(this.props.curPage);
        let pageSize = parseInt(this.props.pageSize);
        let totalPage = Math.ceil(totalCount / pageSize);
        if(totalPage==1)return null;

        let prePageNum = 2;
        let nxtPageNum = 2;
        let startPage = curPage - prePageNum;
        let endPage = curPage + nxtPageNum;
        if (curPage <= prePageNum) {
            endPage += prePageNum - curPage + 1;
        }
        if ((totalPage - curPage) <= nxtPageNum) {
            startPage -= nxtPageNum - (totalPage - curPage);
        }
        if (startPage <= 0) {
            startPage = 1;
        }

        if (endPage >= totalPage) {
            endPage = totalPage;
        }
        let arr = [];
        let firstDisplay = curPage != 1 ? true : false;
        let lastDisplay = curPage != totalPage ? true : false;
        let firstStyle = firstDisplay ? {display: 'inline-block'} : {display: 'none'};
        let lastStyle = lastDisplay ? {display: 'inline-block'} : {display: 'none'};
        for (var i = startPage; i <= endPage; i++) {
            if (curPage == i) {
                arr.push(<span key={i} className={styles.curPage}>{curPage}</span>);
            } else {
                arr.push(<span key={i}><a data-pn={i} href="javascript:" onClick={this.clickHandler}>{i}</a></span>);
            }
        }
        return (
            <div className={styles.pagination}>
                <span style={firstStyle}><a data-pn="1" href="javascript:" onClick={this.clickHandler}>首页</a></span>
                <span style={firstStyle}><a data-pn={curPage-1} href="javascript:"
                                            onClick={this.clickHandler}>上一页</a></span>
                {arr}
                <span style={lastStyle}><a data-pn={curPage+1} href="javascript:"
                                           onClick={this.clickHandler}>下一页</a></span>

            </div>
        )
    }

    render() {
        return this.getPage();
    }
}