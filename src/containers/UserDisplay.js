import React,{ Component } from 'react';
import {Layout, Icon, message, Button,Pagination} from 'antd';
import {CONSTANT} from "../reducer/reducer";
import store from "../reducer/reducer";
let state = store.getState();
store.subscribe(function () {
    state = store.getState();
});
class UserDisplay extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            lists: '',
            buttonValue:'显示用户地址',
            listDisplay:"none",
            color:"black"
        };
    }
    displayAddress=()=>{
        console.log("点击图片")
        if(this.state.buttonValue=="显示用户地址"){
            this.setState({buttonValue:"隐藏用户地址"})
            this.setState({listDisplay:"block"})
        }else {
            this.setState({buttonValue:"显示用户地址"})
            this.setState({listDisplay:"none"})
        }
    }
    clickUserAddress=(event)=>{
        let mode = state.homeState.deviceAddressData;
        store.dispatch({type: CONSTANT.SEARCHRESULT, val: []})
        // this.setState({color:"red"})问题为什么这句没有用
        console.log(this.state.color)

        var clickObject=event.target.parentNode.childNodes;
        for (var i=0;i<clickObject.length;i++)
        {
            //仅显示元素节点

            {
                clickObject.item(i).style.color="black"

            }
        }
        event.target.style.color="#3bb3e0"
        console.log(event.target.parentNode.childNodes)
        var value=event.target.innerText

        console.log(value)
        store.dispatch({
            type: CONSTANT.SEARCHRESULT, val: mode.map(function (name) {

                if ((name.Address.indexOf(value) >= 0)) {
                    // console.log(name)
                    return (
                        <tr key={name.account}>
                            <td>{name.Address}</td>
                            <td>{name.account}</td>
                            <td>{name.controlId} </td>
                            <td>{name.inductorId} </td>
                            <td>{name.advice}</td>
                            <td>{name.reply}</td>
                        </tr>
                    )
                }

            })
        });
        event.preventDefault()
    };
    fetchFn = () => {
        const _this=this;
        fetch('http://192.168.6.3:82/softwares/xtell_projects_dev/27_tairan_web/Web/build/json/userDisplay.json')
            .then((res) => {
                console.log(res.status, 11);
                return res.json()
            })
            .then((data) => {
                this.setState({lists: data.data.map(function (name) {
                        return (
                           <div key={name.key} style={{color:_this.state.color}}><img src="../../images/address.png" alt="" className="addressLogo"/>{name.Address}</div>
                        )
                    })});
            })
            .catch((e) => {
                console.log(e.message, 33)
            })
    };
    componentWillMount() {
        this.fetchFn()
    }
    render(){
        return (
        <div ><button className="selfButton" onClick={this.displayAddress} style={{marginLeft:"15px"}}>{this.state.buttonValue}</button>
        <div style={{display:this.state.listDisplay,color:"black"}} onClick={this.clickUserAddress } className="addressWrap">{this.state.lists}</div>
            <div style={{display:this.state.listDisplay}} ><Pagination size="small" total={100} pageSize={20} showQuickJumper /></div>
        </div>
        )
    }
}

export default UserDisplay;