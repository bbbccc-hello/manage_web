/*const loginApi = 'http://192.168.6.3:82/softwares/xtell_projects_dev/24_YUN_VIDEO/server/app/api/user/login.php';
const registerApi = 'http://192.168.6.3:82/softwares/xtell_projects_dev/24_YUN_VIDEO/server/app/api/user/register.php';*/
import store,{CONSTANT} from "../reducer/reducer";
let state = store.getState();
store.subscribe(function () {
    state = store.getState();
});
// console.log(document.domain);
const loginApi = 'http://a701.xtell.cn:82/softwares/xtell_projects_dev/24_YUN_VIDEO/server/app/api/user/login.php';
const registerApi = 'http://a701.xtell.cn:82/softwares/xtell_projects_dev/24_YUN_VIDEO/server/app/api/user/register.php';
const generalApi = 'http://a701.xtell.cn:82/softwares/xtell_projects_dev/27_tairan_web/server/Api/ApiGeneral.php';
function getGeneralArgs(action,table,cond) {
    return '?action='+action+'&table='+table+'&cond='+cond;
}
export {loginApi, registerApi, generalApi};
