import React,{ Component } from 'react';
import store, {CONSTANT} from "../reducer/reducer";
import {Pagination,Button} from 'antd';
import { generalApi } from '../static/apiInfo';
import {warningById, warningByUserName, warningByTime, warningByAddress} from '../static/commonFunction';

let state = store.getState();
store.subscribe(function () {
    state = store.getState();
});

class WarningBox extends React.Component{
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
            warningByTime(0,state.homeState.pageSize);
            store.dispatch({type:CONSTANT.TRIGGERSEARCH,val:false});
            store.dispatch({type:CONSTANT.CURRENTPAGE,val:1});
        }
    }
    onChange = (page) => {
        store.dispatch({type:CONSTANT.CURRENTPAGE,val:page});
        const start=(page-1)*state.homeState.pageSize;
        const pageSize=state.homeState.pageSize;
        if(state.homeState.triggerSearch){
            if(state.homeState.searchKeyword instanceof Array){
                console.log('search by address');
                warningByAddress(start,pageSize,state.homeState.searchKeyword);
            }else if(!!parseInt(state.homeState.searchKeyword)){
                warningByUserName(start,pageSize,state.homeState.searchKeyword);
            }else{
                warningById(start,pageSize,state.homeState.searchKeyword);
            }
        }else{
            if(state.homeState.startTime){
                warningByTime(start,pageSize);
            }else{
                warningByUserName(start,pageSize,null);
            }
        }
    };
    componentDidMount() {
        warningByAddress(0,state.homeState.pageSize,null);
    }
    render(){
        return (<div className="tableWrap">
            <div>开始时间:<input type="date" onChange={this.getStartTime} />结束时间:<input type="date" onChange={this.getEndTime}/>  <Button onClick={this.queryByTime}>查询</Button></div>
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
                {/*<tbody>{state.homeState.triggerSearch&&state.homeState.searchResult}</tbody>*/}
                <tbody>{state.homeState.searchResult}</tbody>
            </table>
            <div className="emptyDiv"></div>
            <div><Pagination simple className="pagination" current={state.homeState.currentPage} onChange={this.onChange} pageSize={state.homeState.pageSize} total={typeof state.homeState.totalPage === 'number'?state.homeState.totalPage:1}/></div>
        </div>)
    }
}

export default WarningBox;
