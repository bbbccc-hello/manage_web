import React, {Component} from 'react';
import store from "../reducer/reducer";

let state = store.getState();
store.subscribe(function () {
    state = store.getState();
});
let mode = state.homeState.deviceAddressData;

class Eml extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let mode = state.homeState.deviceAddressData;
        console.log(mode, 44)
    }

    render() {
        return (<div>
            <table className="mytable" style={{margin:"0 auto"}}>
                <thead>
                <tr>
                    <td>账号</td>
                    <td>设备编号</td>
                    <td>送修时间</td>
                    <td>维修状态</td>
                    <td>维修者姓名</td>
                </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>)

    }
}

export default Eml;