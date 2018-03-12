import React,{ Component } from 'react';
import store, {CONSTANT} from "../reducer/reducer";
let state = store.getState();
import {Pagination,Button} from 'antd';
import {
     historyById, historyByUserName, historyByAddress, historyByTime
} from "../static/commonFunction";
import { generalApi } from '../static/apiInfo';
store.subscribe(function () {
    state = store.getState();
});
class HistoryRecoder extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            Id: "",
            current: 1,
            pageSize: 10,
            data: [],
            endResult: [],
            total:0,
        };
    }

    onChange = (page) => {
        store.dispatch({type:CONSTANT.CURRENTPAGE,val:page});
        const start=(page-1)*state.homeState.pageSize;
        const pageSize=state.homeState.pageSize;
        if(state.homeState.triggerSearch){
            if(state.homeState.searchKeyword instanceof Array){
                console.log('search by address');
                historyByAddress(start,pageSize,state.homeState.searchKeyword);
            }else if(!!parseInt(state.homeState.searchKeyword)){
                historyByUserName(start,pageSize,state.homeState.searchKeyword);
            }else{
                historyById(start,pageSize,state.homeState.searchKeyword);
            }
        }else{
            if(state.homeState.startTime){
                historyByTime(start,pageSize);
            }else {
                historyById(start,pageSize,null);
            }
        }
    };
    componentDidMount() {
        historyByAddress(0,state.homeState.pageSize,null);
    }
    getStartTime=(event)=>{
        store.dispatch({type: CONSTANT.STARTTIME, val: event.target.value});
        console.log(state.homeState.startTime,"开始时间")
    };
    getEndTime=(event)=>{
        store.dispatch({type: CONSTANT.ENDTIME, val: event.target.value});
        console.log(state.homeState.endTime,"结束时间")
    };
    queryByTime(){
        console.log(state.homeState.startTime);
        if(state.homeState.startTime){
            historyByTime(0,state.homeState.pageSize);
            store.dispatch({type:CONSTANT.TRIGGERSEARCH,val:false});
            store.dispatch({type:CONSTANT.CURRENTPAGE,val:1});
        }
    }
    render(){

        return (<div className="tableWrap">
            <div>开始时间:<input type="date" onChange={this.getStartTime}/>结束时间:<input type="date" onChange={this.getEndTime}/> <Button onClick={this.queryByTime}>查询</Button></div>
            <table className="mytable">
                <thead>
                <tr>
                    <td>用户地址</td>
                    <td>账号</td>
                    <td>设备ID编号</td>
                    <td>状态</td>
                    <td>状态时间</td>
                </tr>
                </thead>
                <tbody>{state.homeState.searchResult}</tbody>
            </table>
                <div className="emptyDiv"></div>
            <div><Pagination simple className="pagination" current={state.homeState.currentPage} onChange={this.onChange} pageSize={state.homeState.pageSize} total={typeof state.homeState.totalPage === 'number'?state.homeState.totalPage:1}/></div>
        </div>)

    }
}

export default HistoryRecoder;