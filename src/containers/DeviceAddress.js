import React, {Component} from 'react';
import { Button, message, Modal,Select,Pagination} from 'antd';
import { generalApi } from "../static/apiInfo";
import {getPagCount, deviceAddrByUserName, deviceAddrById, deviceAddrByAddress} from "../static/commonFunction";
import store, {CONSTANT} from "../reducer/reducer";
import {AreaSelect,AreaCascader} from 'react-area-linkage'
const Option = Select.Option;
const confirm = Modal.confirm;

let state = store.getState();
store.subscribe(function () {
    state = store.getState();
    // console.log(state.homeState)
});
let mode = state.homeState.deviceAddressData;

class DeviceAddress extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            total:1,
            pageSize:10,
            current: 1,
            lists: '',
            data: "",
            account: "",
            province: "",
            city: "",
            county: "",
            village: "",
            detailAddress:"",
            Id:""
        };
        // this.deviceAddressDelete = this.deviceAddressDelete.bind(this)
    }


    account = (event) => {
        this.setState({account: event.target.value});
        console.log(this.state.account)
    };
    province = (event) => {
        this.setState({province: event.target.value});
        // console.log(this.state.province)
    };
    city= (event) => {
        this.setState({city: event.target.value});
        // console.log(this.state.city)
    };
    county= (event) => {
        this.setState({county: event.target.value});
        // console.log(this.state.county)
    };
    village= (event) => {
        this.setState({village: event.target.value});
        // console.log(this.state.village)
    };
    detailAddress= (event) => {
        this.setState({detailAddress: event.target.value});
        // console.log(this.state.detailAddress)
    };
    deviceAddressEditor = (event) => {
        const _this = this;
        let id = event.target.getAttribute('data-id');
        const content = <div className="DeviceADialog">
                <div><AreaCascader type='text' onChange={this.handleSelectedChange} level={1} size='large' /></div>
            <div><span style={{marginLeft:"14px",marginRight:"13px"}}>小区:</span><input type="text" onChange={this.village}/></div>
            <div><span>详细地址:</span><input type="text"  onChange={this.detailAddress}/></div>
        </div>;
        if(true){
            confirm({
                content: content,
                iconType: "form",
                cancelText:'取消',
                okText:'确定',
                onOk() {
                    console.log(_this.state);
                    fetch(generalApi+"?table=devicefullinfo&action=update&cond=Id="+id+"&Province="+_this.state.province+"&City="+_this.state.city+"&District="+_this.state.county+"&Area="+_this.state.village+"&DetailAddr="+_this.state.detailAddress+"",{
                    }).then((response) => {console.log(response);return response.json()})
                        .then(data=>{
                            console.log(data);
                            if(data.status === 'ok'){
                                message.success('编辑成功');
                                let start = state.homeState.currentPage,
                                    pageSize = state.homeState.pageSize;
                                if(state.homeState.triggerSearch){
                                    if(state.homeState.searchKeyword instanceof Array){
                                        console.log('search by address');
                                        deviceAddrByAddress(start,pageSize,this.deviceAddressEditor,state.homeState.searchKeyword);
                                    }else if(!!parseInt(state.homeState.searchKeyword)) {
                                        deviceAddrByUserName(start, pageSize, this.deviceAddressEditor, state.homeState.searchKeyword);
                                    }else{
                                        deviceAddrById(start, pageSize, this.deviceAddressEditor, state.homeState.searchKeyword);
                                    }
                                }else{
                                    deviceAddrByUserName(start,pageSize,this.deviceAddressEditor,null);
                                }
                            }else {
                                message.error('编辑失败');
                            }
                        }).catch(err=>console.log(err))
                },
                onCancel() {
                },
            });
        }else {
            message.warning('没有编辑地址名称权限');
        }
    };

    componentDidMount() {
        deviceAddrByAddress(0,state.homeState.pageSize,this.deviceAddressEditor,null);
    }
    onChange = (page) => {
        store.dispatch({type:CONSTANT.CURRENTPAGE,val:page});
        const start=(page-1)*state.homeState.pageSize;
        const pageSize=state.homeState.pageSize;
        if(state.homeState.triggerSearch){
            if(state.homeState.searchKeyword instanceof Array){
                console.log('search by address');
                deviceAddrByAddress(start,pageSize,this.deviceAddressEditor,state.homeState.searchKeyword);
            }else if(!!parseInt(state.homeState.searchKeyword)) {
                deviceAddrByUserName(start, pageSize, this.deviceAddressEditor, state.homeState.searchKeyword);
            }else{
                deviceAddrById(start, pageSize, this.deviceAddressEditor, state.homeState.searchKeyword);
            }
        }else{
            deviceAddrByUserName(start,pageSize,this.deviceAddressEditor,null);
        }
    };
    handleSelectedChange=(text)=>{

            this.setState({province: text[0]});
            console.log(this.state.province);

            this.setState({city: text[1]});
            console.log(this.state.city);

            this.setState({county: text[2]});
            console.log(this.state.county);

        console.log(text,text[0])
    };

    render() {
        // console.log("device3", state.homeState.searchResult, typeof(state.homeState.searchResult))
        return (
            <div className="tableWrap">
                {/*<Button type="primary" className="addData" onClick={this.showAdd}>增加数据</Button>*/}
                <div className="table-container">
                    <table className="mytable">
                        <thead>
                        <tr>
                            <td>账号</td>
                            <td>设备ID编号</td>
                            <td>旧地址</td>
                            <td>设备地址(省)</td>
                            <td>设备地址(市)</td>
                            <td>设备地址(区/县)</td>
                            <td>设备地址(小区)</td>
                            <td>详细地址</td>
                            <td>操作</td>
                        </tr>
                        </thead>
                        <tbody>
                        {/*{state.homeState.triggerSearch&&state.homeState.searchResult}*/}
                       {state.homeState.searchResult}
                        </tbody>

                    </table>
                    {/*加了simple，和去掉simple*/}
                    <div className="emptyDiv"></div>
                    <div><Pagination simple className="pagination" current={state.homeState.currentPage} onChange={this.onChange} pageSize={state.homeState.pageSize} total={typeof state.homeState.totalPage === 'number'?state.homeState.totalPage:1}/></div>
                </div>


            </div>)
    }
}

export default DeviceAddress;