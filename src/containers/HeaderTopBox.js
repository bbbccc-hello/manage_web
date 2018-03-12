import React, { Component } from 'react';
import store, {CONSTANT} from "../reducer/reducer";
import { initPagination } from "../static/commonFunction";
let state = store.getState();
store.subscribe(function () {
    state = store.getState();
    // console.log(store.getState())
});
class HeaderTopBox extends React.Component{
    constructor(props){
        super(props);
        this.state={
            color:"white",
            userName:""
        };
        // this.editor=null;
        this.handleClick = this.handleClick.bind(this)
    }
    componentDidMount() {
        let data = state.homeState.userInfo;
        this.setState({userName:data.name});
        // console.log(data,"将用户信息打印出来")
    }
    handleClick=(event)=>{
        store.dispatch({type: CONSTANT.TRIGGERSEARCH, val:false});
        let clickObject=event.target.parentNode.childNodes;
        for (let i=0;i<clickObject.length;i++)
        {
            {
                clickObject.item(i).style.color="white"
            }
        }
        event.target.style.color="#19a97b";
        let clickContent=event.target.innerText;
        if(clickContent.length<10){
            this.props.setMenu(clickContent);
            store.dispatch({type:CONSTANT.CLICKCONTENT,val:clickContent});
            if(state.homeState.clickContent === clickContent){
                initPagination();
                store.dispatch({type:CONSTANT.SEARCHRESULT,val:[]});
                store.dispatch({type:CONSTANT.TRIGGERSEARCH,val:false});
                store.dispatch({type:CONSTANT.STARTTIME,val:""});
                store.dispatch({type:CONSTANT.ENDTIME,val:""});
            }
        }
    };
    render(){
        return (<div>
            <div className="headTitle" ref="dd">泰燃智能家居后台管理系统<div className="loginDetail">登录名:<span >{state.homeState.userInfo.name}</span></div></div>
            <div className="menu" onClick={e=>this.handleClick(e)}>
                <div>首页</div>
                <div>报警信息</div>
                <div>历史记录</div>
                <div>账号管理</div>
                <div>设备状态管理</div>
                <div>投诉建议管理</div>
                <div>设备地址管理</div>
                {state.homeState.userInfo.superuser === '1' && <div>权限管理</div>}
                {state.homeState.userInfo.superuser === '1' && <div>设备维修记录</div>}
            </div>
        </div>)
    }
}

export default HeaderTopBox;