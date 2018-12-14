import axios from 'axios';
import qs from 'qs'
import md5 from 'js-md5';
import Cookies from 'js-cookie';

axios.defaults.headers.common['Content-Type'] = 'application/json;charset=UTF-8';
let base = 'http://bapi.kyb66.com';
// let base = 'http://localhost:8080';
// let base = 'http://192.168.1.5:8080';

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

//rsa
export const getRsa = params => { return axios.get(`${base}/auth/rsa`, { params: params }); };

//用户
export const editPassword = params => { return axios.post(`${base}/user/password`, params); };

//登陆
export const login = params => { return axios.post(`${base}/auth/login`, params); };

export const requestLogin = params => { return axios.post(`/login`, params).then(res => res.data); };


//物料
export const getItemList = params => { return axios.get(`${base}/item/list`, { params: params }); };

export const addItem = params => { return axios.post(`${base}/item/add`, params); };

export const editItem = params => { return axios.post(`${base}/item/update`, params); };

export const removeItem = params => { return axios.post(`${base}/item/delete`, params); };

export const batAddItem = params => { return axios.post(`${base}/item/batAdd`, params); };

export const batchRemoveItem = params => { return axios.post(`${base}/item/batDel`, params); };

export const getOrdersByItemId = params => { return axios.get(`${base}/item/orders`, { params: params }); };

//上传物料图片
export const fileItemUpload = params => { return axios.post(`${base}/file/item/upload`, params); };


//订单
export const getOrderList = params => { return axios.get(`${base}/order/list`, { params: params }); };

export const addOrder = params => { return axios.post(`${base}/order/add`, params); };

export const editOrder = params => { return axios.post(`${base}/order/update`, params); };

export const removeOrder = params => { return axios.post(`${base}/order/delete`, params); };

export const getOrderDetail = params => { return axios.get(`${base}/order/detail`, { params: params }); };

export const editOrderDetail = params => { return axios.post(`${base}/order/detail/edit`, params); };

export const fileOrderUpload = params => { return axios.post(`${base}/file/order/upload`, params); };


//送货单
export const getDeliveryOrderList = params => { return axios.get(`${base}/deliveryOrder/list`, { params: params }); };


//请购人
export const getPurchaserList = params => { return axios.get(`${base}/purchaser/list`, { params: params }); };

export const getPurchaserListByRole = params => { return axios.get(`${base}/purchaser/list/role`, { params: params }); };

export const addPurchaser = params => { return axios.post(`${base}/purchaser/add`, params); };

export const editPurchaser = params => { return axios.post(`${base}/purchaser/update`, params); };

export const removePurchaser = params => { return axios.post(`${base}/purchaser/delete`, params); };


//供应商
export const getProviderList = params => { return axios.get(`${base}/provider/list`, { params: params }); };

export const addProvider = params => { return axios.post(`${base}/provider/add`, params); };

export const editProvider = params => { return axios.post(`${base}/provider/update`, params); };

export const removeProvider = params => { return axios.post(`${base}/provider/delete`, params); };


//需求公司
export const getDemanderList = params => { return axios.get(`${base}/demander/list`, { params: params }); };

export const addDemander = params => { return axios.post(`${base}/demander/add`, params); };

export const editDemander = params => { return axios.post(`${base}/demander/update`, params); };

export const removeDemander = params => { return axios.post(`${base}/demander/delete`, params); };


//统计
export const getStatistic = params => { return axios.get(`${base}/statistic/query`, { params: params }); };



