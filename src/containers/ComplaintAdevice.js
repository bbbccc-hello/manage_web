import React, {Component} from 'react';
import store, {CONSTANT} from "../reducer/reducer";
import { Button, message, Modal, Pagination} from 'antd';
import { generalApi } from '../static/apiInfo';
import {delConfirmComplain, getPagCount, complainAdviceByUsername, complainAdviceByAddress} from '../static/commonFunction';
const confirm = Modal.confirm;
let state = store.getState();
store.subscribe(function () {
    state = store.getState();
});

class ComplaintAdevice extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            total: 1,
            reply: "",
            Id: "",
            current: 1,
            pageSize: 10,
            data: [],
            endResult: []

        };
    }

    reply = (event) => {
        this.setState({reply: event.target.value});
        console.log(this.state.reply)
    };
    adviceEidtor = (event) => {
        const _this = this;
        // console.log(event.target.getAttribute('data-id'));
        this.setState({Id: event.target.getAttribute('data-id')});
        const content = <div className="DeviceADialog">

            <div><label>回复内容:</label>
                <div><textarea rows="7" cols="47" onChange={this.reply}></textarea></div>
            </div>

        </div>;
        // if (state.homeState.userInfo.editAdvice) {
        if (true) {
            confirm({
                content: content,
                iconType: "form",
                cancelText: '取消',
                okText: '确定',
                onOk() {
                    // 时间
                    let now = new Date();
                    let year = now.getFullYear();    //年
                    let month = now.getMonth() + 1;   //月
                    let day = now.getDate();      //日
                    let hh = now.getHours();      //时
                    let mm = now.getMinutes();     //分
                    let second = now.getSeconds();     //秒
                    let clock = year + "-";
                    if (month < 10)
                        clock += "0";
                    clock += month + "-";
                    if (day < 10)
                        clock += "0";
                    clock += day + " ";
                    if (hh < 10)
                        clock += "0";
                    clock += hh + ":";
                    if (mm < 10) clock += '0';
                    clock += mm + ":";
                    if (second < 10) second = '0' + second;
                    clock += second;
                    fetch(generalApi+"?table=Feedback&action=update&cond=Id=" + _this.state.Id + "&ReplyContent=" + _this.state.reply + "&ReplyAt=" + clock + "", {
                    }).then((response) => {
                        // console.log(response);
                        return response.json()
                    })
                        .then(data => {
                            // console.log(data);
                            if (data.status === 'ok') {
                                message.success('编辑成功');
                                complainAdviceByAddress(0,state.homeState.pageSize,_this.detailAdvice,_this.adviceEidtor,null);
                            } else {
                                message.error('编辑失败');
                            }
                        }).catch(err => console.log(err))
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
    componentDidMount() {
        complainAdviceByUsername(0,state.homeState.pageSize,this.detailAdvice,this.adviceEidtor,null);
    }
    onChange = (page) => {
        store.dispatch({type:CONSTANT.CURRENTPAGE,val:page});
        const start=(page-1)*state.homeState.pageSize;
        const pageSize=state.homeState.pageSize;
        if(state.homeState.triggerSearch){
            if(state.homeState.searchKeyword instanceof Array){
                console.log('search by address');
                complainAdviceByAddress(start,pageSize,this.detailAdvice,this.adviceEidtor,state.homeState.searchKeyword);
            }else{
                complainAdviceByUsername(start,pageSize,this.detailAdvice,this.adviceEidtor,state.homeState.searchKeyword);
            }
        }else{
            complainAdviceByUsername(start,pageSize,this.detailAdvice,this.adviceEidtor,null);
        }
    };
    render() {
        return (<div className="tableWrap">
            <table className="mytable">
                <thead>
                <tr>
                    <td>用户地址</td>
                    <td>账号</td>
                    <td>投诉建议内容</td>
                    <td>投诉时间</td>
                    <td>回复内容</td>
                    <td>回复时间</td>
                    <td>操作</td>
                </tr>
                </thead>

                <tbody>
                {state.homeState.searchResult}
                </tbody>
            </table>
            <div className="emptyDiv"></div>
            <div><Pagination simple className="pagination" current={state.homeState.currentPage} onChange={this.onChange} pageSize={state.homeState.pageSize} total={typeof state.homeState.totalPage === 'number'?state.homeState.totalPage:1}/></div>
        </div>)

    }
}

export default ComplaintAdevice;