import React, {Component} from 'react';
import {Select, Icon, Pagination, Button, Checkbox, message, Row, Col, Modal, Radio} from 'antd';
import store, {CONSTANT} from "../reducer/reducer";
import {AreaSelect, AreaCascader} from 'react-area-linkage';
import {
    powerUserDelete, deleteUserAccount, powerSubmit, powerManageByUserName, powerShowModal
} from '../static/commonFunction';

const confirm = Modal.confirm;
let state = store.getState();
store.subscribe(function () {
    state = store.getState();
});

class PowerManage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lists: '',
            address: '',
            village: '',
            viewAdvice: false,
            editAdvice: false,
            editAddressName: false,
            deleteUserAccount: false,
            viewPassword: false,
            deleteDevice: false,
            viewFix: false,
            visible: false,
            viewRange:[],
            total:0,
            pageSize:8,
            current: 1,
        };
        this.onChange = this.onChange.bind(this);
    }
    handleOk = (e) => {
        store.dispatch({type:CONSTANT.VIEWMODAL,val:false});
    };
    handleCancel = (e) => {
        store.dispatch({type:CONSTANT.VIEWMODAL,val:false});
    };
    addViewAddressRange = (event) => {
        console.log(event.target);
        let userInfo = state.homeState.userInfo;
        let viewRange = userInfo.viewRange;
        let address = this.state.address;
        let village = this.state.village;
        let isExist = false;
        if(!address){
            message.info('请重新选择地址!');
            return;
        }
        if(village.indexOf(',') !== -1 || village.indexOf('，') !== -1){
            message.info('小区名不能带‘,’');
            return;
        }
        if(village){
            address += '、'+village;
        }
        //如果是重复地址，则不再添加
        viewRange && viewRange.split(',').map(function (item) {
            if(item === address){
                isExist = true;
            }
        });
        if(isExist){
            message.info('此地址已添加，请勿重复添加');
            return;
        }
        //更新本地的state
        let vr = state.homeState.localViewRange;
        vr.push(address);
        this.setState({viewRange:vr});
        if(viewRange){
            viewRange += ','+address;
        }else{
            viewRange = address;
        }
        // this.setState({viewRange:viewRange});
        userInfo.viewRange = viewRange;
        console.log(viewRange);
        store.dispatch({type:CONSTANT.USERINFO,val:userInfo});
    };
    deleteViewAddressRange = (e) =>{
        console.log(e.target.parentNode.getAttribute('data-address'));
        message.info('暂时还不能删除');
    };
    handleSelectedChange=(text)=> {
        let address = '';
        if (text instanceof Array) {
            text.map(function (item) {
                address += item+'、';
            })
        }
        address = address.substring(0,address.length-1);
        console.log(address);
        this.setState({address: address});
    };
    handleVillageChange=(e)=>{
        this.setState({village:e.target.value});
    };
    onChange(page){
        store.dispatch({type:CONSTANT.CURRENTPAGE,val:page});
        const start=(page-1)*state.homeState.pageSize;
        const pageSize=state.homeState.pageSize;
        if(state.homeState.triggerSearch){
            powerManageByUserName(start,pageSize,powerShowModal,powerSubmit,powerUserDelete,state.homeState.searchKeyword);
        }else{
            powerManageByUserName(start,pageSize,powerShowModal,powerSubmit,powerUserDelete,null);
        }
    }
    componentDidMount() {
        powerManageByUserName(0,state.homeState.pageSize,powerShowModal,powerSubmit,powerUserDelete,null);
    }

    render() {
        const _this = this;
        return (<div className="tableWrap">
            <Modal
                title="用户查看地址范围设置"
                visible={state.homeState.viewModal}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                footer={null}
            ><Row>
                <Col span={8} className="addressModal">
                    <div className="third">
                        <div><AreaCascader type='text' onChange={this.handleSelectedChange} level={1} size='large' /></div>
                    </div>
                    <div className="modalVillage"><input type="text" onChange={this.handleVillageChange}  placeholder="小区"/></div>
                    <div><Button style={{marginTop:"30px"}} onClick={(e)=>{this.addViewAddressRange(e)}}>添加</Button></div>
                </Col>
                <Col span={16} style={{paddingLeft:"10px"}}>
                    <div style={{marginLeft:"50px"}}>
                    {state.homeState.localViewRange.length !== 0 && state.homeState.localViewRange.map(function (name) {
                        // console.log(name);
                        if(name){
                            return <div key={name} data-address={name}>{name}<Button onClick={(e)=>{_this.deleteViewAddressRange(e)}}>删除</Button></div>
                        }
                    })}
                    </div>
                </Col>
            </Row>
            </Modal>
            <table className="mytable">
                <thead>
                <tr>
                    <td>用户名</td>
                    <td>密码</td>
                    <td>权限授权(勾选)
                        查看投诉建议
                        编辑投诉建议
                        编辑地址名称
                        删除用户账号
                        更改用户账号密码
                        删除设备
                    </td>
                    <td>删除用户</td>
                </tr>
                </thead>
                <tbody>{state.homeState.searchResult}</tbody>
            </table>
            <div className="emptyDiv"></div>
            <div><Pagination simple className="pagination" current={state.homeState.currentPage} onChange={this.onChange} pageSize={state.homeState.pageSize} total={typeof state.homeState.totalPage === 'number'?state.homeState.totalPage:1}/></div>
        </div>)

    }
}

export default PowerManage;