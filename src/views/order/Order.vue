<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.cdSn" placeholder="订单号" @input="getOrders" clearable></el-input>
				</el-form-item>
				<el-form-item prop="providerId">
					<el-select v-model="filters.providerId" placeholder="供货商" @change="getOrders" clearable >
					    <el-option
					      v-for="item in providers"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.demander" placeholder="需求公司" @input="getOrders" clearable></el-input>
				</el-form-item>
				<el-form-item prop="status">
					<el-select v-model="filters.status" placeholder="订单状态" @change="getOrders" clearable >
					    <el-option
					      v-for="item in status"
					      :key="item.value"
					      :label="item.label"
					      :value="item.value">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getOrders" >查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="warning" v-on:click="handleAdd" >新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="orders" highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column type="expand">
		      <template slot-scope="props">
		        <el-form label-position="left" inline class="demo-table-expand">
		          <el-form-item label="采购组织:">
		            <span>{{ props.row.org }}</span>
		          </el-form-item>
		          <el-form-item label="采购员:">
		            <span>{{ props.row.buyer }}</span>
		          </el-form-item>
		          <el-form-item label="请购人:">
		            <span>{{ props.row.purchaser }}</span>
		          </el-form-item>
		          <el-form-item label="仓库:">
		            <span>{{ props.row.stocker }}</span>
		          </el-form-item>
		          <el-form-item label="供货商:">
		            <span>{{ props.row.provider }}</span>
		          </el-form-item>
		        </el-form>
		      </template>
		    </el-table-column>
			<el-table-column prop="cdSn" label="订单编号" width="130" sortable>
			</el-table-column>
			<!-- <el-table-column prop="qgSn" label="请购编号" width="120">
			</el-table-column> -->
			<!-- <el-table-column prop="provider" label="供货商" width="250" sortable>
			</el-table-column> -->
			<el-table-column prop="demander" label="需求公司" width="300" sortable>
			</el-table-column>
			<!-- <el-table-column prop="purchaser" label="请购人" width="150">
			</el-table-column>
			<el-table-column prop="stocker" label="仓库" width="150">
			</el-table-column> -->
			<el-table-column prop="sum" label="总金额" width="90">
			</el-table-column>
			<el-table-column prop="createTime" label="下单时间" width="100" :formatter="formatDate">
			</el-table-column>
			<el-table-column prop="status" label="订单状态" width="90" :formatter="formatStatus">
			</el-table-column>
			<el-table-column prop="remark" label="备注" width="200">
			</el-table-column>
			<el-table-column label="操作" width="330">
				<template scope="scope">
					<!-- <el-button type="warning" @click.native="handleDesign()">设计</el-button>  -->
					<el-button type="warning" size="small" @click="handleDeliveryOrder(scope.$index, scope.row)">送货单</el-button>
					<el-button type="danger" size="small" :disabled="scope.row.url==''" @click="handlePdfPrint(scope.$index, scope.row)">pdf</el-button>
					<el-button type="info" size="small" @click="handleView(scope.$index, scope.row)" icon="el-icon-search" circle></el-button>
					<el-button type="primary" size="small" @click="handleRemark(scope.$index, scope.row)" icon="el-icon-edit" circle></el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)" icon="el-icon-delete" circle></el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" ref="editForm">
				<el-form-item label="PDF" prop="url">
					<el-upload
					  class="avatar-uploader"
					  action=""
					  accept=".pdf,.PDF"
					  :http-request="uploadPdf"
					  :show-file-list="false">
					  <pdf v-if="editForm.url && this.uploadFlag == false" :src="editForm.url" class="avatar"></pdf>
					  <i v-else-if="!editForm.url && this.uploadFlag == false" class="el-icon-plus avatar-uploader-icon"></i>
					  <el-progress v-if="this.uploadFlag" type="circle" :percentage="uploadPercent" style="margin-top:30px;"></el-progress>
					</el-upload>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
					<el-input v-model="editForm.remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--送货单界面-->
		<el-dialog title="送货单" :visible.sync="deliveryOrderVisible" :close-on-click-modal="false">
			<el-table :data="items" ref="viewTable" :span-method="objectSpanMethod" highlight-current-row v-loading="itemsLoading" @selection-change="selsChange" style="width: 100%;" >
				<el-table-column type="selection" :disable="false" width="40">
			    </el-table-column>
			    <el-table-column label="序号" type="index" width="60">
				</el-table-column>
				<el-table-column prop="itemNumber" label="物料编号" width="80">
				</el-table-column>
				<el-table-column prop="name" label="物料名称" width="120">
				</el-table-column>
				<el-table-column prop="brand" label="品牌" width="70">
				</el-table-column>
				<el-table-column prop="form" label="规格" width="200">
				</el-table-column>
				<el-table-column prop="unit" label="单位" width="60">
				</el-table-column>
				<el-table-column prop="price" label="单价" width="70">
				</el-table-column>
				<el-table-column prop="count" label="数量" width="70">
				</el-table-column>
				<el-table-column prop="status" label="状态" :formatter="formatStatus" width="70">
				</el-table-column>
				<el-table-column label="操作" width="80">
					<template scope="scope">
						<el-button size="mini" type="warning" :disabled="scope.row.imgurl==''" @click="handleItemPrint(scope.$index, scope.row)">签价</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div id="footer"></div>
			<div slot="footer" class="dialog-footer">
				<!-- <el-button type="warning" @click.native="handleDesign()">设计</el-button>  -->
				<el-button type="warning" :disabled="this.sels.length==0" @click="handlePrint()">打印</el-button>
				<el-button type="danger" @click.native="deliveryOrderVisible=false">取消</el-button>
			</div>
		</el-dialog>

		<!--查看界面-->
		<el-dialog title="查看" :visible.sync="itemListVisible" :close-on-click-modal="false">
			<el-table :data="items" ref="viewTable" :span-method="objectSpanMethod" highlight-current-row v-loading="itemsLoading" @selection-change="selsChange" style="width: 100%;" >
				<el-table-column type="selection" :selectable="checkSelectable" :disable="false" width="40">
			    </el-table-column>
			    <el-table-column label="序号" type="index" width="60">
				</el-table-column>
				<el-table-column prop="itemNumber" label="物料编号" width="80">
				</el-table-column>
				<el-table-column prop="name" label="物料名称" width="100">
				</el-table-column>
				<el-table-column prop="brand" label="品牌" width="60">
				</el-table-column>
				<el-table-column prop="form" label="规格" width="200">
				</el-table-column>
				<el-table-column prop="unit" label="单位" width="60">
				</el-table-column>
				<el-table-column prop="price" label="单价" width="70">
				</el-table-column>
				<el-table-column prop="count" label="数量" width="70">
				</el-table-column>
				<el-table-column prop="bidPrice" label="进价" width="70">
				</el-table-column>
				<el-table-column prop="status" label="状态" :formatter="formatStatus" width="70">
				</el-table-column>
				<el-table-column prop="logisticsSn" label="物流单号" width="100">
				</el-table-column>
				<el-table-column prop="deliveryTime" label="发货日期" width="90" :formatter="formatDeliveryDate">
				</el-table-column>
				<!-- <el-table-column label="操作" width="80">
					<template scope="scope">
						<el-button size="mini" type="warning" :disabled="scope.row.imgurl==''" @click="handleItemPrint(scope.$index, scope.row)">签价</el-button>
					</template>
				</el-table-column> -->
			</el-table>
			<div id="footer"></div>
			<div slot="footer" class="dialog-footer">
				<el-button type="primary" v-if="this.selectStatus===1 && this.sels.length>0" @click.native="handleBuy" :loading="sendLoading">进货</el-button>
				<el-button type="primary" v-if="this.selectStatus===2 && this.sels.length>0" @click.native="handleSend" :loading="sendLoading">发货</el-button>
				<el-button type="primary" v-if="this.selectStatus===3 && this.sels.length>0 && this.sendForm.status!=9" @click.native="handleIn" :loading="sendLoading">入库</el-button>
				<el-button type="primary" v-if="this.selectStatus===3 && this.sels.length>0 && this.sendForm.status==9" @click.native="handleRepair">补单</el-button>
				<el-button type="primary" v-if="this.selectStatus===4 && this.sels.length>0" @click.native="handleInvoice" :loading="sendLoading">开票</el-button>
				<el-button type="primary" v-if="this.selectStatus===5 && this.sels.length>0" @click.native="handleReturn" :loading="sendLoading">回款</el-button>
				<el-button type="danger" @click.native="itemListVisible=false">取消</el-button>
			</div>
		</el-dialog>

		<!--进货界面-->
		<el-dialog title="进货" :visible.sync="buyFormVisible" :close-on-click-modal="false">
			<el-form :model="buyForm" label-width="80px" ref="buyForm" :inline="true">
				<el-form-item label="订单编号" prop="cdSn">
					<el-input v-model="buyForm.cdSn" disabled></el-input>
				</el-form-item>
				<el-table :data="items" highlight-current-row v-loading="itemsLoading" style="width: 100%;" >
					<el-table-column type="index" width="50">
					</el-table-column>
					<el-table-column prop="itemNumber" label="物料编号" width="95">
					</el-table-column>
					<el-table-column prop="name" label="物料名称" width="120">
					</el-table-column>
					<el-table-column prop="brand" label="品牌" width="80">
					</el-table-column>
					<el-table-column prop="form" label="规格" width="150">
					</el-table-column>
					<el-table-column prop="unit" label="单位" width="65">
					</el-table-column>
					<el-table-column prop="price" label="单价" width="80">
					</el-table-column>
					<el-table-column prop="count" label="数量" width="70">
					</el-table-column>
					<el-table-column prop="bidPrice" label="进价" width="100">
						<template scope="scope">
							<el-input type="number" size="mini" min="1" :key="scope.row.id" @input="handleBidPriceChange(scope.$index, scope.row, $event)" @keyup.enter.native="handleEditBidPrice(scope.$index, scope.row)"></el-input>
						</template>
					</el-table-column>
				</el-table>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="buyFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="buySubmit" :loading="buyLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--发货界面-->
		<el-dialog title="发货" :visible.sync="sendFormVisible" :close-on-click-modal="false">
			<el-form :model="sendForm" label-width="80px" :rules="sendFormRules" ref="sendForm" :inline="true">
				<el-form-item label="订单编号" prop="cdSn">
					<el-input v-model="sendForm.cdSn" disabled></el-input>
				</el-form-item>
				<el-form-item label="物流单号" prop="logisticsSn">
					<el-input v-model="sendForm.logisticsSn"></el-input>
				</el-form-item>
				<el-form-item label="其他费用" prop="fee">
					<el-input type="number" v-model="sendForm.fee"></el-input>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
					<el-input type="textarea" v-model="sendForm.remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="sendFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="sendSubmit" :loading="sendLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--补单界面-->
		<el-dialog title="补单" :visible.sync="repairFormVisible" :close-on-click-modal="false">
			<el-form :model="repairForm" label-width="80px" :rules="repairFormRules" ref="repairForm" :inline="true">
				<el-form-item label="采购员" prop="buyerId">
					<el-select v-model="repairForm.buyerId" filterable placeholder="请选择" clearable>
					    <el-option
					      v-for="item in buyers"
					      :key="item.id"
					      :label="item.name+item.phone"
					      :value="item.id">
					    </el-option>
				  	</el-select>
				</el-form-item>
				<el-form-item label="采购组织" prop="org">
					<el-radio-group v-model="repairForm.org">
				      <el-radio-button label="广西区域"></el-radio-button>
				      <el-radio-button label="采购中心"></el-radio-button>
				    </el-radio-group>
				</el-form-item>
				<br>

				<el-form-item label="请购人" prop="purchaserId">
					<el-select v-model="repairForm.purchaserId" filterable placeholder="请选择" clearable>
					    <el-option
					      v-for="item in purchasers"
					      :key="item.id"
					      :label="item.name+item.phone"
					      :value="item.id">
					    </el-option>
				  	</el-select>
				</el-form-item>
				
				<el-form-item label="仓库" prop="stockerId">
					<el-select v-model="repairForm.stockerId" filterable placeholder="请选择" clearable>
					    <el-option
					      v-for="item in stockers"
					      :key="item.id"
					      :label="item.name+item.phone"
					      :value="item.id">
					    </el-option>
				  	</el-select>
				</el-form-item>
				<br>

				<el-form-item label="订单编号" prop="cdSn">
					<el-input v-model="repairForm.cdSn" :maxlength="12"></el-input>
				</el-form-item>
				<el-form-item label="请购编号" prop="qgSn">
					<el-input v-model="repairForm.qgSn" :maxlength="12"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="repairFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="repairSubmit" :loading="sendLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--开票界面-->
		<el-dialog title="开票" :visible.sync="invoiceFormVisible" :close-on-click-modal="false">
			<el-form :model="invoiceForm" label-width="80px" :rules="invoiceFormRules" ref="invoiceForm" :inline="true">
				<!-- <el-form-item label="订单编号" prop="cdSn">
					<el-input v-model="invoiceForm.cdSn" disabled></el-input>
				</el-form-item> -->
				<el-form-item label="发票号" prop="invoiceSn">
					<el-input v-model="invoiceForm.invoiceSn"></el-input>
				</el-form-item>
				<el-form-item label="发票金额" prop="money">
					<el-input type="number" v-model="invoiceForm.money"></el-input>
				</el-form-item>
				<!-- <el-form-item label="备注" prop="remark">
					<el-input type="textarea" v-model="invoiceForm.remark"></el-input>
				</el-form-item> -->
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="invoiceFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="invoiceSubmit" :loading="sendLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import util from '../../common/js/util'
	import pdf from 'vue-pdf'
	import qs from 'qs'
	import {getLodop} from '../../common/js/LodopFuncs'
	//import NProgress from 'nprogress'
	import { userId, getOrderList, editOrder, removeOrder, getOrderDetail, editOrderDetail, getProviderList, getPurchaserList, getPurchaserListByRole, fileOrderUpload} from '../../api/api';

	var LODOP
	export default {
		components:
		{
			pdf
		},
		data() {
			return {
				//a4纸
				height:1089,
				pageSize:20,
				pages:0,

				purchasers:[],
				buyers:[],
				stockers:[],
				filters: {
					cdSn: '',
					providerId: '',
					demander: '',
					status: ''
				},
				status:[
					{
						value:1,
						label:this.getStrByStatus(1)
					},
					{
						value:2,
						label:this.getStrByStatus(2)
					},
					{
						value:3,
						label:this.getStrByStatus(3)
					},
					{
						value:4,
						label:this.getStrByStatus(4)
					},
					{
						value:5,
						label:this.getStrByStatus(5)
					},
					{
						value:6,
						label:this.getStrByStatus(6)
					},
					{
						value:9,
						label:this.getStrByStatus(9)
					}

				],
				orders: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列
				selectStatus: 0,//选中列的订单状态

				//图片上传
				uploadFlag: false,
				uploadPercent:0,

				//送货单界面
				deliveryOrderVisible: false,//查看页面是否显示

				//查看页面
				itemListVisible: false,//查看页面是否显示
				itemsLoading: false,
				items: [],//物料列表

				//进货界面
				buyFormVisible: false,//发货界面是否显示
				buyLoading: false,
				//进货界面数据
				buyForm: {},

				//发货界面
				sendFormVisible: false,//发货界面是否显示
				sendLoading: false,
				//发货界面数据
				sendForm: {},
				//校验规则
				sendFormRules: {
					// cdSn: [
					// 	{ required: true, message: '请填写订单编号', trigger: 'blur' }
					// ],
					// logisticsSn: [
					// 	{ required: true, message: '请填写物流单号', trigger: 'blur' }
					// ],
					// fee: [
					// 	{ required: true, message: '请填写其他费用', trigger: 'blur' }
					// ],
					// remark: [
					// 	{ required: true, message: '请填写备注', trigger: 'blur' }
					// ]
				},

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				//编辑界面数据
				editForm: {
				},

				//开票界面
				invoiceFormVisible: false,//开票界面是否显示
				invoiceLoading: false,
				//开票界面数据
				invoiceForm: {},
				//校验规则
				invoiceFormRules: {
					invoiceSn: [
						{ required: true, message: '请填写发票号', trigger: 'blur' }
					],
					money: [
						{ required: true, message: '请填写发票金额', trigger: 'blur' }
					],
				},

				//补单界面
				repairFormVisible: false,//补单界面是否显示
				repairLoading: false,
				//补单界面数据
				repairForm: {
					cdSn: 'CD',
					qgSn: 'QG',
					purchaserId: '',
					buyerId: '',
					stockerId: '',
					org: '广西区域'
				},
				//校验规则
				repairFormRules: {
					cdSn: [
						{ required: true, message: '请输入订单编号', trigger: 'blur' },
						{ min: 12, message: '请输入12位订单编号'}
					],
					qgSn: [
						{ required: true, message: '请输入请购编号', trigger: 'blur' },
						{ min: 12, message: '请输入12位请购编号'}
					],
					purchaserId: [
						{ required: true, message: '请选择请购人', trigger: 'blur', type: 'number' }
					],
					buyerId: [
						{ required: true, message: '请选择采购员', trigger: 'blur', type: 'number' }
					],
					stockerId: [
						{ required: true, message: '请选择仓库签字人', trigger: 'blur', type: 'number' }
					]
				},

				spanArr:[],

				providers:[],
			}
		},
		methods: {
			//状态转化
			formatStatus: function (row, column) {
				return this.getStrByStatus(row.status);
			},
			//下单日期转化
			formatDate: function (row, column) {
				// return util.formatDate.format(new Date(row.createTime),"yyyy-MM-dd");
				return new Date(row.createTime).toLocaleDateString();
			},
			//下单日期转化
			formatDeliveryDate: function (row, column) {
				// return util.formatDate.format(new Date(row.createTime),"yyyy-MM-dd");
				return new Date(row.deliveryTime).toLocaleDateString();
			},
			//上传pdf
			uploadPdf(content){
		    	this.uploadPercent = 0;
			    this.uploadFlag = true;
			    let _this = this;
			    clearInterval(this.time);
			    this.time = setInterval(function(){  
		           if(_this.uploadPercent<100){
		               _this.uploadPercent += 25;//进程条
		           }else{                 
		           }          
		        },100)

		    	var formData = new FormData();
		    	formData.append("file", content.file);
		    	fileOrderUpload(formData).then((res) => {
			        this.uploadFlag = false;
					this.editForm.url = res.data.data;
		    	});
		    },
			//获取请购人列表
			getPurchasers() {
				let para = {
					role: 1
				};
				getPurchaserListByRole(para).then((res) => {
					this.purchasers = res.data.data.list
				});
			},
			//获取采购员列表
			getBuyers() {
				let para = {
					role: 2
				};
				getPurchaserListByRole(para).then((res) => {
					this.buyers = res.data.data.list
				});
			},
			//获取仓库签字人列表
			getStockers() {
				let para = {
					role: 3
				};
				getPurchaserListByRole(para).then((res) => {
					this.stockers = res.data.data.list
				});
			},
			getStrByStatus(status){
				let statusStr = '';
				if(status == 1){
					statusStr="备货中";
				}else if (status == 2){
					statusStr="待发货";
				}else if (status == 3){
					statusStr="待入库";
				}else if (status == 4){
					statusStr="待开票";
				}else if (status == 5){
					statusStr="待回款";
				}else if (status == 6){
					statusStr="已回款";
				}else if (status == 9){
					statusStr="提前送货";
				}
				return statusStr;
			},
			//多选可选控制
			checkSelectable(row){
				if(this.sels.length == 0){
					return true;
				}else{
					return this.selectStatus === row.status;
				}
			},
			//分页
			handleCurrentChange(val) {
				this.page = val;
				this.getOrders();
			},
			//获取供应商列表
			getProviders() {
				let para = {
				};
				getProviderList(para).then((res) => {
					this.providers = res.data.data.list
				});
			},
			//获取订单列表
			getOrders() {
				let para = {
					page:this.page,
                    size:20,
                    cdSn:this.filters.cdSn,
                    providerId:this.filters.providerId,
                    demander:this.filters.demander,
                    status:this.filters.status
				};
				this.listLoading = true;
				//NProgress.start();
				getOrderList(para).then((res) => {
					this.orders = res.data.data.list
                    this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
                    this.total = res.data.data.total
					this.listLoading = false
					//NProgress.done();
				});
			},
			//根据订单号获取物料签价列表
			getItemsByOrderId(orderId) {
				let para = { 
					id: orderId 
				};
				this.itemsLoading = true;
				getOrderDetail(qs.stringify(para)).then((res) => {
					this.items = res.data.data
					this.getSpanArr(res.data.data);
					this.itemsLoading = false;
				});
			},
			//查看送货单
			handleDeliveryOrder: function(index, row){
				this.getItemsByOrderId(row.id)
				this.deliveryOrderVisible = true
				this.sendForm = Object.assign({}, row);
			},
			//查看物料详情
			handleView: function(index, row){
				this.getItemsByOrderId(row.id)
				this.itemListVisible = true
				this.sendForm = Object.assign({}, row);
				this.buyForm = Object.assign({}, row);
			},
			//打印
			handleItemPrint: function (index, row) {
				let newWindow=""
    			if(row.imgurl.endsWith('.pdf')){
				    window.open(row.imgurl);
    			}else{
    				var printHtml = "<img src='" + row.imgurl + "' />";
					newWindow = window.open("",'newwindow');
					newWindow.document.body.innerHTML = printHtml;
					setTimeout(function(){ newWindow.print();}, 500);
    			}
    		},
    		handlePdfPrint: function (index, row) {
    			window.open(row.url);
    		},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { id: row.id, status: 0 };
					editOrder(qs.stringify(para)).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getOrders();
					});
				}).catch(() => {

				});
			},
			//显示备注界面
			handleRemark: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			//编辑
			editSubmit: function () {
				this.editLoading = true;
				let para = { 
					id: this.editForm.id, 
					remark: this.editForm.remark,
					url: this.editForm.url 
				};
				editOrder(qs.stringify(para)).then((res) => {
					this.editLoading = false;
					this.$message({
						message: '提交成功',
						type: 'success'
					});
					this.getOrders();
					this.$refs['editForm'].resetFields();
					this.editFormVisible = false;
				});
			},

			//跳转新增页面
			handleAdd: function () {
				this.$router.push({path: '/order/add'});
			},
			//显示进货界面
			handleBuy: function (){
				this.itemListVisible = false;
				this.buyFormVisible = true;
				this.items = this.sels;
			},
			//进货提交处理
			buySubmit: function () {
				this.buyForm.cdSn = this.sendForm.cdSn;
				this.buyForm.orderItemList = this.items;
				this.buyForm.status = 2;
				this.$confirm('确认提交吗？', '提示', {}).then(() => {
					this.buyLoading = true;
					//NProgress.start();
					editOrderDetail(this.buyForm).then((res) => {
						this.buyLoading = false;
						//NProgress.done();
						this.$message({
							message: '提交成功',
							type: 'success'
						});
						this.getOrders();
						this.$refs['buyForm'].resetFields();
						this.buyFormVisible = false;
					});
				});
			},
			//显示编辑界面
			handleSend: function (){
				this.itemListVisible = false;
				this.sendFormVisible = true;
				this.items = this.sels;
			},
			//发货提交处理
			sendSubmit: function () {
				this.$refs.sendForm.validate((valid) => {
					if (valid) {
						this.sendForm.orderItemList = this.items;
						this.sendForm.status = 3;
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.sendLoading = true;
							//NProgress.start();
							// let para = Object.assign({}, this.sendForm);
							editOrderDetail(this.sendForm).then((res) => {
								this.sendLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.getOrders();
								this.$refs['sendForm'].resetFields();
								this.sendFormVisible = false;
							});
						});
					}
				});
			},
			//入库处理
			handleIn: function () {
				this.sendForm.status = 4;
				this.sendForm.itemList = this.sels;
				this.$confirm('确认提交吗？', '提示', {}).then(() => {
					this.sendLoading = true;
					editOrderDetail(this.sendForm).then((res) => {
						this.sendLoading = false;
						//NProgress.done();
						this.$message({
							message: '提交成功',
							type: 'success'
						});
						this.getOrders();
						this.$refs['sendForm'].resetFields();
					});
				});
			},
			//显示补单界面
			handleRepair: function(){
				this.getPurchasers();
				this.getStockers();
				this.getBuyers();
				this.itemListVisible = false;
				this.repairFormVisible = true;
				this.items = this.sels;
			},
			//补单提交处理
			repairSubmit: function () {
				this.$refs.repairForm.validate((valid) => {
					if (valid) {
						this.repairForm.id = this.items[0].orderId;
						this.repairForm.status = 3;
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.repairLoading = true;
							editOrder(this.repairForm).then((res) => {
								this.repairLoading = false;
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.getOrders();
								this.$refs['repairForm'].resetFields();
								this.repairFormVisible = false;
							});
						});
					}
				});
			},
			//显示开票界面
			handleInvoice: function (){
				this.itemListVisible = false;
				this.invoiceFormVisible = true;
				this.items = this.sels;
			},
			//开票提交处理
			invoiceSubmit: function () {
				this.$refs.invoiceForm.validate((valid) => {
					if (valid) {
						this.invoiceForm.orderId = this.sendForm.id;
						this.invoiceForm.itemList = this.items;
						this.invoiceForm.status = 5;
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.invoiceLoading = true;
							editOrderDetail(this.sendForm).then((res) => {
								this.invoiceLoading = false;
								//NProgress.done();
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.getOrders();
								this.$refs['invoiceForm'].resetFields();
								this.invoiceFormVisible = false;
							});
						});
					}
				});
			},
			
			//多选
			selsChange: function (sels) {
				this.sels = sels;
				if(sels.length != 0){
					this.selectStatus = sels[0].status;
				}
			},
			//处理物料数量
			handleBidPriceChange: function(index, row, e){
				row.bidPrice = Number(e);
			},

			//
			getSpanArr(data){
				let contactDot = 0;
				this.spanArr=[];
		        data.forEach( (item,index) => {
		            if(index===0){
		                this.spanArr.push(1)
		            }else{
		                if(item.logisticsSn!='' && item.logisticsSn === data[index-1].logisticsSn){
		                    this.spanArr[contactDot] += 1;
		                    this.spanArr.push(0)
		                }else{
		                    contactDot = index
		                    this.spanArr.push(1)
		                }
		            }
		        })
			},
			//
			objectSpanMethod({row, column, rowIndex, columnIndex}){
		        if(columnIndex === 11){
		            if(this.spanArr[rowIndex]){
		                return {
		                    rowspan:this.spanArr[rowIndex],
		                    colspan:1
		                }
		            }else{
		                return {
		                    rowspan: 0,
		                    colspan: 0
		                }
		            }
		        }
		    },
		    //初始化送货单
		    initPrintData:function(){
		    	this.pages = Math.ceil(this.sels.length / this.pageSize);
		    	//规定纸张大小；使用A4纸
				LODOP.SET_PRINT_PAGESIZE(1,0,0,"A4");
				for(let currentPage=0; currentPage<this.pages; currentPage++){
					this.drawSendOrder(currentPage);
				}
		    },
		    //送货单分页
		    drawSendOrder:function(page){
		    	LODOP.ADD_PRINT_TEXT(page*this.height+77,326,104,30,"送 货 单");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",16);
				LODOP.SET_PRINT_STYLEA(0,"Bold",1);
				LODOP.ADD_PRINT_TEXT(page*this.height+124,96,445,25,"发票抬头：");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Bold",1);
				LODOP.ADD_PRINT_TEXT(page*this.height+124,176,550,25,this.sendForm.demander);
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Bold",1);
				LODOP.ADD_PRINT_TEXT(page*this.height+149,96,275,25,"供应商：");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Bold",1);
				LODOP.ADD_PRINT_TEXT(page*this.height+149,160,275,25,this.sendForm.provider);
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Bold",1);
				LODOP.ADD_PRINT_TEXT(page*this.height+149,430,275,25,"送货时间：");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
				LODOP.SET_PRINT_STYLEA(0,"Bold",1);
				LODOP.ADD_PRINT_TEXT(page*this.height+149,500,275,25,util.formatDate.format(new Date(),"yyyy-MM-dd"));
				LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
				LODOP.SET_PRINT_STYLEA(0,"Bold",1);
				LODOP.ADD_PRINT_TEXT(page*this.height+174,430,275,24,"订单编号：");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
				LODOP.SET_PRINT_STYLEA(0,"Bold",1);
				LODOP.ADD_PRINT_TEXT(page*this.height+174,500,275,24,this.sendForm.cdSn);
				LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
				LODOP.SET_PRINT_STYLEA(0,"Bold",1);

				LODOP.ADD_PRINT_TEXT(page*this.height+213,95,50,25,"序号");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
				LODOP.ADD_PRINT_TEXT(page*this.height+213,145,80,25,"产品编号");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
				LODOP.ADD_PRINT_TEXT(page*this.height+213,225,130,25,"名称及规格");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
				LODOP.ADD_PRINT_TEXT(page*this.height+213,355,55,25,"单位");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
				LODOP.ADD_PRINT_TEXT(page*this.height+213,410,60,25,"数量");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
				LODOP.ADD_PRINT_TEXT(page*this.height+213,470,60,25,"单价");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
				LODOP.ADD_PRINT_TEXT(page*this.height+213,530,80,25,"金额");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
				LODOP.ADD_PRINT_TEXT(page*this.height+213,610,90,25,"备注");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.SET_PRINT_STYLEA(0,"Alignment",2);

				//线，竖杠(上边距1,1左边距,上边距2,2左边距,intLineStyle, intLineWidth)
				//intLineStyle:线条类型，默认为0；0--实线 1--破折线 2--点线 3--点划线 4--双点划线
		        //intLineWidth:线条宽，默认是1，整数型，单位是(打印)像素，非实线的线条宽也是0。
				LODOP.ADD_PRINT_LINE(page*this.height+210,95,page*this.height+210,700,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+210,95,page*this.height+233,95,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+210,145,page*this.height+233,145,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+210,225,page*this.height+233,225,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+210,355,page*this.height+233,355,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+210,410,page*this.height+233,410,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+210,470,page*this.height+233,470,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+210,530,page*this.height+233,530,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+210,610,page*this.height+233,610,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+210,700,page*this.height+233,700,0,1);
				
				//--行内容
				let sum = 0;
				let restCount = this.sels.length - page*this.pageSize;
				for (let j = page*this.pageSize; j <  (restCount<this.pageSize?this.sels.length:this.pageSize*(page+1)); j++) {
					let i = j+1;
					let item = this.sels[j];
					LODOP.ADD_PRINT_TEXT(page*this.height+213+25*i-500*page,95,50,20,i);
					LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
					LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
					//编号
					LODOP.ADD_PRINT_TEXT(page*this.height+213+25*i-500*page,145,80,25,item.itemNumber);
					LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
					LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
					//名称
					LODOP.ADD_PRINT_TEXT(page*this.height+213+25*i-500*page,225,130,25,item.name);
					LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
					LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
					//单位
					LODOP.ADD_PRINT_TEXT(page*this.height+213+25*i-500*page,355,55,25,item.unit);
					LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
					LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
					//数量
					LODOP.ADD_PRINT_TEXT(page*this.height+213+25*i-500*page,410,60,25,item.count);
					LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
					LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
					//单价
					LODOP.ADD_PRINT_TEXT(page*this.height+213+25*i-500*page,470,60,25,util.formatNumber(item.price));
					LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
					LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
					//总金额
					LODOP.ADD_PRINT_TEXT(page*this.height+213+25*i-500*page,530,80,25,util.formatNumber(item.count*item.price));
					LODOP.SET_PRINT_STYLEA(0,"FontSize",10);
					LODOP.SET_PRINT_STYLEA(0,"Alignment",2);
					sum += (item.count*item.price);
				}
				sum = util.formatNumber(sum);
				//格子画线
				let j = this.pageSize;
				for (let i = 1; i <= j; i++) {
					LODOP.ADD_PRINT_LINE(page*this.height+208+25*i,95,page*this.height+208+25*i,701,0,1);
					LODOP.ADD_PRINT_LINE(page*this.height+208+25*i,95,page*this.height+233+25*i,95,0,1);
					LODOP.ADD_PRINT_LINE(page*this.height+208+25*i,145,page*this.height+233+25*i,145,0,1);
					LODOP.ADD_PRINT_LINE(page*this.height+208+25*i,225,page*this.height+233+25*i,225,0,1);
					LODOP.ADD_PRINT_LINE(page*this.height+208+25*i,355,page*this.height+233+25*i,355,0,1);
					LODOP.ADD_PRINT_LINE(page*this.height+208+25*i,410,page*this.height+233+25*i,410,0,1);
					LODOP.ADD_PRINT_LINE(page*this.height+208+25*i,470,page*this.height+233+25*i,470,0,1);
					LODOP.ADD_PRINT_LINE(page*this.height+208+25*i,530,page*this.height+233+25*i,530,0,1);
					LODOP.ADD_PRINT_LINE(page*this.height+208+25*i,610,page*this.height+233+25*i,610,0,1);
					LODOP.ADD_PRINT_LINE(page*this.height+208+25*i,700,page*this.height+233+25*i,700,0,1);

				}
				LODOP.ADD_PRINT_LINE(page*this.height+233+25*j,95,page*this.height+233+25*j,701,0,1);
				//合计
				LODOP.ADD_PRINT_LINE(page*this.height+233+25*j,95,page*this.height+258+25*j,95,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+233+25*j,145,page*this.height+258+25*j,145,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+233+25*j,225,page*this.height+258+25*j,225,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+233+25*j,355,page*this.height+258+25*j,355,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+233+25*j,410,page*this.height+258+25*j,410,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+233+25*j,470,page*this.height+258+25*j,470,0,1);
				LODOP.ADD_PRINT_TEXT(page*this.height+238+25*j,470,300,25,"合计："+ sum +"元");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.ADD_PRINT_LINE(page*this.height+233+25*j,700,page*this.height+258+25*j,700,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+258+25*j,95,page*this.height+258+25*j,701,0,1);

				//大写
				let k=j+1;
				LODOP.ADD_PRINT_LINE(page*this.height+233+25*k,95,page*this.height+258+25*k,95,0,1);
				LODOP.ADD_PRINT_TEXT(page*this.height+238+25*k,250,400,25,"大写人民币："+ util.DX(sum));
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.ADD_PRINT_LINE(page*this.height+233+25*k,700,page*this.height+258+25*k,700,0,1);
				LODOP.ADD_PRINT_LINE(page*this.height+258+25*k,95,page*this.height+258+25*k,701,0,1);

				//表尾
				LODOP.ADD_PRINT_TEXT(page*this.height+790,95,194,25,"供应商联系人： 杨世琪");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.ADD_PRINT_TEXT(page*this.height+790,445,172,25,"联系电话：18378996547");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.ADD_PRINT_TEXT(page*this.height+816,95,300,25,"送货方地址：贵港市金田路213号");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.ADD_PRINT_TEXT(page*this.height+875,95,300,25,"供应商盖章：");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.ADD_PRINT_TEXT(page*this.height+836,445,107,25,"仓库签名：");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.ADD_PRINT_TEXT(page*this.height+836,580,109,25,"请购人签名：");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.ADD_PRINT_TEXT(page*this.height+875,445,94,25,"收货日期：");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
				LODOP.ADD_PRINT_TEXT(page*this.height+875,580,96,25,"收货日期：");
				LODOP.SET_PRINT_STYLEA(0,"FontSize",11);
		    },
		    handlePrint: function(){
		    	LODOP=getLodop();  
				this.initPrintData();
				// if(LODOP.SET_PRINTER_INDEX(1));
				LODOP.PREVIEW();//打印预览
		    },
		    handleDesign: function(){
		    	LODOP=getLodop();  
				this.initPrintData();
				LODOP.PRINT_DESIGN();//打印设计	
		    }
		},
		mounted() {
			let res = this.$route.query.relatedResponse;
			if(res == undefined){
				this.getOrders();
			}else{
				this.orders = res.data.data.list
                this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
            	this.total = res.data.data.total
			}
			
			this.getProviders();
		}
	}

</script>

<style scoped>
  .demo-table-expand {
    font-size: 0;
  }
  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }
  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }

  .avatar-uploader{
 	width: 178px;
    height: 178px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
  .signImg {
    width: 50px;
    height: 80px;
  }
  .el-upload {
  	margin-left: 25px;
  }
</style>