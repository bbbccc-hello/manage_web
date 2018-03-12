import React, {Component} from 'react';
import store, {CONSTANT} from "../reducer/reducer";
import { Button, Modal, Pagination, message} from 'antd';
import { generalApi } from '../static/apiInfo';
import {
    deleteDevice, getPagCount, deviceStatusByUserName,
    deviceStatusById, deviceStatusByAddress
} from '../static/commonFunction';

const confirm = Modal.confirm;
let state = store.getState();
store.subscribe(function () {
    state = store.getState();
});

// 设备状态管理
class DeviceStatusManage extends React.Component {
    constructor(props) {
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
                deviceStatusByAddress(start,pageSize,state.homeState.searchKeyword);
            }else if(!!parseInt(state.homeState.searchKeyword)){
                deviceStatusByUserName(start,pageSize,state.homeState.searchKeyword);
            }else{
                deviceStatusById(start,pageSize,state.homeState.searchKeyword);
            }
        }else{
            deviceStatusByUserName(start,pageSize,null);
        }
    };
    componentDidMount() {
        deviceStatusByAddress(0,state.homeState.pageSize,null);
    }
    render() {
        return (<div className="tableWrap">
            <table className="mytable">
                <thead>
                <tr>
                    <td>用户地址</td>
                    <td>账号</td>
                    <td>设备ID编号(可删除)</td>
                    <td>设备状态(开、关、离线、上线)</td>
                    <td>状态时间</td>
                </tr>
                </thead>
                {/*<tbody>{state.homeState.triggerSearch&&state.homeState.searchResult}</tbody>*/}
                {/*<tbody>{state.homeState.searchResult}</tbody>*/}
                <tbody>
                    {state.homeState.searchResult}
                </tbody>
            </table>
            <div className="emptyDiv"></div>
            <div><Pagination simple className="pagination" current={state.homeState.currentPage} onChange={this.onChange} pageSize={state.homeState.pageSize} total={typeof state.homeState.totalPage === 'number'?state.homeState.totalPage:1}/></div>
        </div>)
    }
}

export default DeviceStatusManage;