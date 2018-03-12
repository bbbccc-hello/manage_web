import { combineReducers , createStore } from 'redux';

/*action
* 定义类型常量和action创建函数
* */
export const CONSTANT = {
    DEVICEADDRESSDATA:'DEVICEADDRESSDATA',
    ISLOGINED:'ISLOGINED',
    VIEWMODAL:'VIEWMODAL',
    LOCALVIEWRANGE:'LOCALVIEWRANGE',
    SKINCOLOR:'SKINCOLOR',
    STARTTIME:"STARTTIME",
    ENDTIME:"ENDTIME",
    CURRENTCHANNELID:'CURRENTCHANNELID',
    CURRENTROOMINFO:'CURRENTROOMINFO',
    LASTROOMINFO:'LASTROOMINFO',
    CLICKCONTENT:'CLICKCONTENT',
    SEARCHRESULT:'SEARCHRESULT',
    ALLROOMLIST:'ALLROOMLIST',
    LOCATION:'LOCATION',
    USERINFO:'USERINFO',
    CURRENTPAGE:'CURRENTPAGE',
    TOTALPAGE:'TOTALPAGE',
    PAGESIZE:'PAGESIZE',
    SEARCHKEYWORD:'SEARCHKEYWORD',
    TRIGGERSEARCH:'TRIGGERSEARCH'
};
function toggleLogin() {
    return {
        type:CONSTANT.ISLOGINED,
        val:false
    }
}
export function collapsed(bool) {
    return {
        type:CONSTANT.VIEWMODEL,
        val:bool
    }
}

/*reducer
处理这个视图和数据状态
*/
const loginInitState = false;
export const loginState = (state = loginInitState,action) => {
    switch (action.type){
        case CONSTANT.ISLOGINED:
            return true;
        default:
            return loginInitState;
    }
};
const homeInitState = {
    viewModal:false,
    skinColor:'#108ee9',
    startTime:"",//搜索开始时间
    endTime:"",//搜索结束时间
    deviceAddressData:{},//地址数据
    lastRoomInfo:{},//上次房间信息
    currentRoomInfo :{},//当前房间信息
    triggerSearch:false,//是否是搜索模式
    searchKeyword:'',//是否是搜索模式
    userInfo:{},//用户信息
    allRoomList:[],//所有房间用户数据
    searchResult:"",//用户查找结果
    clickContent:'',//用户查找关键字
    currentPage:1,//当前页数
    totalPage:1,//总页数
    pageSize:10,//每页的数量
    localViewRange:'',//本地存储可查看范围
};
export const homeState = (state = homeInitState,action)=>{
    let tmpState = state;
    switch (action.type){
        case CONSTANT.DEVICEADDRESSDATA:
            return Object.assign({},tmpState,{deviceAddressData:action.val});
        case CONSTANT.VIEWMODAL:
            return Object.assign({},tmpState,{viewModal:action.val});
        case CONSTANT.CURRENTROOMINFO:
            return Object.assign({},tmpState,{currentRoomInfo:action.val});
        case CONSTANT.LASTROOMINFO:
            return Object.assign({},tmpState,{lastRoomInfo:action.val});
        case CONSTANT.SKINCOLOR:
            return Object.assign({},tmpState,{skinColor:action.val});
        case CONSTANT.STARTTIME:
            return Object.assign({},tmpState,{startTime:action.val});
        case CONSTANT.ENDTIME:
            return Object.assign({},tmpState,{endTime:action.val});
        case CONSTANT.SEARCHRESULT:
            return Object.assign({},tmpState,{searchResult:action.val});
        case CONSTANT.CLICKCONTENT:
            return Object.assign({},tmpState,{clickContent:action.val});
        case CONSTANT.USERINFO:
            return Object.assign({},tmpState,{userInfo:action.val});
        case CONSTANT.CURRENTPAGE:
            return Object.assign({},tmpState,{currentPage:action.val});
        case CONSTANT.TOTALPAGE:
            return Object.assign({},tmpState,{totalPage:action.val});
        case CONSTANT.PAGESIZE:
            return Object.assign({},tmpState,{pageSize:action.val});
        case CONSTANT.TRIGGERSEARCH:
            return Object.assign({},tmpState,{triggerSearch:action.val});
        case CONSTANT.SEARCHKEYWORD:
            return Object.assign({},tmpState,{searchKeyword:action.val});
        case CONSTANT.LOCALVIEWRANGE:
            return Object.assign({},tmpState,{localViewRange:action.val});
        default:
            // console.log('default');
            return homeInitState;
    }
};

/*多个reducer合成一个reducer*/
const reducer = combineReducers({loginState,homeState});

export default createStore(reducer);
