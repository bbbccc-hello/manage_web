import React, {Component} from 'react';
import { Layout, Icon ,message, Button } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import store, {CONSTANT} from '../reducer/reducer';
import HeaderTopBox from './HeaderTopBox';
import IndexBox from './IndexBox';
import WarningBox from './WarningBox';
import HistoryRecoder from './HistoryRecoder'
import AccountManage from './AccountManage'
import DeviceStatusManage from './DeviceStatusManage'
import PowerManage from './PowerManage'
import '../static/login.scss'
import UserSearch from './UserSearch'
import ComplaintAdevice from "./ComplaintAdevice";
import DeviceAddress from "./DeviceAddress";
import Eml from "./Eml";
let state = store.getState();
store.subscribe(function () {
    state = store.getState();
    // console.log(store.getState())
});

class HomeLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {menu: '首页'};
    }

    componentDidMount() {
        let userInfo = state.homeState.userInfo;
        console.log(userInfo,"将用户信息打印出来.");
        if(!userInfo.id){
            location.replace('#/');
        }
    }
    setMenu(value){
        this.setState({menu:value});
    }
    render() {
        return (
            <Layout>
                <Header style={{backgroundColor: '#005198', padding: 0, borderBottom: '1px solid #ececec'}}>
                    {state.homeState.userInfo.id && <HeaderTopBox setMenu={this.setMenu.bind(this)}></HeaderTopBox>}
                </Header>

                <Layout style={{backgroundColor:'#fff'}}>
                    {!(this.state.menu=="首页"||this.state.menu=="设备维修记录")&&<Sider style={{backgroundColor:'#fff'}}>
                        <div>
                           <UserSearch/>
                        </div>
                    </Sider>}
                    <Content style={{ margin: '24px 16px 0' }}>
                        {/*{this.state.menu ==='首页' && <App/>}*/}
                        {this.state.menu === '首页' && <IndexBox></IndexBox>}
                        {this.state.menu === '报警信息' && <WarningBox></WarningBox>}
                        {this.state.menu === '历史记录' && <HistoryRecoder/>}
                        {this.state.menu === '账号管理' && <AccountManage/>}
                        {this.state.menu === '设备状态管理' && <DeviceStatusManage/>}
                        {this.state.menu === '投诉建议管理' && <ComplaintAdevice/>}
                        {this.state.menu === '设备地址管理' && <DeviceAddress/>}
                        {this.state.menu === '权限管理' && <PowerManage/>}
                        {this.state.menu === '设备维修记录' && <Eml/>}
                    </Content>

                </Layout>
                <Footer>
                </Footer>
            </Layout>
        );
    }
}

export default HomeLayout;

// 系统屏幕尺寸（宽高）
const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

window.onload = function () {

};