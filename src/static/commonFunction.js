import React,{ Component } from 'react';
import {generalApi} from "./apiInfo";
import { message, Button, Modal, Checkbox } from "antd";
import store, { CONSTANT } from "../reducer/reducer";

let state = store.getState();
store.subscribe(function () {
    state = store.getState();
});

/**
 * 请求删除设备函数
 * */
function deleteDevice(deviceId) {
    fetch(generalApi+"?action=del&table=DeviceInfo&cond=DeviceId=%22"+deviceId+"%22") // 返回一个Promise对象
        .then((res)=>{
            return res.json() // res.text()是一个Promise对象
        })
        .then((data)=>{
            if (data.status === 'ok'){
                console.log('DeviceInfo删除成功');
                fetch(generalApi+"?action=del&table=AddressDevices&cond=DeviceId=%22"+deviceId+"%22") // 返回一个Promise对象
                    .then((res)=>{
                        return res.json() // res.text()是一个Promise对象
                    })
                    .then((data)=>{
                        console.log(data);
                        if (data.status === 'ok'){
                            console.log('AddressDevices删除成功');
                            fetch(generalApi+"?action=del&table=DeviceLogs&cond=DeviceId=%22"+deviceId+"%22") // 返回一个Promise对象
                                .then((res)=>{
                                    return res.json() // res.text()是一个Promise对象
                                })
                                .then((data)=>{
                                    console.log(data);
                                    if (data.status === 'ok'){
                                        console.log('DeviceLogs删除成功');
                                        message.info('删除成功');
                                    }else{
                                        console.error('DeviceLogs删除失败');
                                    }
                                })
                                .catch(e=>console.error(e));
                        }else{
                            console.error('AddressDevices删除失败');
                        }
                    })
                    .catch(e=>console.error(e));
            }else{
                console.error('DeviceInfo删除失败');
            }
        })
        .catch(e=>console.error(e));
}

/**
 * 请求删除投诉建议记录
 * */
function deleteComplaint(complainId) {
    fetch(generalApi+"?action=del&table=Feedback&cond=Id=%22"+complainId+"%22") // 返回一个Promise对象
        .then((res)=>{
            return res.json() // res.text()是一个Promise对象
        })
        .then((data)=>{
            console.log(data);
            if (data.status === 'ok'){
                console.log('Feedback删除成功');
                message.info('删除成功');
            }else{
                console.error('Feedback删除失败');
            }
        })
        .catch(e=>console.error(e));
}
/**
 * 删除确认投诉建议
 * */
function delConfirmComplain(e) {
    if(state.homeState.userInfo.editAdvice == 0){
        message.error('没有权限删除！');
        return;
    }
    let feedbackId = e.target.getAttribute('data-id');
    const content = "确定删除吗？";
    Modal.confirm({
        content: content,
        cancelText: '取消',
        okText: '确定',
        onOk() {
            deleteComplaint(feedbackId);
        },
        onCancel() {
        },
    });
}

/**
 * 投诉建议根据账号查找 By userName
 * */
