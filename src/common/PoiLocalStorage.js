/**
 * poi localStorage
 * Created by siwangli on 2016/7/10.
 */
export function setLocalStorage(keyword, pguid, len = 8, x, y) {
    if (window.localStorage) {
        let preList = window.localStorage.getItem("poiList");
        let temp = [];
        if (preList) {
            temp = JSON.parse(preList);
            if (temp.length >= len) {
                temp.pop();
            }
        }

        temp.forEach((item, index) => {
            "use strict";
            if (item.keyword == keyword || item.name == keyword) {
                temp.splice(index, 1);
                return;
            }
        });

        temp.unshift({keyword, name: keyword, pguid, x, y});
        window.localStorage.setItem("poiList", JSON.stringify(temp));
    }
}

export function getHistory(len) {
    let list = [];
    if (window.localStorage) {
        let poilist = localStorage.getItem("poiList");
        if (poilist) {
            list = JSON.parse(poilist);
        }
    }
    if (len) {
        list = list.slice(0, len);
    }
    return list
}

export function delOneHistory(index) {

    let list = [];

    if (window.localStorage) {
        list = getHistory(8);
        if (list.length === 1) {
            clearHistory();
        } else {
            if (index <= list.length - 1) {
                list.splice(index, 1);
                window.localStorage.setItem("poiList", JSON.stringify(list));
            }
        }
    }
    return list;
}

export function clearHistory() {
    if (window.localStorage) {
        localStorage.removeItem("poiList");
    }
}
