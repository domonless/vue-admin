<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item prop="providerId">
					<el-select v-model="filters.providerId" filterable placeholder="供货商" @change="getOrders" clearable >
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
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="orders" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column type="expand">
		      <template slot-scope="props">
		        <el-form label-position="left" inline class="demo-table-expand">
		          <el-form-item label="采购组织:">
		            <span>{{ props.row.area }}</span>
		          </el-form-item>
		          <el-form-item label="采购员:">
		            <span>{{ props.row.purchaser }}</span>
		          </el-form-item>
		        </el-form>
		      </template>
		    </el-table-column>
			<el-table-column prop="cdSn" label="订单编号" width="140" sortable>
			</el-table-column>
			<el-table-column prop="demander" label="需求公司" width="400" sortable>
			</el-table-column>
			<el-table-column prop="provider" label="供货商" width="300" >
			</el-table-column>
			<el-table-column prop="sum" label="总金额" width="90">
			</el-table-column>
			<el-table-column prop="remark" label="备注" width="150">
			</el-table-column>
			<el-table-column label="操作" width="80">
				<template scope="scope">
					<el-button type="primary" size="small" @click="handleView(scope.$index, scope.row)" icon="el-icon-search"></el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="warning" @click="handleInvoice" :disabled="this.sels.length===0">发票填开</el-button>
			<el-pagination layout="total, prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--查看界面-->
		<el-dialog title="查看" :visible.sync="itemListVisible" :close-on-click-modal="false">
			<el-table :data="items" ref="viewTable" highlight-current-row v-loading="itemsLoading" style="width: 100%;" >
			    <el-table-column  type="index" width="55">
				</el-table-column>
				<el-table-column prop="itemNumber" label="编号" width="65">
				</el-table-column>
				<el-table-column prop="name" label="物料名称" width="150">
				</el-table-column>
				<el-table-column prop="brand" label="品牌" width="60">
				</el-table-column>
				<el-table-column prop="form" label="规格" width="300">
				</el-table-column>
				<el-table-column prop="unit" label="单位" width="60">
				</el-table-column>
				<el-table-column prop="price" label="单价" width="70">
				</el-table-column>
				<el-table-column prop="count" label="数量" width="65">
				</el-table-column>
			</el-table>
		</el-dialog>

		<!--开票界面-->
		<el-dialog title="开票" :visible.sync="invoiceFormVisible" :close-on-click-modal="false">
			<el-form :model="invoiceForm" label-width="80px" :rules="invoiceFormRules" ref="invoiceForm" >
				<el-form-item label="发票号" prop="invoiceSn">
					<el-input v-model="invoiceForm.invoiceSn"></el-input>
				</el-form-item>
				<el-form-item label="发票金额" prop="money">
					<el-input type="number" v-model="invoiceForm.money" :maxlength="10"></el-input>
				</el-form-item>
				<el-form-item label="填开日期" prop="invoiceDate">
					<el-date-picker type="date" placeholder="选择日期" v-model="invoiceForm.invoiceDate" value-format="yyyy-MM-dd"  format="yyyy-MM-dd"></el-date-picker>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
					<el-input type="textarea" v-model="invoiceForm.remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="invoiceFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="invoiceSubmit" :loading="invoiceLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import util from '../../common/js/util'
	import { getOrderList, getOrderDetail, editOrderDetail, getProviderList, getPurchaserList, addInvoice} from '../../api/api';

	export default {
		data() {
			return {
				pageSize:20,
				pages:0,

				filters: {
					providerId: '',
					demander: ''
				},
				orders: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列

				//查看页面
				itemListVisible: false,//查看页面是否显示
				itemsLoading: false,
				items: [],//物料列表

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
				providers:[],

			}
		},
		methods: {
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
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.providers = res.data.data.list
					}
				});
			},

			//获取订单列表
			getOrders() {
				let para = {
					page:this.page,
                    size:20,
                    providerId:this.filters.providerId,
                    demander:this.filters.demander,
                    status:4
				};
				this.listLoading = true;
				getOrderList(para).then((res) => {
					this.listLoading = false
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
	                	this.orders = res.data.data.list
	                    this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
	                    this.total = res.data.data.total
	                }
				});
			},

			//根据订单号获取物料签价列表
			getItemsByOrderId(orderId) {
				let para = { 
					id: orderId 
				};
				this.itemsLoading = true;
				getOrderDetail(para).then((res) => {
					this.itemsLoading = false;
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.items = res.data.data
					}
				});
			},

			//查看物料详情
			handleView: function(index, row){
				this.getItemsByOrderId(row.id)
				this.itemListVisible = true
			},

			//显示开票界面
			handleInvoice: function (){
				this.invoiceFormVisible = true;
			},

			//开票提交处理
			invoiceSubmit: function () {
				this.$refs.invoiceForm.validate((valid) => {
					if (valid) {
						//处理订单号
						let orderIds=[]
						for(let i=0;i<this.sels.length;i++){
							orderIds.push(this.sels[i].id);
						}
						this.invoiceForm.orderIdList = orderIds;
						this.invoiceForm.status = 5;
						this.invoiceForm.providerId = this.sels[0].providerId;
						this.invoiceForm.demanderId = this.sels[0].demanderId;
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.invoiceLoading = true;
							addInvoice(this.invoiceForm).then((res) => {
								this.invoiceLoading = false;
								this.invoiceFormVisible = false;
								let msg = res.data.message;
			                	let code = res.data.code;
								if (code !== 200) {
				                  this.$message({
				                    message: msg,
				                    type: 'error'
				                  });
				                } else {
								//NProgress.done();
									this.$message({
										message: '提交成功',
										type: 'success'
									});
									this.getOrders();
									this.$refs['invoiceForm'].resetFields();
								}
							});
						});
					}
				});
			},
			
			//多选
			selsChange: function (sels) {
				this.sels = sels;
			},
		},
		mounted() {
			this.getProviders();
			this.getOrders();
		}
	}

</script>