function complainAdviceByUsername(start,pageSize,detailAdviceFn,adviceEidtorFn,userName) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }
    let newState = [];
    let args;
    if(userName){
        if(limitRange === '1'){
            args = "?action=get&table=devicefullinfo&cond="+ condViewRange +" and UserName=" + userName + "&limit=limit "+start+","+pageSize;
        }else{
            args = "?action=get&table=devicefullinfo&cond=UserName=" + userName + "&limit=limit "+start+","+pageSize;
        }
    }else{
        args = "?action=get&table=Feedback&limit=limit 0"+start+","+pageSize+"";
        getPagCount( "?action=count&table=Feedback");
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            console.log(data.data);
            let arg2;
            data.data.map(function (item) {
                if(userName){
                    arg2 = "?action=get&table=Feedback&cond=uid=" + item.OwnerId + "&limit=limit 0,1";
                    getPagCount( "?action=count&table=Feedback&cond=uid=" + item.OwnerId);
                    console.log('userName search');
                }else{
                    if(limitRange === '1'){
                        arg2 = "?action=get&table=devicefullinfo&cond="+ condViewRange +" and OwnerId=" + item.uid + "&limit=limit 0,1";
                    }else{
                        arg2 = "?action=get&table=devicefullinfo&cond=OwnerId=" + item.uid + "&limit=limit 0,1";
                    }
                }
                fetch(generalApi+arg2)
                    .then((res) => {
                        return res.json()
                    })
                    .then((data) => {
                        console.log(data.data);
                        let searchResult;
                        if(userName){
                            console.log(data);
                            console.log(item.UserName);
                            searchResult = data.data.map(function (name) {
                                let address=name.Province + name.City + name.District + name.Area + name.DetailAddr;
                                if(!address || address =='0'){
                                    address=""
                                }
                                return (
                                    <tr key={name.Id}>
                                        <td>{address}</td>
                                        <td>{item.UserName}</td>
                                        <td>
                                            <span className="ellipsis">{name.Content}</span>
                                            <Button type={'primary'} onClick={detailAdviceFn} data-content={name.Content}>详细</Button>
                                        </td>
                                        <td>{name.SentAt}</td>
                                        <td>
                                            <span className="ellipsis">{name.ReplyContent}</span>
                                            <Button type={'primary'} onClick={detailAdviceFn} data-content={name.ReplyContent}>详细</Button>
                                            <Button type={'primary'} data-reply={name.ReplyContent} data-id={name.Id} onClick={adviceEidtorFn}>编辑</Button>
                                        </td>
                                        <td>{name.ReplyAt}</td>
                                        <td><Button type={'danger'} data-id={name.Id} onClick={delConfirmComplain}>删除</Button></td>
                                    </tr>
                                )
                            })
                        }else{
                            let itemTmp = item;
                            itemTmp.a = data.data[0];
                            newState.push(itemTmp);
                            searchResult = newState.map(function (name) {
                                if (typeof(name.a) == "undefined") {
                                    name.a = {
                                        UserName: "",
                                        Province: "",
                                        City: "",
                                        District: "",
                                        Area: "",
                                        DeviceId: "",
                                        DetailAddr: ""
                                    }
                                } else {
                                    // console.log(name.a)
                                }
                                let address=name.a.Province + name.a.City + name.a.District + name.a.Area + name.DetailAddr+""
                                if(address=="NaN"||address=="undefined"){
                                    address=""
                                }
                                return (
                                    <tr key={name.Id}>
                                        <td>{address}</td>
                                        <td>{name.a.UserName}</td>
                                        <td><span className="ellipsis">{name.Content}</span>
                                            <Button  type={'primary'} onClick={detailAdviceFn} data-content={name.Content}>详细</Button>
                                        </td>
                                        <td>{name.SentAt}</td>
                                        <td><span className="ellipsis">{name.ReplyContent}</span>
                                            <Button type={'primary'} onClick={detailAdviceFn} data-content={name.ReplyContent}>详细</Button>
                                            <Button type={'primary'} data-reply={name.ReplyContent} data-id={name.Id} onClick={adviceEidtorFn}>编辑</Button>
                                        </td>
                                        <td>{name.ReplyAt}</td>
                                        <td><Button type={'danger'} data-id={name.Id} onClick={delConfirmComplain}>删除</Button></td>
                                    </tr>
                                )
                            });
                        }
                        store.dispatch({
                            type: CONSTANT.SEARCHRESULT, val:searchResult
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

/**
 * 投诉建议根据账号查找 By address
 * */
function complainAdviceByAddress(start,pageSize,detailAdviceFn,adviceEidtorFn,address) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }
    let condition;
    if(address && address.length > 0){
        condition = "(Province=%22"+address[0]+'%22 and City=%22'+address[1]+'%22 and District=%22'+address[2]+'%22 and Area=%22'+ address[3] +'%22 and DetailAddr=%22'+address[4]+"%22)";
    }
    let args;
    let newState = [];
    if(address){
        if(limitRange === '1') {
            if (condViewRange) {
                condition = condition + ' and ' + condViewRange;
            }
        }
        args = "?action=get&table=devicefullinfo&cond="+condition+"&limit=limit%200"+start+","+pageSize;
    }else{
        if(limitRange === '1'){
            if(condViewRange){
                args = "?action=get&table=devicefullinfo&cond="+condViewRange+"&limit=limit%200"+start+","+pageSize;
            }else{
                console.log('投诉建议限制范围为空');
                return;
            }
        }else {
            console.log('default');
            args = "?action=get&table=Feedback&limit=limit 0"+start+","+pageSize+"";
            getPagCount( "?action=count&table=Feedback");
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            console.log(data.data);
            let arg2;
            data.data.map(function (item) {
                if(address){
                    arg2 = "?action=get&table=Feedback&cond=uid=" + item.OwnerId + "&limit=limit 0,1";
                    getPagCount( "?action=count&table=Feedback&cond=uid=" + item.OwnerId);
                    console.log('userName search');
                }else{
                    if(limitRange === '1'){
                        arg2 = "?action=get&table=Feedback&cond=uid=" + item.OwnerId + "&limit=limit 0,1";
                    }else{
                        arg2 = "?action=get&table=devicefullinfo&cond=OwnerId=" + item.uid + "&limit=limit 0,1";
                    }
                }
                fetch(generalApi+arg2)
                    .then((res) => {
                        return res.json()
                    })
                    .then((data) => {
                        console.log(data.data);
                        let searchResult;
                        if(data.data.length === 0){
                            console.log('结果为0');
                            return ;
                        }else{
                            if(address){
                                console.log(data);
                                console.log(item.UserName);
                                searchResult = data.data.map(function (name) {
                                    let address=name.Province + name.City + name.District + name.Area + name.DetailAddr;
                                    if(!address || address =='0'){
                                        address=""
                                    }
                                    return (
                                        <tr key={name.Id}>
                                            <td>{address}</td>
                                            <td>{item.UserName}</td>
                                            <td><span className="ellipsis">{name.Content}</span><Button type={'primary'} onClick={detailAdviceFn} data-content={name.Content}
                                            >详细</Button></td>
                                            <td>{name.SentAt}</td>
                                            <td><span className="ellipsis">{name.ReplyContent}</span><Button type={'primary'} onClick={detailAdviceFn} data-content={name.ReplyContent}
                                            >详细</Button><Button type={'primary'}
                                                data-reply={name.ReplyContent} data-id={name.Id} onClick={adviceEidtorFn}>编辑</Button>
                                            </td>
                                            <td>{name.ReplyAt}</td>
                                            <td><Button type={'danger'} data-id={name.Id} onClick={delConfirmComplain}>删除</Button></td>
                                        </tr>
                                    )
                                })
                            }else{
                                let itemTmp = item;
                                itemTmp.a = data.data[0];
                                newState.push(itemTmp);
                                searchResult = newState.map(function (name) {
                                    if (typeof(name.a) == "undefined") {
                                        name.a = {
                                            UserName: "",
                                            Province: "",
                                            City: "",
                                            District: "",
                                            Area: "",
                                            DeviceId: "",
                                            DetailAddr: ""
                                        }
                                    } else {
                                        // console.log(name.a)
                                    }
                                    let address=name.a.Province + name.a.City + name.a.District + name.a.Area + name.DetailAddr+""
                                    if(address=="NaN"||address=="undefined"){
                                        address=""
                                    }
                                    return (
                                        <tr key={name.Id}>
                                            <td>{address}</td>
                                            <td>{name.a.UserName}</td>
                                            <td><span className="ellipsis">{name.Content}</span><Button type={'primary'} onClick={detailAdviceFn} data-content={name.Content}
                                            >详细</Button></td>
                                            <td>{name.SentAt}</td>
                                            <td><span className="ellipsis">{name.ReplyContent}</span><Button type={'primary'} onClick={detailAdviceFn} data-content={name.ReplyContent}
                                            >详细</Button><Button type={'primary'}
                                                data-reply={name.ReplyContent} data-id={name.Id} onClick={adviceEidtorFn}>编辑</Button>
                                            </td>
                                            <td>{name.ReplyAt}</td>
                                            <td><Button type={'danger'} data-id={name.Id} onClick={delConfirmComplain}>删除</Button></td>
                                        </tr>
                                    )
                                });
                            }
                        }
                        store.dispatch({
                            type: CONSTANT.SEARCHRESULT, val:searchResult
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

/**
 * 用于更新用户权限信息
 * */
function updateUserInfo(userInfo) {
    console.log(userInfo);
    let arg = '?action=update&table=UserInfo&cond=Id='+userInfo.id+ '&viewAdvice='+userInfo.viewAdvice
    + '&editAdvice='+userInfo.editAdvice + '&editAddressName='+userInfo.editAddressName
    + '&deleteUserAccount='+userInfo.deleteUserAccount + '&viewPassword='+userInfo.viewPassword + '&deleteDevice='+userInfo.deleteDevice
    + '&limitRange='+userInfo.limitRange+ '&viewRange='+userInfo.viewRange;
    if ('fetch' in window) {
        fetch(generalApi + arg)
            .then((response) => {
                return response.json()
            })
            .then(data => {
                console.log(data);
                if (data.status === 'ok') {
                    message.success('修改成功');
                } else {
                    message.error('修改失败');
                }
            })
            .catch(err => {
                console.error(err);
            });
    }
}

/**
 * 删除用户
 * */
function deleteUserAccount(userId) {
    let arg = '?action=del&table=UserInfo&cond=Id='+userId;
    if ('fetch' in window) {
        fetch(generalApi + arg)
            .then((response) => {
                return response.json()
            })
            .then(data => {
                console.log(data);
                if (data.status === 'ok') {
                    message.success('删除成功');
                } else {
                    message.error('删除失败');
                }
            })
            .catch(err => {
                console.error(err);
            });
    }
}

/**
 * 根据设备ID搜索警告信息
 * */
function warningByTime(start,pageSize) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let startTime = state.homeState.startTime;
    let endTime = state.homeState.endTime;
    let args;
    if(limitRange === '1'){
        getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+condViewRange +" and LogAt > %22" + startTime +"%22 and LogAt <= %22"+ endTime + "%22 and%20Log=%22alarm%22");
        args = "?action=get&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and LogAt > %22" + startTime +"%22 and LogAt <= %22"+ endTime + "%22 and%20Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
    }else{
        getPagCount("?action=count&table=DeviceFullInfoWithLog&cond=LogAt > %22" + startTime +"%22 and LogAt <= %22"+ endTime + "%22 and%20Log=%22alarm%22");
        args = "?action=get&table=DeviceFullInfoWithLog&cond=LogAt > %22" + startTime +"%22 and LogAt <= %22"+ endTime + "%22 and%20Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
    }
    fetch(generalApi+args)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            let searchResult = data.data.map(function (name) {
                let address = name.Province + name.City + name.District + name.Area + name.DetailAddr;
                if (address == "NaN" || address == "undefined" || address == '0') {
                    address = ""
                }
                return (
                    <tr key={name.LogId}>
                        <td>{address}</td>
                        <td>{name.UserName}</td>
                        <td>{name.DeviceId}</td>
                        <td style={{color:'red'}}>{name.Log}</td>
                        <td>{name.LogAt}</td>
                    </tr>
                )
            });
            store.dispatch({
                type: CONSTANT.SEARCHRESULT, val: searchResult
            });
        })
        .catch(e=>console.error(e))
}
/**
 * 根据设备ID搜索警告信息
 * */
function warningById(start,pageSize,deviceId) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(deviceId){
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and DeviceId=%22" + deviceId + "%22 and%20Log=%22alarm%22");
            args = "?action=get&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and DeviceId=%22" + deviceId + "%22 and%20Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
        }else{
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond=DeviceId=%22" + deviceId + "%22 and%20Log=%22alarm%22");
            args = "?action=get&table=DeviceFullInfoWithLog&cond=DeviceId=%22" + deviceId + "%22 and%20Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
        }
    }else{
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond=Log=%22alarm%22 and "+condViewRange);
            args = "?action=get&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
        }else{
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond=Log=%22alarm%22");
            args = "?action=get&table=DeviceFullInfoWithLog&cond=Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
        }
    }
    fetch(generalApi+args)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            let searchResult = data.data.map(function (name) {
                let address = name.Province + name.City + name.District + name.Area + name.DetailAddr;
                if (address == "NaN" || address == "undefined" || address == '0') {
                    address = ""
                }
                return (
                    <tr key={name.LogId}>
                        <td>{address}</td>
                        <td>{name.UserName}</td>
                        <td>{name.DeviceId}</td>
                        <td style={{color:'red'}}>{name.Log}</td>
                        <td>{name.LogAt}</td>
                    </tr>
                )
            });
            store.dispatch({
                type: CONSTANT.SEARCHRESULT, val: searchResult
            });
        })
        .catch(e=>console.error(e))
}

/**
 * 根据用户名称搜索警告信息
 * */
function warningByUserName(start,pageSize,userName) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(userName){
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and UserName=%22" + userName + "%22 and%20Log=%22alarm%22");
            args = "?action=get&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and UserName=%22" + userName + "%22 and%20Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
        }else{
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond=UserName=%22" + userName + "%22 and%20Log=%22alarm%22");
            args = "?action=get&table=DeviceFullInfoWithLog&cond=UserName=%22" + userName + "%22 and%20Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
        }
    }else{
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+condViewRange+" and Log=%22alarm%22");
            args = "?action=get&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
        }else{
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond=Log=%22alarm%22");
            args = "?action=get&table=DeviceFullInfoWithLog&cond=Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
        }
    }
    fetch(generalApi+args)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            let searchResult = data.data.map(function (name) {
                let address = name.Province + name.City + name.District + name.Area + name.DetailAddr;
                if (address == "NaN" || address == "undefined" || address == '0') {
                    address = ""
                }
                return (
                    <tr key={name.LogId}>
                        <td>{address}</td>
                        <td>{name.UserName}</td>
                        <td>{name.DeviceId}</td>
                        <td style={{color:'red'}}>{name.Log}</td>
                        <td>{name.LogAt}</td>
                    </tr>
                )
            });
            store.dispatch({
                type: CONSTANT.SEARCHRESULT, val: searchResult
            });
        })
        .catch(e=>console.error(e))
}
/**
 * 根据地址搜索警告信息
 * */
