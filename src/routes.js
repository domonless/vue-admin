import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
// import Table from './views/nav1/Table.vue'
// import Form from './views/nav1/Form.vue'
// import user from './views/nav1/user.vue'
// import Page4 from './views/nav2/Page4.vue'
// import Page5 from './views/nav2/Page5.vue'
// import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
import Stock from './views/stock/Stock.vue'
import Item from './views/item/Item.vue'
import Order from './views/order/Order.vue'
import OrderAdd from './views/order/OrderAdd.vue'
import OrderAddPre from './views/order/OrderAddPre.vue'
import Purchaser from './views/purchaser/Purchaser.vue'
import Provider from './views/provider/Provider.vue'
import Demander from './views/demander/Demander.vue'
import Statistic from './views/statistic/Statistic.vue'

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
            { path: '/preorder/add', component: OrderAddPre, name: '提前送货' },
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
        path: '/purchaser',
        component: Home,
        name: '人员管理',
        iconCls: 'fa fa-address-book',//图标样式class
        redirect: '/purchaser/list',
        children: [
            { path: '/purchaser/list', component: Purchaser, name: '人员列表' },
            { path: '/provider/list', component: Provider, name: '供应商列表' },
            { path: '/demander/list', component: Demander, name: '需求公司列表' },
        ]
    },
    {
        path: '/statistic',
        component: Home,
        name: '数据统计',
        iconCls: 'fa fa-calculator',//图标样式class
        redirect: '/statistic/query',
        children: [
            { path: '/statistic/query', component: Statistic, name: '收支汇总' },
        ]
    },
    // {
    //     path: '/provider',
    //     component: Home,
    //     name: '供应商管理',
    //     iconCls: 'fa fa-address-book',//图标样式class
    //     redirect: '/provider/list',
    //     children: [
    //         { path: '/provider/list', component: Provider, name: '供应商列表' },
    //     ]
    // },
    // {
    //     path: '/demander',
    //     component: Home,
    //     name: '需求公司管理',
    //     iconCls: 'fa fa-address-book',//图标样式class
    //     redirect: '/demander/list',
    //     children: [
    //         { path: '/demander/list', component: Demander, name: '需求公司列表' },
    //     ]
    // },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;