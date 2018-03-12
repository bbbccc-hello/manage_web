import React,{ Component } from 'react';
import store, {CONSTANT} from "../reducer/reducer";
import {Pagination} from 'antd';
import { accountByUserName, accountById, accountByAddress} from '../static/commonFunction';

let state = store.getState();
store.subscribe(function () {
    state = store.getState();
});
class AccountManage extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            total:0,
            pageSize:10,
            current: 1,
        };
    }
    onChange = (page) => {
        store.dispatch({type:CONSTANT.CURRENTPAGE,val:page});
        const start=(page-1)*state.homeState.pageSize;
        const pageSize = state.homeState.pageSize;
        // console.log(state.homeState.triggerSearch);
        if(state.homeState.triggerSearch){
            if(state.homeState.searchKeyword instanceof Array){
                console.log('search by address');
                accountByAddress(start,pageSize,state.homeState.searchKeyword);
            }else if(!!parseInt(state.homeState.searchKeyword)) {
                accountByUserName(start, pageSize, state.homeState.searchKeyword);
            }else{
                accountById(start, pageSize, state.homeState.searchKeyword);
            }
        }else{
            accountByUserName(start,pageSize,null);
        }
    };
    componentDidMount() {
        accountByAddress(0,state.homeState.pageSize,null);
    }
    render(){
        return   (<div className="tableWrap">
            <table className="mytable">
                <thead>
                <tr>
                    <td>用户地址</td>
                    <td>账号</td>
                    <td>密码</td>
                    <td>设备ID编号</td>
                    <td>删除操作</td>
                </tr>
                </thead>
                <tbody>{state.homeState.searchResult}</tbody>
            </table>
            <div className="emptyDiv"></div>
            <div><Pagination simple className="pagination" current={state.homeState.currentPage} onChange={this.onChange} pageSize={state.homeState.pageSize} total={typeof state.homeState.totalPage === 'number'?state.homeState.totalPage:1}/></div>
        </div>)
    }
}

export default AccountManage;