function warningByAddress(start,pageSize,address) {
    let limitRange = state.homeState.userInfo.limitRange;
    let condViewRange = getCondByViewRange();
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }
    let args;
    if(address){
        let condition = "(Province=%22"+address[0]+'%22 and City=%22'+address[1]+'%22 and District=%22'+address[2]+'%22 and Area=%22'+ address[3] +'%22 and DetailAddr=%22'+address[4]+"%22)";
        if(limitRange === '1'){
            if(condViewRange){
                condition = condition +' and '+condViewRange;
            }
        }
        getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+condition);
        args = "?action=get&table=DeviceFullInfoWithLog&cond="+condition+"&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
    }else{
        if(limitRange === '1'){
            if(!condViewRange){
                console.log('限制范围为空');
                return;
            }
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+condViewRange+" and Log=%22alarm%22");
            args = "?action=get&table=DeviceFullInfoWithLog&cond="+condViewRange+" and Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
        }else{
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond=Log=%22alarm%22");
            args = "?action=get&table=DeviceFullInfoWithLog&cond=Log=%22alarm%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
        }
    }
    fetch(generalApi+args)
        .then(res=>res.json())
        .then(data=>{
            console.log(data);
            let searchResult = data.data.map(function (name) {
                let address = name.Province + name.City + name.District + name.Area + name.DetailAddr;
                if (address == "NaN" || address == "undefined" || address == '0') {
                    address = ""
                }
                return (
                    <tr key={name.LogId}>
                        <td>{address}</td>
                        <td>{name.UserName}</td>
                        <td>{name.DeviceId}</td>
                        <td style={{color:'red'}}>{name.Log}</td>
                        <td>{name.LogAt}</td>
                    </tr>
                )
            });
            store.dispatch({
                type: CONSTANT.SEARCHRESULT, val: searchResult
            });
        })
        .catch(e=>console.error(e))
}

/**
 * 根据状态获取颜色
 * */
function getColor(log) {
    if(log === 'online'){
        return 'green';
    }else if(log === 'offline'){
        return 'black';
    }else if(log === 'alarm'){
        return 'red';
    }else{
        console.error('未知的状态');
        return 'black'
    }
}

/**
 * 根据时间搜索历史记录
 * */
function historyByTime(start,pageSize) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let startTime = state.homeState.startTime;
    let endTime = state.homeState.endTime;
    let args;
    if(limitRange === '1'){
        getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and LogAt > %22" + startTime +"%22 and LogAt <= %22"+ endTime + "%22");
        args = "?action=get&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and LogAt > %22" + startTime +"%22 and LogAt <= %22"+ endTime + "%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
    }else{
        getPagCount("?action=count&table=DeviceFullInfoWithLog&cond=LogAt > %22" + startTime +"%22 and LogAt <= %22"+ endTime + "%22");
        args = "?action=get&table=DeviceFullInfoWithLog&cond=LogAt > %22" + startTime +"%22 and LogAt <= %22"+ endTime + "%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
    }
    fetch(generalApi+args)
        .then((res) => {
            // console.log(res);
            return res.json()
        })
        .then((data) => {
            console.log(data.data);
            let devicelogs = data.data;
            let searchResult = devicelogs.map(function (item) {
                // console.log(item);
                let address;
                address = item.Province + item.City + item.District + item.Area + item.DetailAddr + "";
                if (address === "NaN" || address === "undefined" || address == '0') {
                    address = ""
                }
                return (
                    <tr key={item.LogId}>
                        <td>{address}</td>
                        <td>{item.UserName}</td>
                        <td>{item.DeviceId}</td>
                        <td style={{color:getColor(item.Log)}}>{item.Log}</td>
                        <td>{item.LogAt}</td>
                    </tr>
                )
            });
            store.dispatch({type: CONSTANT.SEARCHRESULT, val: searchResult});
        })
        .catch((e) => {
            console.error(e.message, 33)
        })
}


