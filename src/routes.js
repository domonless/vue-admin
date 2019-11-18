import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import echarts from './views/charts/echarts.vue'
import Stock from './views/stock/Stock.vue'
import Item from './views/item/Item.vue'
import PrepareItem from './views/item/PrepareItem.vue'
import Order from './views/order/Order.vue'
import OrderAdd from './views/order/OrderAdd.vue'
import OrderAddPre from './views/order/OrderAddPre.vue'
import Area from './views/area/Area.vue'
import Type from './views/type/Type.vue'
import Pur from './views/srm/Pur.vue'
import Bid from './views/srm/Bid.vue'
import Purchaser from './views/purchaser/Purchaser.vue'
import Buyer from './views/buyer/Buyer.vue'
import Provider from './views/provider/Provider.vue'
import Demander from './views/demander/Demander.vue'
import OrderStatistic from './views/statistic/OrderStatistic.vue'
import ItemStatistic from './views/statistic/ItemStatistic.vue'
import Expenses from './views/expenses/Expenses.vue'
// import InvoiceStatistic from './views/statistic/InvoiceStatistic.vue'
import Invoice from './views/invoice/Invoice.vue'
import InvoiceAdd from './views/invoice/InvoiceAdd.vue'
import InvoiceAdd2 from './views/invoice/InvoiceAdd2.vue'
import Employee from './views/employee/Employee.vue'
import Cookies from 'js-cookie';

let user_info={};
if(Cookies.get('user_info')){
    user_info = JSON.parse(Cookies.get('user_info'));
}

let routes = [];
if(user_info.userId==14){
    routes = [
        {
            path: '/login',
            component: Login,
            name: '',
            hidden: true
        },
        {
            path: '/404',
            component: NotFound,
            name: '',
            hidden: true
        },
        {
            path: '/',
            redirect: '/index',
            hidden: true
        },
        {
            path: '/index',
            component: Home,
            hidden: true, 
            name: '首页',
        },
        {
            path: '/statistic',
            component: Home,
            name: '数据统计',
            iconCls: 'fa fa-calculator',//图标样式class
            redirect: '/expenses/list',
            children: [
                { path: '/expenses/list', component:Expenses, name: '开销统计' },
            ]
        },
    ];
}else{
    routes = [
        {
            path: '/login',
            component: Login,
            name: '',
            hidden: true
        },
        {
            path: '/404',
            component: NotFound,
            name: '',
            hidden: true
        },
        {
            path: '/',
            redirect: '/index',
            hidden: true
        },
        {
            path: '/index',
            component: Home,
            hidden: true, 
            name: '首页',
        },
        {
            path: '/item',
            component: Home,
            name: '物料签价管理',
            iconCls: 'fa fa-file-text',//图标样式class
            redirect: '/item/list',
            children: [
                { path: '/item/list', component: Item, name: '物料签价列表' },
                { path: '/item/prepare', component: PrepareItem, name: '备货列表' },
            ]
        },
        {
            path: '/order',
            component: Home,
            name: '采购订单管理',
            iconCls: 'fa fa-th-list',//图标样式class
            redirect: '/order/list',
            children: [
                { path: '/order/list', component: Order, name: '采购订单列表' },
                { path: '/order/add', component: OrderAdd, name: '新增采购订单' },
                { path: '/preorder/add', component: OrderAddPre, name: '新增提前送货' },
            ]
        },
        {
            path: '/provider',
            component: Home,
            name: '采购信息管理',
            iconCls: 'fa fa-address-book',//图标样式class
            redirect: '/provider/list',
            children: [
                { path: '/provider/list', component: Provider, name: '供应商管理' },
                { path: '/demander/list', component: Demander, name: '需求公司管理' },
                { path: '/area/list', component: Area, name: '采购组织管理' },
                { path: '/type/list', component: Type, name: '采购类型管理' },
                { path: '/purchaser/list', component: Purchaser, name: '采购员管理' },
                { path: '/buyer/list', component: Buyer, name: '请购人管理' },
            ]
        },
        {
            path: '/srm',
            component: Home,
            name: '招采平台',
            iconCls: 'fa fa-hacker-news',//图标样式class
            redirect: '/srm/pur',
            children: [
                { path: '/srm/pur', component:Pur, name: '报价查询' },
                { path: '/srm/bid', component:Bid, name: '投标查询' },
            ]
        },
        {
            path: '/invoice',
            component: Home,
            name: '发票管理',
            iconCls: 'fa fa-money',//图标样式class
            redirect: '/invoice/list',
            children: [
                { path: '/invoice/list', component: Invoice, name: '发票列表' },
                // { path: '/invoice/add', component: InvoiceAdd, name: '待开票订单' },
                { path: '/invoice/add', component: InvoiceAdd2, name: '待开票物料' },
            ]
        },
        {
            path: '/statistic',
            hidden: Cookies.get('user_type')==0, 
            component: Home,
            name: '数据统计',
            iconCls: 'fa fa-calculator',//图标样式class
            redirect: '/statistic/order',
            children: [
                { path: '/statistic/order', component:OrderStatistic, name: '订单统计' },
                { path: '/statistic/item', component:ItemStatistic, name: '销售统计' },
                { path: '/expenses/list', component:Expenses, name: '开销统计' },
            ]
        },
        {
            path: '/employee',
            hidden: Cookies.get('user_type')==0,
            component: Home,
            name: '员工管理',
            iconCls: 'fa fa-group',//图标样式class
            redirect: '/employee/list',
            children: [
                { path: '/employee/list', component:Employee, name: '员工列表' },
            ]
        },
        {
            path: '*',
            hidden: true,
            redirect: { path: '/404' }
        }
    ];
}


export default routes;