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
import Purchaser from './views/purchaser/Purchaser.vue'
import Provider from './views/provider/Provider.vue'
import Demander from './views/demander/Demander.vue'
import OrderStatistic from './views/statistic/OrderStatistic.vue'
import Expenses from './views/expenses/Expenses.vue'
import InvoiceStatistic from './views/statistic/InvoiceStatistic.vue'
import Invoice from './views/invoice/Invoice.vue'
import InvoiceAdd from './views/invoice/InvoiceAdd.vue'
import Employee from './views/employee/Employee.vue'
import Cookies from 'js-cookie';


let routes = [
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
    // { path: '/main', component: Main },
    {
        path: '/',
        redirect: '/order',
        hidden: true
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
    // {
    //     path: '/stock',
    //     component: Home,
    //     name: '库存管理',
    //     iconCls: 'fa fa-shopping-cart',//图标样式class
    //     redirect: '/stock/list',
    //     children: [
    //         { path: '/stock/list', component: Stock, name: '库存清单' },
    //     ]
    // },
    {
        path: '/provider',
        component: Home,
        name: '采购信息管理',
        iconCls: 'fa fa-address-book',//图标样式class
        redirect: '/provider/list',
        children: [
            { path: '/provider/list', component: Provider, name: '供应商管理' },
            { path: '/demander/list', component: Demander, name: '需求公司管理' },
            { path: '/purchaser/list', component: Purchaser, name: '采购员管理' },
            { path: '/area/list', component: Area, name: '采购组织管理' },
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
            { path: '/invoice/add', component: InvoiceAdd, name: '待开票订单' },
        ]
    },
    {
        path: '/statistic',
        component: Home,
        name: '数据统计',
        iconCls: 'fa fa-calculator',//图标样式class
        redirect: '/statistic/order',
        children: [
            { path: '/statistic/order', component:OrderStatistic, name: '订单统计' },
            // { path: '/statistic/invoice', component:InvoiceStatistic, name: '发票统计' },
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

export default routes;