/**
 * 根据设备ID搜索历史记录
 * */
function historyById(start,pageSize,deviceId) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(deviceId){
        if(limitRange === '1'){
            args = "?action=get&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and DeviceId=%22" + deviceId + "%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and DeviceId=%22" + deviceId + "%22");
        }else {
            args = "?action=get&table=DeviceFullInfoWithLog&cond=DeviceId=%22" + deviceId + "%22&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond=DeviceId=%22" + deviceId + "%22");
        }
    }else{
        if(limitRange === '1'){
            args = "?action=get&table=DeviceFullInfoWithLog&cond="+ condViewRange +"&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+condViewRange);
        }else{
            args = "?action=get&table=DeviceFullInfoWithLog&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
            getPagCount("?action=count&table=DeviceFullInfoWithLog");
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            console.log(data.data);
            let devicelogs = data.data;
            let searchResult = devicelogs.map(function (item) {
                // console.log(item);
                let address;
                address = item.Province + item.City + item.District + item.Area + item.DetailAddr + "";
                if (address === "NaN" || address === "undefined" || address == '0') {
                    address = ""
                }
                return (
                    <tr key={item.LogId}>
                        <td>{address}</td>
                        <td>{item.UserName}</td>
                        <td>{item.DeviceId}</td>
                        <td style={{color:getColor(item.Log)}}>{item.Log}</td>
                        <td>{item.LogAt}</td>
                    </tr>
                )
            });
            store.dispatch({type: CONSTANT.SEARCHRESULT, val: searchResult});
        })
        .catch((e) => {
            console.error(e.message, 33)
        })
}

/**
 * 根据用户名称搜索历史记录
 * */
function historyByUserName(start,pageSize,userName) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    console.log(start,pageSize,userName);
    let args;
    if(userName){
        if(limitRange === '1'){
            args = "?action=get&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and UserName=" + userName +'&limit=limit%200'+start+','+pageSize+"&order=LogAt%20desc";
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+ condViewRange +" and UserName=" + userName);
        }else{
            args = "?action=get&table=DeviceFullInfoWithLog&cond=UserName=" + userName +'&limit=limit%200'+start+','+pageSize+"&order=LogAt%20desc";
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond=UserName=" + userName);
        }
    }else{
        if(limitRange === '1'){
            args = "?action=get&table=DeviceFullInfoWithLog&cond="+ condViewRange +"&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+condViewRange);
        }else{
            args = "?action=get&table=DeviceFullInfoWithLog&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
            getPagCount("?action=count&table=DeviceFullInfoWithLog");
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            // console.log(res);
            return res.json()
        })
        .then((data) => {
            console.log(data.data);
            let devicelogs = data.data;
            let searchResult = devicelogs.map(function (item) {
                // console.log(item);
                let address;
                address = item.Province + item.City + item.District + item.Area + item.DetailAddr + "";
                if (address === "NaN" || address === "undefined" || address == '0') {
                    address = ""
                }
                return (
                    <tr key={item.LogId}>
                        <td>{address}</td>
                        <td>{item.UserName}</td>
                        <td>{item.DeviceId}</td>
                        <td style={{color:getColor(item.Log)}}>{item.Log}</td>
                        <td>{item.LogAt}</td>
                    </tr>
                )
            });
            store.dispatch({type: CONSTANT.SEARCHRESULT, val: searchResult});
        })
        .catch((e) => {
            console.error(e.message, 33)
        })
}

/**
 * 根据用户名称搜索历史记录
 * */
function historyByAddress(start,pageSize,address) {
    let limitRange = state.homeState.userInfo.limitRange;
    let condViewRange = getCondByViewRange();
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(address){
        let condition = "(Province=%22"+address[0]+'%22 and City=%22'+address[1]+'%22 and District=%22'+address[2]+'%22 and Area=%22'+ address[3] +'%22 and DetailAddr=%22'+address[4]+"%22)";
        if(limitRange === '1'){
            if(condViewRange){
                condition = condition +' and '+condViewRange;
            }
        }
        args = "?action=get&table=DeviceFullInfoWithLog&Order=Id desc&cond="+condition+"&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
        getPagCount("?action=count&table=DeviceFullInfoWithLog&Order=Id desc&cond="+condition);
    }else{
        if(limitRange === '1'){
            if(!condViewRange){
                console.log('限制范围为空');
                return;
            }
            args = "?action=get&table=DeviceFullInfoWithLog&cond="+condViewRange+"&Order=Id desc&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
            getPagCount("?action=count&table=DeviceFullInfoWithLog&cond="+condViewRange);
        }else{
            args = "?action=get&table=DeviceFullInfoWithLog&Order=Id desc&limit=limit%200"+start+","+pageSize+"&order=LogAt%20desc";
            getPagCount("?action=count&table=DeviceFullInfoWithLog");
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            // console.log(res);
            return res.json()
        })
        .then((data) => {
            console.log(data.data);
            let devicelogs = data.data;
            let searchResult = devicelogs.map(function (item) {
                let address;
                address = item.Province + item.City + item.District + item.Area + item.DetailAddr + "";
                if (address === "NaN" || address === "undefined" || address == '0') {
                    address = ""
                }
                return (
                    <tr key={item.LogId}>
                        <td>{address}</td>
                        <td>{item.UserName}</td>
                        <td>{item.DeviceId}</td>
                        <td style={{color:getColor(item.Log)}}>{item.Log}</td>
                        <td>{item.LogAt}</td>
                    </tr>
                )
            });
            store.dispatch({type: CONSTANT.SEARCHRESULT, val: searchResult});
        })
        .catch((e) => {
            console.error(e.message, 33)
        })
}

/**
 * 账户管理根据账账号搜索
 * */
function accountByUserName(start,pageSize,userName) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(userName){
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfo&cond="+ condViewRange +" and UserName=%22" + userName + "%22");
            args = "?action=get&table=DeviceFullInfo&limit=limit%200"+start+","+pageSize+"&cond="+ condViewRange +" and UserName=%22" + userName + "%22";
        }else{
            getPagCount("?action=count&table=DeviceFullInfo&cond=UserName=%22" + userName + "%22");
            args = "?action=get&table=DeviceFullInfo&limit=limit%200"+start+","+pageSize+"&cond=UserName=%22" + userName + "%22";
        }
    }else{
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfo&cond="+condViewRange);
            args = "?action=get&table=DeviceFullInfo&cond="+ condViewRange +"&limit=limit%200"+start+","+pageSize+"";
        }else {
            getPagCount("?action=count&table=DeviceFullInfo");
            args = "?action=get&table=DeviceFullInfo&limit=limit%200"+start+","+pageSize+"";
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            store.dispatch({
                type: CONSTANT.SEARCHRESULT, val: data.data.map(function (name) {
                    let address=name.Province+name.City+name.District+name.Area+name.DetailAddr;
                    if(address=="0"||address[0]=="N"){
                        address=""
                    }
                    return (
                        <tr key={name.Id}>
                            <td>{address}</td>
                            <td>{name.UserName} </td>
                            <td>{state.homeState.userInfo.viewPassword === '1'?name.UserPassword:"******"} </td>
                            <td>{name.DeviceId} </td>
                            <td><Button type={'danger'} data-accountId={name.OwnerId} onClick={deleteAccountById}>删除</Button></td>
                        </tr>
                    )
                })
            });

        })
        .catch((e) => {
            console.log(e.message, 33)
        })
}

