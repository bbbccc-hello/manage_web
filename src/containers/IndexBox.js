import React, {Component} from 'react';
import { Row, Col } from 'antd';
import { generalApi } from '../static/apiInfo';

class IndexBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            warningContent: "",
            address:"深圳",


        };
    }
    // 首页报警信息显示12小时之内的
    fetchFn = () => {
        const _this=this;
        let now = new Date();

        let year = now.getFullYear();       //年
        let month = now.getMonth() + 1;     //月
        let day = now.getDate();            //日

        let hh = now.getHours();            //时
        let mm = now.getMinutes();          //分
        if (hh < 10) {
            hh = "0" + hh
        }
        if (mm < 10) {
            mm = "0" + mm
        }
        let BeginTime = "",EndTime="";

        BeginTime = year + "/" + month + "/" + day + " " + "00:00";
        EndTime = year + "/" + month + "/" + day + " " + hh + ":" + mm;
        fetch(generalApi+"?action=get&table=DeviceLogs&cond=Log=%22alarm%22&limit=limit%200,10&order=LogAt%20desc")
            .then((res) => {
                // console.log(res.status, 11);
                return res.json()
            })
            .then((data) => {
                // console.log("定时刷新了");
                _this.setState({warningContent:data.data.map(function (name) {

                        return (
                               <div key={name.Id}>{name.DeviceId} {name.Log} {name.LogAt}</div>
                        )
                    })
                })
            })
            .catch((e) => {
                console.log(e.message, 33)
            })
    };
    Astop() {
        this.refs.mar.stop();
    }
    componentWillMount() {
    
        this.fetchFn()
    }
    Astart() {
        this.refs.mar.start();
    }

    render() {
        return (<div className="indexContainer">
            <Row>
                <Col span={12}>
                    <div className="companyIntroduce">
                        <div className="companyLogo"><img src="./images/tairanlogo.png" alt=""/></div>
                 <div>泰燃授权专供{this.state.address}使用</div>
                    </div>
                </Col>
                <Col span={12}>
                    <p>报警信息:</p>
                    <marquee  contentEditable="false"
                              style={{color:'red'}}
                              height="300"
                              width="200"
                              direction="up"
                              ref="mar"
                              onMouseOver={this.Astop.bind(this)}
                              onMouseOut={this.Astart.bind(this)}
                    >{this.state.warningContent}</marquee>

                </Col>
            </Row>
        </div>)
    }
}

export default IndexBox;