import React,{Component} from 'react';
import {BrowserRouter, Route, Link} from 'react-router-dom';
import { Form, Icon, Input, Button, Checkbox, message, Popover } from 'antd';
const FormItem = Form.Item;
import cookieUtil from '../libs/cookieUtil';
import '../static/login.scss'
import { loginApi, generalApi } from "../static/apiInfo";

const iconStyle = {
    width: '20px',
    height: '20px'
};


class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = {wechatVisible:'hidden',userName:'',password:'',state:'ok'}
    }
    componentDidMount(){

    }
    handleSubmit(e){
        e.preventDefault();
        // console.log('register:'+userName)
    };
    onChangeUserName(e){
        // console.log('userName:' + e.target.value)
        this.setState({userName:e.target.value});
    };
    onChangePassword(e){
        // console.log('password:' + e.target.value)
        this.setState({password:e.target.value});
    };
    onClickHandle() {
        let userName = this.state.userName,
            password = this.state.password,
            _this = this;
        console.log(userName,password);
        // alert(userName);
        let arg = '?action=get&table=UserInfo&cond=Name=%22' + userName + '%22 and Password=%22' + password+"%22";
        if ('fetch' in window) {
            fetch(generalApi+arg).then((response) => {
                return response.json()
            })
                .then(data => {
                    let userInfo = data.data[0];
                    console.log(userInfo);
                    if (data.status === 'ok' && data.data.length !== 0) {
                        if(userInfo.administrator == '0'){
                            message.error('您不是管理员，无法登陆!');
                        }else{
                            message.success('登录成功');
                            _this.props.login(true, {
                                id: userInfo.Id,
                                name: userInfo.Name,
                                viewAdvice: userInfo.viewAdvice,
                                editAdvice: userInfo.editAdvice,
                                editAddressName: userInfo.editAddressName,
                                deleteUserAccount: userInfo.deleteUserAccount,
                                viewPassword: userInfo.viewPassword,
                                deleteDevice: userInfo.deleteDevice,
                                limitRange: userInfo.limitRange,
                                viewRange: userInfo.viewRange,
                                administrator: userInfo.administrator,
                                superuser: userInfo.superuser,
                                // superuser: '1',
                            });
                        }
                    } else {
                        message.error('用户名与密码不匹配');
                    }
                }).catch(err => {
                console.log(err);
            });
        }
    }
    onChangeCheckBox(e){
    };

    render(){
        return (<Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem>
                        <Input id='user' onChange = {(e) => this.onChangeUserName(e)}
                               prefix={<Icon type="user" className={'login-form-input-logo'} />}
                               defaultValue={cookieUtil.get('loginChecked')=='true'?cookieUtil.get('userName'):''}  placeholder="Username" />
                    </FormItem>
                    <FormItem>
                        <Input id='pwd' onChange = {(e) => this.onChangePassword(e)}
                               prefix={<Icon type="lock" className={'login-form-input-logo'} />}
                               type="password" defaultValue={cookieUtil.get('loginChecked')=='true'?cookieUtil.get('password'):''} placeholder="Password" />
                    </FormItem>
                    <FormItem>
                        <Checkbox defaultChecked={cookieUtil.get('loginChecked')=='true'}
                                  onChange={(e)=>this.onChangeCheckBox(e)}
                                  style = {{float:'left'}}>记住密码</Checkbox>
                        {/*<a className="login-form-forgot" href="">忘记密码</a>*/}
                        <br/>
                        <Button type="primary" htmlType="submit" className="login-form-button" onClick={()=>this.onClickHandle()}>
                            登 录
                        </Button>
                        {/*Or <Link to="/register" >现在注册<Icon type="right"/></Link>
                        <Link to="/register" >忘记密码<Icon type="question"/></Link>*/}
                    </FormItem>
                    <FormItem>
                        <div className={'register-forget-box'}>
                        <Link to="/register" >现在注册<Icon type="right"/></Link>
                        <Link to="/register" >忘记密码<Icon type="question"/></Link>
                        </div>
                    </FormItem>
            </Form>
        );
    }
};
export default Login;
