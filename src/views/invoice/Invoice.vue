<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.invoiceSn" placeholder="发票号" @input="getInvoices" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.money" placeholder="发票金额" @input="getInvoices" clearable></el-input>
				</el-form-item>
				<el-form-item prop="providerId">
					<el-select v-model="filters.providerId" filterable placeholder="供货商" @change="getInvoices" clearable >
					    <el-option
					      v-for="item in providers"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.demander" placeholder="需求公司" @input="getInvoices" clearable></el-input>
				</el-form-item>
				<el-form-item prop="status">
					<el-select v-model="filters.status" placeholder="是否回款" @change="getInvoices" clearable >
					    <el-option
					      v-for="item in status"
					      :key="item.value"
					      :label="item.label"
					      :value="item.value">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getInvoices" >查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="invoices" show-summary highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column prop="invoiceSn" label="发票号" width="120" :formatter="formatInvoiceSn">
			</el-table-column>
			<el-table-column prop="money" label="发票金额" width="90">
			</el-table-column>
			<el-table-column prop="demander" label="需求公司" width="300">
			</el-table-column>
			<el-table-column prop="provider" label="供货商" width="100" :formatter="formatProvider">
			</el-table-column>
			<el-table-column prop="invoiceDate" label="填开日期" width="100">
			</el-table-column>
			<el-table-column prop="incomeDate" label="回款日期" width="100">
			</el-table-column>
			<el-table-column prop="remark" label="备注" width="200" >
			</el-table-column>
			<el-table-column label="操作" width="330">
				<template scope="scope">
					<el-button v-if="scope.row.incomeDate == undefined" type="warning" size="small" @click="handleReturn(scope.$index, scope.row)">回款</el-button>
					<el-button v-if="scope.row.incomeDate != undefined" size="small">已回款</el-button>
					<el-button v-if="scope.row.incomeDate == undefined" type="primary" size="small" @click="handleEdit(scope.$index, scope.row)" icon="el-icon-edit"></el-button>
					<el-button v-if="scope.row.incomeDate == undefined" type="danger" size="small" @click="handleDel(scope.$index, scope.row)" icon="el-icon-delete"></el-button>
					<el-button size="small" @click="handleRelated(scope.$index, scope.row)">相关订单</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="total, prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="发票号" prop="invoiceSn">
					<el-input v-model="editForm.invoiceSn"></el-input>
				</el-form-item>
				<el-form-item label="发票金额" prop="money">
					<el-input type="number" v-model="editForm.money" :maxlength="10"></el-input>
				</el-form-item>
				<el-form-item label="填开日期" prop="invoiceDate">
					<el-date-picker type="date" placeholder="选择日期" v-model="editForm.invoiceDate" value-format="yyyy-MM-dd"  format="yyyy-MM-dd"></el-date-picker>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
					<el-input type="textarea" v-model="editForm.remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '../../common/js/util'
	import { getInvoiceList, getProviderList, editInvoice, delInvoice, getOrdersByInvoiceId} from '../../api/api';

	export default {
		data() {
			return {
				//分页
				pageSize:20,
				pages:0,
				total: 0,
				page: 1,

				//筛选
				filters: {
					invoiceSn: '',
					money: '',
					providerId: '',
					demander: '',
					status:''
				},

				//发票列表
				invoices: [],
				listLoading: false,

				//编辑界面是否显示
				editFormVisible: false,
				editLoading: false,
				editFormRules: {
					invoiceSn: [
						{ required: true, message: '请输入发票号', trigger: 'blur' }
					],
					money: [
						{ required: true, message: '请输入发票金额', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
				},

				//回款数据
				returnForm: {
				},

				//供货商
				providers:[],

				status:[
					{
						value:0,
						label:'未回款'
					},
					{
						value:1,
						label:'已回款'
					}
				],
			}
		},
		methods: {
			//供货商转化
			formatProvider: function (row, column) {
				var reg1 = /(.+)区/g;
				var reg2 = /(.+)市/g;
				var reg3 = /有限公司(.+)/g;
				var reg4 = /经营部(.+)/g;
				var reg5 = /五金(.+)/g;
				var reg6 = /石材(.+)/g;
				console.log();
				return row.provider.replace(reg1,"").replace(reg2,"").replace(reg3,"").replace(reg4,"").replace(reg5,"").replace(reg6,"");
			},
			//发票号转化
			formatInvoiceSn: function(row, column){
				return "No." + row.invoiceSn;
			},

			//分页
			handleCurrentChange(val) {
				this.page = val;
				this.getInvoices();
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
			//获取发票列表
			getInvoices() {
				let para = {
					page:this.page,
                    size:20,
                    invoiceSn:this.filters.invoiceSn,
                    money:this.filters.money,
                    providerId:this.filters.providerId,
                    demander:this.filters.demander,
                    status:this.filters.status
				};
				this.listLoading = true;
				getInvoiceList(para).then((res) => {
					this.listLoading = false
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
	                	this.invoices = res.data.data.list
	                    this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
	                    this.total = res.data.data.total
	                }
				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			//编辑提交
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.editLoading = true;
						let para = { 
							id: this.editForm.id, 
							invoiceSn: this.editForm.invoiceSn,
							money: this.editForm.money,
							invoiceDate: this.editForm.invoiceDate
						};
						editInvoice(para).then((res) => {
							this.editLoading = false;
							this.editFormVisible = false;
							let msg = res.data.message;
		                	let code = res.data.code;
							if (code !== 200) {
			                  this.$message({
			                    message: msg,
			                    type: 'error'
			                  });
			                } else {
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.getInvoices();
								this.$refs['editForm'].resetFields();
							}
						});
					}
				});
			},
			//删除处理
			handleDel: function (index, row) {
				this.$confirm('确认删除吗？', '提示', {}).then(() => {
					delInvoice(row.id).then((res) => {
						let msg = res.data.message;
	                	let code = res.data.code;
						if (code !== 200) {
		                  this.$message({
		                    message: msg,
		                    type: 'error'
		                  });
		                } else {
							this.$message({
								message: '删除成功',
								type: 'success'
							});
							this.getInvoices();
						}
					});
				});
			},
			//回款处理
			handleReturn: function (index, row) {
				this.returnForm.id = row.id;
				this.$confirm('确认提交吗？', '提示', {}).then(() => {
					editInvoice(this.returnForm).then((res) => {
						let msg = res.data.message;
	                	let code = res.data.code;
						if (code !== 200) {
		                  this.$message({
		                    message: msg,
		                    type: 'error'
		                  });
		                } else {
							this.$message({
								message: '提交成功',
								type: 'success'
							});
							this.getInvoices();
							this.$refs['returnForm'].resetFields();
						}
					});
				});
			},
			//发票相关订单
    		handleRelated: function (index, row) {
    			let para = {
					page:this.page,
                    size:20,
                    invoiceId:row.id
				};
				getOrdersByInvoiceId(para).then((res) => {
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.$router.push({path: '/order/list', query: {relatedResponse: res}});
					}
				});
    		},

		},
		mounted() {
			this.getProviders();
			let res = this.$route.query.relatedResponse;
			if(res == undefined){
				this.getInvoices();
			}else{
				this.invoices = res.data.data.list
                this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
                this.total = res.data.data.total
			}
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