/**
 * 账户管理根据设备ID搜索
 * */
function accountById(start,pageSize,deviceId) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(deviceId){
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfo&cond="+ condViewRange +" and DeviceId=%22" + deviceId + "%22");
            args = "?action=get&table=DeviceFullInfo&limit=limit%200"+start+","+pageSize+"&cond="+ condViewRange +" and DeviceId=%22" + deviceId + "%22";
        }else{
            getPagCount("?action=count&table=DeviceFullInfo&cond=DeviceId=%22" + deviceId + "%22");
            args = "?action=get&table=DeviceFullInfo&limit=limit%200"+start+","+pageSize+"&cond=DeviceId=%22" + deviceId + "%22";
        }
    }else{
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfo&cond="+condViewRange);
            args = "?action=get&table=DeviceFullInfo&cond="+ condViewRange +"&limit=limit%200"+start+","+pageSize+"";
        }else{
            getPagCount("?action=count&table=DeviceFullInfo");
            args = "?action=get&table=DeviceFullInfo&limit=limit%200"+start+","+pageSize+"";
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            store.dispatch({
                type: CONSTANT.SEARCHRESULT, val: data.data.map(function (name) {
                    let address=name.Province+name.City+name.District+name.Area+name.DetailAddr;
                    if(address=="0"||address[0]=="N"){
                        address=""
                    }
                    return (
                        <tr key={name.Id}>
                            <td>{address}</td>
                            <td>{name.UserName} </td>
                            <td>{state.homeState.userInfo.viewPassword === '1'?name.UserPassword:"******"} </td>
                            <td>{name.DeviceId} </td>
                            <td><Button type={'danger'} data-accountId={name.OwnerId} onClick={deleteAccountById}>删除</Button></td>
                        </tr>
                    )
                })
            });

        })
        .catch((e) => {
            console.log(e.message, 33)
        })
}

/**
 * 账户管理根据地址搜索
 * */
function accountByAddress(start,pageSize,address) {
    let limitRange = state.homeState.userInfo.limitRange;
    let condViewRange = getCondByViewRange();
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(address){
        let condition = "(Province=%22"+address[0]+'%22 and City=%22'+address[1]+'%22 and District=%22'+address[2]+'%22 and Area=%22'+ address[3] +'%22 and DetailAddr=%22'+address[4]+"%22)";
        if(limitRange === '1'){
            if(condViewRange){
                condition = condition +' and '+condViewRange;
            }
        }
        getPagCount("?action=count&table=DeviceFullInfo&Order=Id desc&cond="+condition);
        args = "?action=get&table=DeviceFullInfo&Order=Id desc&cond="+condition+"&limit=limit%200"+start+","+pageSize;
    }else{
        if(limitRange === '1'){
            if(!condViewRange){
                console.log('限制范围为空');
                return;
            }
            getPagCount("?action=count&table=DeviceFullInfo&cond="+condViewRange);
            args = "?action=get&table=DeviceFullInfo&cond="+condViewRange+"&Order=Id desc&limit=limit%200"+start+","+pageSize;
        }else{
            getPagCount("?action=count&table=DeviceFullInfo");
            args = "?action=get&table=DeviceFullInfo&Order=Id desc&limit=limit%200"+start+","+pageSize;
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            console.log(data);
            store.dispatch({
                type: CONSTANT.SEARCHRESULT, val: data.data.map(function (name) {
                    let address=name.Province+name.City+name.District+name.Area+name.DetailAddr;
                    if(address=="0"||address[0]=="N"){
                        address=""
                    }
                    return (
                        <tr key={name.Id}>
                            <td>{address}</td>
                            <td>{name.UserName} </td>
                            <td>{state.homeState.userInfo.viewPassword === '1'?name.UserPassword:"******"} </td>
                            <td>{name.DeviceId} </td>
                            <td><Button type={'danger'} data-accountId={name.OwnerId} onClick={deleteAccountById}>删除</Button></td>
                        </tr>
                    )
                })
            });

        })
        .catch((e) => {
            console.log(e.message, 33)
        })
}

/**
 * 根据viewRange获取查询条件 cond
 * */
function getCondByViewRange(){
    let cond='';
    let addressArr;
    let viewRange = state.homeState.userInfo.viewRange;
    if(viewRange){
        addressArr = state.homeState.userInfo.viewRange.split(',');
    }else{
        return '';
    }
    addressArr.map(function (item,index) {
        let address = item.split('、');
        if(address.length === 4){
            cond += "(Province=%22"+address[0]+'%22 and City=%22'+address[1]+'%22 and District=%22'+address[2]+'%22 and Area=%22'+ address[3] +'%22)';
        }else{
            cond += "(Province=%22"+address[0]+'%22 and City=%22'+address[1]+'%22 and District=%22'+address[2]+'%22)';
        }
        if(addressArr.length !== index+1){
            cond += ' or ';
        }
    });
    return cond;
}
/**
 * 根据用户ID删除账号
 * */

function deleteAccountById(e) {
    console.log(e.target.getAttribute('data-accountId'));
    if(state.homeState.userInfo.deleteUserAccount == '0'){
        message.error('没有权限删除!');
        return;
    }
    const accountId=e.target.getAttribute('data-accountId');
    const content = "确定删除用户吗？";
    Modal.confirm({
        content: content,
        cancelText: '取消',
        okText: '确定',
        onOk() {
            deleteUserAccount(accountId);
        },
        onCancel() {
        },
    });
}
/**
 * 设备状态管理By userName
 * */
function deviceStatusByUserName(start,pageSize,userName) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(userName){
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfo&cond="+ condViewRange +" and UserName=%22" + userName + "%22");
            args = "?action=get&table=DeviceFullInfo&cond="+ condViewRange +" and UserName=%22" + userName + "%22&limit=limit%200"+start+","+pageSize+"&order=LastActivity%20desc";
        }else{
            getPagCount("?action=count&table=DeviceFullInfo&cond=UserName=%22" + userName + "%22");
            args = "?action=get&table=DeviceFullInfo&cond=UserName=%22" + userName + "%22&limit=limit%200"+start+","+pageSize+"&order=LastActivity%20desc";
        }
    }else{
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfo&cond="+condViewRange);
            args = "?action=get&table=DeviceFullInfo&cond="+ condViewRange +"&limit=limit%200"+start+","+pageSize+"&order=LastActivity%20desc";
        }else{
            getPagCount("?action=count&table=DeviceFullInfo");
            args = "?action=get&table=DeviceFullInfo&limit=limit%200"+start+","+pageSize+"&order=LastActivity%20desc";
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            // console.log(res.status, 11);
            return res.json()
        })
        .then((data) => {
            // console.log(data);
            let searchResult;
            searchResult = data.data.map(function (name) {
                // console.log(name);
                let address = name.Province + name.City + name.District + name.Area + name.DetailAddr + "";
                // address = address === 'NaN'? name.a.UserAddress : address;
                if (address == "NaN" || address == "undefined" || address == "0") {
                    address = ""
                }
                return (
                    <tr key={name.DeviceId}>
                        <td>{address}</td>
                        <td>{name.UserName}</td>
                        <td>{name.DeviceId}<Button type={'danger'} data-deviceId={name.DeviceId} onClick={deleteDeviceById}>删除</Button></td>
                        <td>{getDeviceStatus(name.Status,name.isOnline)}</td>
                        <td>{name.LastActivity}</td>
                    </tr>
                )
            });
            store.dispatch({type: CONSTANT.SEARCHRESULT, val: searchResult});
        })
        .catch((e) => {
            console.log(e.message, 33)
        });
}
/**
 * 设备状态管理By deviceId
 * */
