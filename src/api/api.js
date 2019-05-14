import axios from 'axios';
import qs from 'qs'
import md5 from 'js-md5';
import Cookies from 'js-cookie';
import { Message } from 'element-ui';

axios.defaults.headers.common['Content-Type'] = 'application/json;charset=UTF-8';
// let base = 'http://tapi.kyb66.com';
let base = 'https://bapi.kyb66.com';
// let base = 'http://localhost:8080';
// let base = 'http://192.168.1.4:8080';

const getSignStr = function(obj,token,timestamp){
  let values = ''
  obj && Object.keys(obj).sort().forEach(key => {
    const value = obj[key]
    values += value === null || value === undefined ? 'null' : obj[key]
  })
  return values + token + timestamp
}

const getSign = function(obj,token,timestamp){
  const signStr = getSignStr(obj,token,timestamp)
  return md5(signStr)
}

// request拦截器
axios.interceptors.request.use(config => {
	const timestamp = new Date().getTime()
	let cookie = Cookies.get('user_info');
	if(cookie){
		cookie = JSON.parse(cookie);
		// axios.defaults.headers.tm = timestamp
		// axios.defaults.headers.s = cookie.session
		// axios.defaults.headers.t = getSign(config.method=='post'? {} : config.params, cookie.token, timestamp)
		config.headers = {
	      'Content-Type': 'application/json;charset=UTF-8', // 设置很关键
	      'tm': timestamp,
	      's': cookie.session,
	      't': getSign(config.method=='post'? {} : config.params, cookie.token, timestamp)
	    }
	}
	return config;
}, error => {
	console.log(error); // for debug
	Promise.reject(error);
})

axios.interceptors.response.use(
  response => {
  	 const res = response.data;
      if (res.code == 410) {
        Message({
          message: res.message,
          type: 'error'
        });
      } else {
        return response;
      }
  },
    /**
    * 下面的注释为通过response自定义code来标示请求状态，当code返回如下情况为权限有问题，登出并返回到登录页
    * 如通过xmlhttprequest 状态码标识 逻辑可写在下面error中
    */
  //  const res = response.data;
  //     if (res.code !== 20000) {
  //       Message({
  //         message: res.message,
  //         type: 'error',
  //         duration: 5 * 1000
  //       });
  //       // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
  //       if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
  //         MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
  //           confirmButtonText: '重新登录',
  //           cancelButtonText: '取消',
  //           type: 'warning'
  //         }).then(() => {
  //           store.dispatch('FedLogOut').then(() => {
  //             location.reload();// 为了重新实例化vue-router对象 避免bug
  //           });
  //         })
  //       }
  //       return Promise.reject(error);
  //     } else {
  //       return response.data;
  //     }}
  error => {
    console.log('err' + error);// for debug
    Message({
      message: '获取数据失败，请刷新重试',
      type: 'error',
      duration: 3 * 1000
    });
    return Promise.reject(error);
  }
)


//rsa
export const getRsa = params => { return axios.get(`${base}/auth/rsa`, { params: params }); };

//用户
export const getUserList = params => { return axios.get(`${base}/user/list`, { params: params }); };

export const addUser = params => { return axios.post(`${base}/user/add`, params); };

export const editUser = params => { return axios.post(`${base}/user/update`, params); };

export const editPassword = params => { return axios.post(`${base}/user/password`, params); };

export const resetPwd = params => { return axios.post(`${base}/user/resetPwd`, params); };


//登陆
export const login = params => { return axios.post(`${base}/auth/login`, params); };

export const requestLogin = params => { return axios.post(`/login`, params).then(res => res.data); };


//物料
export const getItemList = params => { return axios.get(`${base}/item/list`, { params: params }); };

export const getSimilarList = params => { return axios.get(`${base}/item/similar`, { params: params }); };

export const addItem = params => { return axios.post(`${base}/item/add`, params); };

export const editItem = params => { return axios.post(`${base}/item/update`, params); };

export const batAddItem = params => { return axios.post(`${base}/item/batAdd`, params); };

export const batchRemoveItem = params => { return axios.post(`${base}/item/batDel`, params); };

export const batUpdateImgurl = params => { return axios.post(`${base}/item/batUpdateImg`, params); };

export const getOrdersByItemId = params => { return axios.get(`${base}/item/orders`, { params: params }); };

//获取备货中物料
export const getPrepareItemList = params => { return axios.get(`${base}/item/prepare`, { params: params }); };

