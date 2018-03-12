import React, {Component} from 'react';
import store, {CONSTANT} from "../reducer/reducer";
import { Button, message, Modal} from 'antd';
import { AreaSelect,AreaCascader } from 'react-area-linkage';
import { generalApi } from '../static/apiInfo';
import {
    deleteDevice, deleteComplaint, initPagination, warningById, historyById, historyByUserName,
    accountByUserName, accountById, complainAdviceByUsername, warningByAddress, historyByAddress, accountByAddress,
    deviceStatusByUserName, deviceAddrByUserName, deviceAddrById, deviceStatusById, warningByUserName,
    deviceStatusByAddress, deviceAddrByAddress, complainAdviceByAddress, powerManageByUserName, powerSubmit,
    powerShowModal, powerUserDelete
} from '../static/commonFunction';

let state = store.getState();
store.subscribe(function () {
    state = store.getState();
});
const confirm = Modal.confirm;

class UserSearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            village: "",
            address: [],
            community: "",
            detailAddress: "",
            province: "",
            city: "",
            county: "",
            account: "",
            data: "",
            endResult: ""
        };
    }

    //下面是设备地址里面的函数
    account = (event) => {
        this.setState({account: event.target.value});
        console.log(this.state.account)
    };
    province = (event) => {
        this.setState({province: event.target.value});
        console.log(this.state.province)
    };
    city = (event) => {
        this.setState({city: event.target.value});
        console.log(this.state.city)
    };
    county = (event) => {
        this.setState({county: event.target.value});
        console.log(this.state.county)
    };
    deviceAddressEditor = (event) => {
        const _this = this;
        let id = event.target.getAttribute('data-id');
        const content = <div className="DeviceADialog">
            <div><AreaCascader type='text' onChange={this.handleSelectedChange} level={1} size='large' /></div>
            <div><span style={{marginLeft:"14px",marginRight:"13px"}}>小区:</span><input type="text" onChange={this.communityChange}/></div>
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
                    fetch(generalApi+"?table=devicefullinfo&action=update&cond=Id="+id+"&Province="+_this.state.province+"&City="+_this.state.city+"&District="+_this.state.county+"&Area="+_this.state.community+"&DetailAddr="+_this.state.detailAddress+"",{
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
    //下面是投诉建议管理三个函数
    adviceEidtor = (event) => {
        const _this = this;

        console.log("确定", this.state.account);
        console.log(event.target.getAttribute('data-id'));
        const content = <div className="DeviceADialog">

            <div><label>回复内容:</label>
                <div><textarea rows="7" cols="47" onChange={this.reply} value={event.target.getAttribute('data-reply')}>
                    </textarea>
                </div>
            </div>

        </div>;
        if (state.homeState.userInfo.editAdvice) {
            confirm({
                content: content,
                iconType: "form",
                cancelText: '取消',
                okText: '确定',
                onOk() {
                    let args = 'account=' + _this.state.account + '&province=' + _this.state.province;
                    console.log("确定", args);
                    message.success('修改成功');
                },
                onCancel() {
                },
            });
        } else {
            message.warning('没有编辑建议权限');
        }

    };
    detailAdvice = (event) => {
        Modal.info({
            title: '详细内容',
            content: (
                <div>
                    {event.target.getAttribute('data-content')}
                </div>
            ),
            onOk() {
            },
            okText: "确定"
        });
        console.log("详细内容")
    };
    // 和设备地址点击编辑函数相同只是名字不同

    handleSelectedChange = (text) => {
        this.setState({address:text});
        //地址分成3级，用于设备地址管理，编辑地址时使用
        this.setState({province: text[0]});
        console.log(this.state.province);

        this.setState({city: text[1]});
        console.log(this.state.city);

        this.setState({county: text[2]});
        console.log(this.state.county);
    };
    communityChange = (event) => {
        this.setState({community: event.target.value});
    };
    detailAddress = (event) => {
        this.setState({detailAddress: event.target.value});
    };
    chooseAddress = (event) => {
        //清空选项
        this.setState({address:[],community:'',detailAddress:''});
        const _this = this;
        const content = <div className="DeviceADialog" style={{height: "132px"}}>
            <div>
                <AreaCascader type='all' onChange={this.handleSelectedChange} level={1} size='large'/>
            </div>
            <div>
                <span style={{marginLeft: "14px", marginRight: "13px"}}>小区:</span>
                <input type="text" onChange={this.communityChange}/>
            </div>
            <div><span>详细地址:</span><input type="text" onChange={this.detailAddress}/></div>
        </div>;
        // if(state.homeState.userInfo.editAddressName){
        if (true) {
            confirm({
                content: content,
                iconType: "form",
                cancelText: '取消',
                okText: '确定',
                width: "448px",
                style: {height: "500px"},
                onOk() {
                    store.dispatch({type: CONSTANT.TRIGGERSEARCH, val: true});
                    let address = [];
                    if(_this.state.address.length === 0){
                        address.push('');
                        address.push('');
                        address.push('');
                    }else if(_this.state.address.length === 1){
                        _this.state.address.map(function (item) {
                            // console.log(item[Object.keys(item)[0]]);
                            address.push(item[Object.keys(item)[0]])
                        });
                        address.push('');
                        address.push('');
                    }else if(_this.state.address.length === 2){
                        _this.state.address.map(function (item) {
                            // console.log(item[Object.keys(item)[0]]);
                            address.push(item[Object.keys(item)[0]])
                        });
                        address.push('');
                    }else if(_this.state.address.length === 3){
                        _this.state.address.map(function (item) {
                            // console.log(item[Object.keys(item)[0]]);
                            address.push(item[Object.keys(item)[0]])
                        });
                    }
                    address.push(_this.state.community);
                    address.push(_this.state.detailAddress);
                    _this.refs.keySearchAddress.value = address;
                    console.log(address);
                    store.dispatch({type:CONSTANT.SEARCHKEYWORD,val:address});
                    switch (state.homeState.clickContent){
                        case "报警信息":
                            warningByAddress(0,state.homeState.pageSize,address);
                            break;
                        case "历史记录":
                            historyByAddress(0,state.homeState.pageSize,address);
                            break;
                        case "账号管理":
                            accountByAddress(0,state.homeState.pageSize,address);
                            break;
                        case "设备状态管理":
                            deviceStatusByAddress(0,state.homeState.pageSize,address);
                            break;
                        case "投诉建议管理":
                            complainAdviceByAddress(0,state.homeState.pageSize,_this.detailAdvice,_this.adviceEidtor,address);
                            break;
                        case "设备地址管理":
                            deviceAddrByAddress(0,state.homeState.pageSize,_this.deviceAddressEditor,address);
                            break;
                    }
                },
                onCancel() {
                },
            });
        } else {
            message.warning('没有编辑地址名称权限');
        }

    };
    searchByUserName = () => {
        console.log('searchByUserName');
        initPagination();
        // const _this = this;
        // let mode = state.homeState.deviceAddressData;
        store.dispatch({type: CONSTANT.TRIGGERSEARCH, val: true});
        store.dispatch({type: CONSTANT.SEARCHRESULT, val: []});
        let value = this.refs.userNameInput.value;
        console.log(value);
        store.dispatch({type: CONSTANT.SEARCHKEYWORD, val: value});
        if (state.homeState.clickContent === "报警信息") {
            warningByUserName(0,state.homeState.pageSize,state.homeState.searchKeyword);
            console.log('报警信息');
        }
        if (state.homeState.clickContent === "历史记录") {
            console.log('历史记录');
            historyByUserName(0,state.homeState.pageSize,value);
        }
        if (state.homeState.clickContent === "设备状态管理") {
            store.dispatch({type: CONSTANT.STARTTIME, val: 1});
            deviceStatusByUserName(0,state.homeState.pageSize,value);
            console.log('设备状态管理');
        }
        if (state.homeState.clickContent === "投诉建议管理") {
            complainAdviceByUsername(0,state.homeState.pageSize,this.detailAdvice,this.adviceEidtor,value);
            console.log('投诉建议管理');
        }
        if (state.homeState.clickContent === "账号管理") {
            accountByUserName(0,state.homeState.pageSize,value);
        }
        if (state.homeState.clickContent === "设备地址管理") {
            deviceAddrByUserName(0,state.homeState.pageSize,this.deviceAddressEditor,value);
        }
        if (state.homeState.clickContent === "权限管理") {
            powerManageByUserName(0,state.homeState.pageSize,powerShowModal,powerSubmit,powerUserDelete,value);
        }
    };
    searchByDeviceId = () => {
        console.log('searchByDeviceId');
        initPagination();
        store.dispatch({type: CONSTANT.TRIGGERSEARCH, val: true});
        store.dispatch({type: CONSTANT.SEARCHRESULT, val: []});
        let value = this.refs.deviceIdInput.value;
        console.log(value);
        store.dispatch({type: CONSTANT.SEARCHKEYWORD, val: value});
        if (state.homeState.clickContent === "报警信息") {
            warningById(0,state.homeState.pageSize,value);
            console.log('报警信息');
        }
        if (state.homeState.clickContent === "历史记录") {
            console.log('历史记录');
            historyById(0,state.homeState.pageSize,value);
        }
        if (state.homeState.clickContent === "设备状态管理") {
            deviceStatusById(0,state.homeState.pageSize,value);
            console.log('设备状态管理');
        }
        if (state.homeState.clickContent === "设备地址管理") {
            deviceAddrById(0,state.homeState.pageSize,this.deviceAddressEditor,value);

        }
        if (state.homeState.clickContent === "账号管理") {
            accountById(0,state.homeState.pageSize,value);
        }
        if (state.homeState.clickContent === "投诉建议管理") {
            /*let args = "?action=get&table=DeviceLogs&cond=DeviceId=%22" + value + "%22";
            this.fetchFn(args,'OwnerId',false);
            console.log('投诉建议管理');*/

            const _this = this;
            let newState = [];
            fetch(generalApi+"?action=get&table=devicefullinfo&cond=DeviceId=%22" + value + "%22")
            // fetch('?action=get&table=Feedback')
                .then((res) => {
                    // console.log(res.status, 11);
                    return res.json()
                })
                .then((data) => {
                    _this.setState({
                        data: data.data
                    });
                    console.log(this.state.data, "66666666666666");
                    _this.state.data.map(function (item) {
                        fetch(generalApi+"?action=get&table=Feedback&cond=uid=" + item.OwnerId + "")
                            .then((res) => {
                                console.log(res.status, 11);
                                return res.json()
                            })
                            .then((data) => {

                                let itemTmp = item;
                                console.log(data.data,data.data[0]);
                                if(data.data.length>0){
                                    for(let i=0;i<data.data.length;i++){
                                        itemTmp.a = data.data[i];
                                        console.log( itemTmp.a," itemTmp.a");
                                        console.log(itemTmp,"itemTmp11");
                                        newState.push( JSON.parse(JSON.stringify(itemTmp)));
                                    }
                                }else{
                                    itemTmp.a = data.data[0];
                                    newState.push(itemTmp);
                                }


                                // console.log(newState)

                            })
                            .then(() => {
                                _this.setState({
                                    endResult: newState
                                });
                                console.log(_this.state.endResult, "新的新的");
                                store.dispatch({
                                    type: CONSTANT.SEARCHRESULT, val: _this.state.endResult.map(function (name) {

                                        let address = name.Province + name.City + name.District + name.Area + name.DetailAddr + ""
                                        if (address == "NaN" || address == "undefined" || address == "0") {
                                            address = ""
                                        }

                                        return (
                                            <tr key={name.Id}>
                                                <td>{address}</td>
                                                <td>{name.UserName}</td>
                                                <td>{name.DeviceId}</td>
                                                <td><span className="ellipsis">{name.a.Content}</span><Button
                                                    data-content={name.a.Content} onClick={_this.detailAdvice}
                                                >详细</Button></td>
                                                <td>{name.a.SentAt}</td>
                                                <td><span className="ellipsis">{name.a.ReplyContent}</span><Button
                                                    data-content={name.a.ReplyContent} onClick={_this.detailAdvice}
                                                >详细</Button><Button
                                                    data-reply={name.ReplyContent} data-id={name.a.Id}
                                                    onClick={_this.adviceEidtor}>编辑</Button>
                                                </td>
                                                <td>{name.a.ReplyAt}</td>
                                                <td><Button data-id={name.Id}>删除</Button></td>
                                            </tr>
                                        )
                                    })
                                });
                            })
                            .catch((e) => {
                                console.log(e.message, 33)
                            })

                    })

                })
                .catch((e) => {
                    console.log(e.message, 33)
                })
        }
    };
    componentDidMount() {
    }

    render() {
        return (<div className="searchBorderWrap">
            <div>
                <input type="text" placeholder="搜索账号" className="searchBorder" ref="userNameInput"/>
                <img src="./images/search.png" className="search" alt="" onClick={this.searchByUserName}/>
            </div>
            {state.homeState.clickContent !== "投诉建议管理" && state.homeState.clickContent !== "权限管理" &&
            <div>
                <input type="text" placeholder="搜索设备编码" className="searchBorder" ref="deviceIdInput"/>
                <img src="./images/search.png" className="search" alt="" onClick={this.searchByDeviceId}/>
            </div>}
            {state.homeState.clickContent !== "权限管理" &&
            <div>
                <input type="text" placeholder="搜索用户地址" className="searchBorder" ref="keySearchAddress" onClick={this.chooseAddress}/>
            </div>}
        </div>)
    }
}

export default UserSearch;