function deviceStatusById(start,pageSize,deviceId) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(deviceId){
        // store.dispatch({type:CONSTANT.TOTALPAGE,val:1});
        if(limitRange === '1'){
            getPagCount("?action=get&table=DeviceFullInfo&cond="+ condViewRange +" and DeviceId=%22" + deviceId + "%22");
            args = "?action=get&table=DeviceFullInfo&cond="+ condViewRange +" and DeviceId=%22" + deviceId + "%22&limit=limit%200"+start+","+pageSize+"&order=LastActivity%20desc";
        }else{
            getPagCount("?action=get&table=DeviceFullInfo&cond=DeviceId=%22" + deviceId + "%22");
            args = "?action=get&table=DeviceFullInfo&cond=DeviceId=%22" + deviceId + "%22&limit=limit%200"+start+","+pageSize+"&order=LastActivity%20desc";
        }
    }else{
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfo&cond="+condViewRange);
            args = "?action=get&table=DeviceFullInfo&cond="+ condViewRange +"&limit=limit%200"+start+","+pageSize+"&order=LastActivity%20desc";
        }else {
            getPagCount("?action=count&table=DeviceFullInfo");
            args = "?action=get&table=DeviceFullInfo&limit=limit%200"+start+","+pageSize+"&order=LastActivity%20desc";
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            // console.log(data);
            let searchResult,address;
            if(deviceId){
                let deviceInfo = data.data[0];
                address = deviceInfo.Province + deviceInfo.City + deviceInfo.District + deviceInfo.Area + deviceInfo.DetailAddr + "";
                if (address == "NaN" || address == "undefined" || address == "0") {
                    address = ""
                }
                searchResult = (
                    <tr key={deviceInfo.DeviceId}>
                        <td>{address}</td>
                        <td>{deviceInfo.UserName}</td>
                        <td>{deviceInfo.DeviceId}<Button type={'danger'} data-deviceId={deviceInfo.DeviceId} onClick={deleteDeviceById}>删除</Button></td>
                        <td>{getDeviceStatus(name.Status,name.isOnline)}</td>
                        <td>{deviceInfo.LastActivity}</td>
                    </tr>
                );
            }else{
                searchResult = data.data.map(function (name) {
                    // console.log(name);
                    address = name.Province + name.City + name.District + name.Area + name.DetailAddr + "";
                    // address = address === 'NaN'? name.a.UserAddress : address;
                    if (address == "NaN" || address == "undefined" || address == "0") {
                        address = ""
                    }
                    return (
                        <tr key={name.DeviceId}>
                            <td>{address}</td>
                            <td>{name.UserName}</td>
                            <td>{name.DeviceId}<Button type={'danger'} data-deviceId={name.DeviceId} onClick={deleteDeviceById}>删除</Button></td>
                            <td>{getDeviceStatus(name.Status,name.isOnline)}</td>
                            <td>{name.LastActivity}</td>
                        </tr>
                    )
                });
            }
            store.dispatch({type: CONSTANT.SEARCHRESULT, val: searchResult});
        })
        .catch((e) => {
            console.log(e.message, 33)
        });
}
/**
 * 设备状态管理By address
 * */
function deviceStatusByAddress(start,pageSize,address) {
    let limitRange = state.homeState.userInfo.limitRange;
    let condViewRange = getCondByViewRange();
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(address){
        let condition = "(Province=%22"+address[0]+'%22 and City=%22'+address[1]+'%22 and District=%22'+address[2]+'%22 and Area=%22'+ address[3] +'%22 and DetailAddr=%22'+address[4]+"%22)";
        if(limitRange === '1'){
            if(condViewRange){
                condition = condition +' and '+condViewRange;
            }
        }
        getPagCount("?action=count&table=DeviceFullInfo&Order=Id desc&cond="+condition);
        args = "?action=get&table=DeviceFullInfo&Order=Id desc&cond="+condition+"&limit=limit%200"+start+","+pageSize+"&order=LastActivity%20desc";
    }else{
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfo&cond="+condViewRange);
            args = "?action=get&table=DeviceFullInfo&Order=Id desc&cond="+condViewRange+"&limit=limit%200"+start+","+pageSize+"&order=LastActivity%20desc";
        }else{
            getPagCount("?action=count&table=DeviceFullInfo");
            args = "?action=get&table=DeviceFullInfo&Order=Id desc&limit=limit%200"+start+","+pageSize+"&order=LastActivity%20desc";
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            // console.log(data);
            let searchResult;
            searchResult = data.data.map(function (name) {
                // console.log(name);
                let address = name.Province + name.City + name.District + name.Area + name.DetailAddr + "";
                // address = address === 'NaN'? name.a.UserAddress : address;
                if (address == "NaN" || address == "undefined" || address == "0") {
                    address = ""
                }
                return (
                    <tr key={name.DeviceId}>
                        <td>{address}</td>
                        <td>{name.UserName}</td>
                        <td>{name.DeviceId}<Button type={'danger'} data-deviceId={name.DeviceId} onClick={deleteDeviceById}>删除</Button></td>
                        <td>{getDeviceStatus(name.Status,name.isOnline)}</td>
                        <td>{name.LastActivity}</td>
                    </tr>
                )
            });
            store.dispatch({type: CONSTANT.SEARCHRESULT, val: searchResult});
        })
        .catch((e) => {
            console.log(e.message, 33)
        });
}

/**
 * 根据device的Status and isOnline判断是否在线，离线，开，关
 * */
function getDeviceStatus(status,isOnline) {
    let deviceStatus = '';
    switch (status){
        case 'N':
            deviceStatus = 'offLine';
            break;
        case 'A':
            deviceStatus = 'alarm';
            break;
        case 'G':
            deviceStatus = 'onLine';
            break;
        default:
            console.log('default!');
            if(isOnline === 'N'){
                deviceStatus = 'offLine';
            }else{
                deviceStatus = 'onLine';
            }
    }
    return deviceStatus;
}
/**
 * 根据ID删除设备
 * */