//获取最近进货列表
export const getRecentItemList = params => { return axios.get(`${base}/item/recent`, { params: params }); };


//上传物料图片
export const fileItemUpload = params => { return axios.post(`${base}/file/item/upload`, params); };


//订单
export const getOrderList = params => { return axios.get(`${base}/order/list`, { params: params }); };

export const addOrder = params => { return axios.post(`${base}/order/add`, params); };

export const editOrder = params => { return axios.post(`${base}/order/update`, params); };

export const getOrderDetail = params => { return axios.get(`${base}/order/detail`, { params: params }); };

export const editOrderDetail = params => { return axios.post(`${base}/order/detail/edit`, params); };

export const delOrderDetail = params => { return axios.post(`${base}/order/detail/del`, params); };

export const fileOrderUpload = params => { return axios.post(`${base}/file/order/upload`, params); };

export const getInvoicesByOrderId = params => { return axios.get(`${base}/order/invoices`, { params: params }); };


//送货单
export const getDeliveryOrderList = params => { return axios.get(`${base}/deliveryOrder/list`, { params: params }); };


//采购员
export const getPurchaserList = params => { return axios.get(`${base}/purchaser/list`, { params: params }); };

export const addPurchaser = params => { return axios.post(`${base}/purchaser/add`, params); };

export const editPurchaser = params => { return axios.post(`${base}/purchaser/update`, params); };


//请购人
export const getBuyerList = params => { return axios.get(`${base}/buyer/list`, { params: params }); };

export const addBuyer = params => { return axios.post(`${base}/buyer/add`, params); };

export const editBuyer = params => { return axios.post(`${base}/buyer/update`, params); };


//供应商
export const getProviderList = params => { return axios.get(`${base}/provider/list`, { params: params }); };

export const addProvider = params => { return axios.post(`${base}/provider/add`, params); };

export const editProvider = params => { return axios.post(`${base}/provider/update`, params); };


//区域
export const getAreaList = params => { return axios.get(`${base}/area/list`, { params: params }); };

export const addArea = params => { return axios.post(`${base}/area/add`, params); };

export const editArea = params => { return axios.post(`${base}/area/update`, params); };


//采购类型
export const getTypeList = params => { return axios.get(`${base}/type/list`, { params: params }); };

export const addType = params => { return axios.post(`${base}/type/add`, params); };

export const editType = params => { return axios.post(`${base}/type/update`, params); };


//需求公司
export const getDemanderList = params => { return axios.get(`${base}/demander/list`, { params: params }); };

export const addDemander = params => { return axios.post(`${base}/demander/add`, params); };

export const editDemander = params => { return axios.post(`${base}/demander/update`, params); };

export const removeDemander = params => { return axios.post(`${base}/demander/delete`, params); };


//发票管理
export const getInvoiceList = params => { return axios.get(`${base}/invoice/list`, { params: params }); };

export const getInvoiceSum = params => { return axios.get(`${base}/invoice/list/sum`, { params: params }); };

export const addInvoice = params => { return axios.post(`${base}/invoice/add`, params); };

export const editInvoice = params => { return axios.post(`${base}/invoice/update`, params); };

export const delInvoice = params => { return axios.post(`${base}/invoice/delete`, params); };

export const getOrdersByInvoiceId = params => { return axios.get(`${base}/invoice/orders`, { params: params }); };

export const getItemsByInvoiceId = params => { return axios.get(`${base}/invoice/items`, { params: params }); };

//上传发票图片
export const fileInvoiceUpload = params => { return axios.post(`${base}/file/invoice/upload`, params); };


//统计
export const getOrderStatistic = params => { return axios.get(`${base}/statistic/order`, { params: params }); };

export const getItemStatistic = params => { return axios.get(`${base}/statistic/item`, { params: params }); };

export const getItemStatisticDetail = params => { return axios.get(`${base}/statistic/item/detail`, { params: params }); };

export const getInvoiceStatistic = params => { return axios.get(`${base}/statistic/invoice`, { params: params }); };


//日常开销
export const getExpensesList = params => { return axios.get(`${base}/expenses/list`, { params: params }); };

export const addExpenses = params => { return axios.post(`${base}/expenses/add`, params); };

export const editExpenses = params => { return axios.post(`${base}/expenses/update`, params); };

export const getExpensesSum = params => { return axios.get(`${base}/expenses/list/sum`, { params: params }); };


