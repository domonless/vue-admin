import axios from 'axios';
import md5 from 'js-md5'

axios.defaults.headers.common['Content-Type'] = 'application/json;charset=UTF-8';
let base = 'http://bgy.test.kyb66.com';
// let base = 'http://192.168.1.3:8081';

const getSign = function(timestamp){
  const signStr = timestamp + "Potato"
  return md5(signStr)
}
const timestamp = new Date().getTime()
axios.defaults.headers.tm = timestamp
axios.defaults.headers.sign = getSign(timestamp)


export const requestLogin = params => { return axios.post(`/login`, params).then(res => res.data); };


//物料
export const getItemList = params => { return axios.get(`${base}/item/list`, { params: params }); };

export const addItem = params => { return axios.post(`${base}/item/add`, params); };

export const editItem = params => { return axios.post(`${base}/item/update`, params); };

export const removeItem = params => { return axios.post(`${base}/item/delete`, params); };

export const batAddItem = params => { return axios.post(`${base}/item/batAdd`, params); };

export const batchRemoveItem = params => { return axios.post(`${base}/item/batDel`, params); };

export const getOrdersByItemId = params => { return axios.get(`${base}/item/orders`, { params: params }); };

//上传图片
export const fileUpload = params => { return axios.post(`${base}/file/upload`, params); };


//订单
export const getOrderList = params => { return axios.get(`${base}/order/list`, { params: params }); };

export const addOrder = params => { return axios.post(`${base}/order/add`, params); };

export const editOrder = params => { return axios.post(`${base}/order/update`, params); };

export const removeOrder = params => { return axios.post(`${base}/order/delete`, params); };

export const getOrderDetail = params => { return axios.post(`${base}/order/detail`, params); };

export const editOrderDetail = params => { return axios.post(`${base}/order/detail/edit`, params); };

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