function deleteDeviceById(event) {
    console.log(state.homeState.userInfo.deleteDevice);
    if(state.homeState.userInfo.deleteDevice == '0'){
        message.error('没有权限删除!');
        return;
    }
    const deviceId=event.target.getAttribute('data-deviceId');
    const content = "确定删除设备" + deviceId + "？";
    Modal.confirm({
        content: content,
        cancelText: '取消',
        okText: '确定',
        onOk() {
            deleteDevice(deviceId);
        },
        onCancel() {
        },
    });
}

/**
 * 设备地址查询By userName
 * */
function deviceAddrByUserName(start,pageSize,editFn,userName) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(userName){
        if(limitRange === '1'){
            getPagCount("?action=count&table=devicefullinfo&cond="+ condViewRange +" and UserName=%22" + userName + "%22");
            args = "?action=get&table=devicefullinfo&cond="+ condViewRange +" and UserName=%22" + userName + "%22&limit=limit%200"+start+","+pageSize+"&order=%22LogAt%22%20desc";
        }else{
            getPagCount("?action=count&table=devicefullinfo&cond=UserName=%22" + userName + "%22");
            args = "?action=get&table=devicefullinfo&cond=UserName=%22" + userName + "%22&limit=limit%200"+start+","+pageSize+"&order=%22LogAt%22%20desc";
        }
    }else {
        if(limitRange === '1'){
            getPagCount("?action=count&table=devicefullinfo&cond="+condViewRange);
            args = "?action=get&table=devicefullinfo&cond="+ condViewRange +"&limit=limit%200"+start+","+pageSize+"&order=%22LogAt%22%20desc";
        }else {
            getPagCount("?action=count&table=devicefullinfo");
            args = "?action=get&table=devicefullinfo&limit=limit%200"+start+","+pageSize+"&order=%22LogAt%22%20desc";
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            console.log(data);
            store.dispatch({
                type: CONSTANT.SEARCHRESULT, val: data.data.map(function (name) {
                    return (
                        <tr key={name.Id}>
                            <td>{name.UserName}</td>
                            <td>{name.DeviceId}</td>
                            <td>{name.UserAddress}</td>
                            <td>{name.Province}</td>
                            <td>{name.City}</td>
                            <td>{name.District}</td>
                            <td>{name.Area}</td>
                            <td>{name.DetailAddr}</td>
                            <td>
                                {/*<Button type={'danger'} data-deviceId={name.Id} onClick={deleteDeviceById}>删除</Button>*/}
                                <Button data-id={name.Id} data-province={name.province}
                                        type={'primary'} data-city={name.city}
                                        data-county={name.District} data-village={name.Area}
                                        onClick={editFn} >编辑
                                </Button>
                            </td>
                        </tr>
                    )
                })
            });
            store.dispatch({type: CONSTANT.DEVICEADDRESSDATA, val: data.data});
            // console.log(typeof(state.homeState.searchResult), "类型");
        })
        .catch((e) => {
            console.error(e.message, 33)
        })
}

/**
 * 设备地址查询 by deviceId
 * */
function deviceAddrById(start,pageSize,editFn,deviceId) {
    let condViewRange = getCondByViewRange();
    let limitRange = state.homeState.userInfo.limitRange;
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(deviceId){
        if(limitRange === '1'){
            getPagCount("?action=count&table=devicefullinfo&cond="+ condViewRange +" and DeviceId=%22" + deviceId + "%22");
            args = "?action=get&table=devicefullinfo&cond="+ condViewRange +" and DeviceId=%22" + deviceId + "%22&limit=limit%200"+start+","+pageSize+"&order=%22LogAt%22%20desc";
        }else{
            getPagCount("?action=count&table=devicefullinfo&cond=DeviceId=%22" + deviceId + "%22");
            args = "?action=get&table=devicefullinfo&cond=DeviceId=%22" + deviceId + "%22&limit=limit%200"+start+","+pageSize+"&order=%22LogAt%22%20desc";
        }
    }else {
        if(limitRange === '1'){
            getPagCount("?action=count&table=devicefullinfo&cond="+condViewRange);
            args = "?action=get&table=devicefullinfo&cond="+ condViewRange +"&limit=limit%200"+start+","+pageSize+"&order=%22LogAt%22%20desc";
        }else{
            getPagCount("?action=count&table=devicefullinfo");
            args = "?action=get&table=devicefullinfo&limit=limit%200"+start+","+pageSize+"&order=%22LogAt%22%20desc";
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            console.log(data);
            store.dispatch({
                type: CONSTANT.SEARCHRESULT, val: data.data.map(function (name) {
                    return (
                        <tr key={name.Id}>
                            <td>{name.UserName}</td>
                            <td>{name.DeviceId}</td>
                            <td>{name.UserAddress}</td>
                            <td>{name.Province}</td>
                            <td>{name.City}</td>
                            <td>{name.District}</td>
                            <td>{name.Area}</td>
                            <td>{name.DetailAddr}</td>
                            <td>
                                {/*<Button type={'danger'} data-deviceId={name.Id} onClick={deleteDeviceById}>删除</Button>*/}
                                <Button data-id={name.Id} data-province={name.province}
                                        type={'primary'} data-city={name.city}
                                        data-county={name.District} data-village={name.Area}
                                        onClick={editFn} >编辑
                                </Button>
                            </td>
                        </tr>
                    )
                })
            });
            store.dispatch({type: CONSTANT.DEVICEADDRESSDATA, val: data.data});
            // console.log(typeof(state.homeState.searchResult), "类型");
        })
        .catch((e) => {
            console.error(e.message, 33)
        })
}
/**
 * 设备地址查询 by Address
 * */
function deviceAddrByAddress(start,pageSize,editFn,address) {
    let limitRange = state.homeState.userInfo.limitRange;
    let condViewRange = getCondByViewRange();
    if(limitRange === '1' && !condViewRange){
        console.log('限制范围为空！');
        return;
    }

    let args;
    if(address){
        let condition = "(Province=%22"+address[0]+'%22 and City=%22'+address[1]+'%22 and District=%22'+address[2]+'%22 and Area=%22'+ address[3] +'%22 and DetailAddr=%22'+address[4]+"%22)";
        if(limitRange === '1'){
            if(condViewRange){
                condition = condition +' and '+condViewRange;
            }
        }
        getPagCount("?action=count&table=DeviceFullInfo&Order=Id desc&cond="+condition);
        args = "?action=get&table=DeviceFullInfo&Order=Id desc&cond="+condition+"&limit=limit%200"+start+","+pageSize+"&order=%22LogAt%22%20desc";
    }else{
        if(limitRange === '1'){
            getPagCount("?action=count&table=DeviceFullInfo&cond="+condViewRange);
            args = "?action=get&table=DeviceFullInfo&Order=Id desc&cond="+condViewRange+"&limit=limit%200"+start+","+pageSize+"&order=%22LogAt%22%20desc";
        }else{
            getPagCount("?action=count&table=DeviceFullInfo");
            args = "?action=get&table=DeviceFullInfo&Order=Id desc&limit=limit%200"+start+","+pageSize+"&order=%22LogAt%22%20desc";
        }
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            console.log(data);
            store.dispatch({
                type: CONSTANT.SEARCHRESULT, val: data.data.map(function (name) {
                    return (
                        <tr key={name.Id}>
                            <td>{name.UserName}</td>
                            <td>{name.DeviceId}</td>
                            <td>{name.UserAddress}</td>
                            <td>{name.Province}</td>
                            <td>{name.City}</td>
                            <td>{name.District}</td>
                            <td>{name.Area}</td>
                            <td>{name.DetailAddr}</td>
                            <td>
                                {/*<Button type={'danger'} data-deviceId={name.Id} onClick={deleteDeviceById}>删除</Button>*/}
                                <Button data-id={name.Id} data-province={name.province}
                                        type={'primary'} data-city={name.city}
                                        data-county={name.District} data-village={name.Area}
                                        onClick={editFn} >编辑
                                </Button>
                            </td>
                        </tr>
                    )
                })
            });
            store.dispatch({type: CONSTANT.DEVICEADDRESSDATA, val: data.data});
            // console.log(typeof(state.homeState.searchResult), "类型");
        })
        .catch((e) => {
            console.error(e.message, 33)
        })
}

/**
 *权限管理获取管理员数据 By userName
 * */
function powerManageByUserName(start,pageSize,showModalFn,submitFn,userDeleteFn,userName) {
    let args;
    if(userName){
        getPagCount("?action=count&table=UserInfo&cond=Name=%22"+userName+"%22 and administrator=%221%22");
        args = "?action=get&table=UserInfo&cond=Name=%22"+userName+"%22 and administrator=%221%22&limit=limit "+start+","+pageSize;
    }else{
        getPagCount("?action=count&table=UserInfo&cond=administrator=%221%22");
        args = "?action=get&table=UserInfo&cond=administrator=%221%22&limit=limit "+start+","+pageSize;
    }
    fetch(generalApi+args)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            console.log(data.data);
            let searchResult = data.data.map(function (name) {
                return (
                    <tr key={name.Id}>
                        <td>{name.Name}</td>
                        <td>{name.superuser === '1'?'******':name.Password}</td>
                        <td>
                            <Checkbox defaultChecked={name.viewAdvice === '1'?true:false}>查看投诉建议</Checkbox>
                            <Checkbox defaultChecked={name.editAdvice === '1'?true:false}>编辑投诉建议</Checkbox>
                            <Checkbox defaultChecked={name.editAddressName === '1'?true:false}>编辑地址名称</Checkbox>
                            <Checkbox defaultChecked={name.deleteUserAccount === '1'?true:false}>删除用户账号</Checkbox>
                            <Checkbox defaultChecked={name.viewPassword === '1'?true:false}>查看密码</Checkbox>
                            <Checkbox defaultChecked={name.deleteDevice === '1'?true:false}>删除设备</Checkbox>
                            <Checkbox defaultChecked={name.limitRange === '1'?true:false}>限制范围</Checkbox>
                            {/*<Checkbox defaultChecked={name.viewFix} onChange={viewFix}>查看维修记录</Checkbox>*/}
                            <Button onClick={showModalFn} data-id={name.Id} data-viewRange={name.viewRange}>用户查看设备范围</Button>
                            <Button type="primary" data-id={name.Id} onClick={submitFn}>提交</Button>
                        </td>
                        <td><Button type="danger" data-id={name.Id} data-name={name.Name}
                                    onClick={userDeleteFn}>删除</Button></td>
                    </tr>
                )
            });
            store.dispatch({type:CONSTANT.SEARCHRESULT,val:searchResult});
        })
        .catch((e) => {
            console.log(e.message, 33)
        })
}

/**
 * 权限管理 提交
 * */
function powerSubmit(event){
    console.log(state.homeState.userInfo);
    let userId = event.target.getAttribute('data-id');
    if(state.homeState.userInfo.id === userId){
        message.warn('不能操作自己');
        return;
    }
    let userInfoTmp = {};//state.homeState.userInfo;
    userInfoTmp.id = userId;
    const childNodes = event.target.parentNode.childNodes;
    userInfoTmp.viewAdvice = childNodes[0].childNodes[0].childNodes[0].checked?1:0;
    userInfoTmp.editAdvice = childNodes[1].childNodes[0].childNodes[0].checked?1:0;
    userInfoTmp.editAddressName = childNodes[2].childNodes[0].childNodes[0].checked?1:0;
    userInfoTmp.deleteUserAccount = childNodes[3].childNodes[0].childNodes[0].checked?1:0;
    userInfoTmp.viewPassword = childNodes[4].childNodes[0].childNodes[0].checked?1:0;
    userInfoTmp.deleteDevice = childNodes[5].childNodes[0].childNodes[0].checked?1:0;
    userInfoTmp.limitRange = childNodes[6].childNodes[0].childNodes[0].checked?1:0;
    if(userInfoTmp.limitRange === 1){
        userInfoTmp.viewRange = state.homeState.userInfo.viewRange;
    }else{
        userInfoTmp.viewRange = '';
    }
    console.log(userInfoTmp);
    // delete userInfoTmp.name;
    console.log('userId:' + userId);
    Modal.confirm({
        // title: '',
        content: "确定提交吗?",
        cancelText: '取消',
        okText: '确定',
        onOk() {
            updateUserInfo(userInfoTmp);
        },
        onCancel() {
        },
    });
}

/**
 * 权限管理 查看范围弹窗
 * */
function powerShowModal(event) {
    let viewRange=event.target.getAttribute('data-viewRange');
    console.log(viewRange);
    viewRange = viewRange.split(',');
    store.dispatch({type:CONSTANT.LOCALVIEWRANGE,val:viewRange});
    store.dispatch({type:CONSTANT.VIEWMODAL,val:true});
}

/**
 * 权限管理 删除用户
 * */
function powerUserDelete(event){
    let userId = event.target.getAttribute('data-id');
    if(state.homeState.userInfo.id === userId){
        message.error('不能操作自己');
        return;
    }
    const content = "确定删除用户" + event.target.getAttribute('data-name') + "吗？";
    if (state.homeState.userInfo.deleteUserAccount === '1') {
        Modal.confirm({
            content: content,
            cancelText: '取消',
            okText: '确定',
            onOk() {
                deleteUserAccount(userId);
            },
            onCancel() {
            },
        });
    } else {
        message.error('没有删除权限');
    }
}

/**
 * 获取分页总数
 * */
function getPagCount(condition){
    fetch(generalApi+condition)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            console.log(data.data);
            if(Number(data.data) !== 'NaN'){
                let count = Number(data.data);
                if(count === 0){
                    count = 1;
                }
                store.dispatch({type:CONSTANT.TOTALPAGE,val:count});
            }
        })
        .catch(e=>console.error(e))
}

/**
 * 初始化分页器的页码数
 * */
function initPagination() {
    store.dispatch({type:CONSTANT.CURRENTPAGE,val:1});
    store.dispatch({type:CONSTANT.TOTALPAGE,val:1});
}

export {
    deleteDevice, deleteComplaint,delConfirmComplain,historyByTime,
    updateUserInfo, deleteUserAccount, accountById, getPagCount,
    deviceStatusById,powerManageByUserName,complainAdviceByUsername,warningByTime,
    initPagination, warningById, warningByUserName, historyById, historyByUserName,
    accountByUserName,deviceStatusByUserName, deviceAddrByUserName, deviceAddrById,
    warningByAddress,historyByAddress,accountByAddress,deviceStatusByAddress,
    deviceAddrByAddress,complainAdviceByAddress,powerSubmit,powerShowModal,powerUserDelete
};