<template>
	<section>
		<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm" :inline="true">
			<br>
			<el-form-item label="供应商" prop="providerId">
				<el-select v-model="addForm.providerId" placeholder="请选择" @change="providerChangeHandler" clearable>
				    <el-option
				      v-for="item in providers"
				      :key="item.id"
				      :label="item.name"
				      :value="item.id">
				    </el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="需求公司" prop="demanderId">
				<el-select v-model="addForm.demanderId" filterable placeholder="请选择" clearable>
				    <el-option
				      v-for="item in demanders"
				      :key="item.id"
				      :label="item.name"
				      :value="item.id">
				    </el-option>
			  	</el-select>
			</el-form-item>
			<br>
			<el-form-item label="备注" prop="remark">
				<el-input type="textarea" placeholder="采购、请购人、区域" v-model="addForm.remark" clearable></el-input>
			</el-form-item>
			
			<el-button type="primary" :disabled="!this.addForm.providerId" @click="showItemList">物料列表</el-button>

			<!-- 订单物料列表 -->
			<el-form-item label="物料列表" prop="itemList">
				<el-table :data="addForm.itemList" border fit highlight-current-row>
					<el-table-column type="index" label="序号" width="70">
					</el-table-column>
					<el-table-column prop="itemNumber" label="编号" width="100" sortable>
					</el-table-column>
					<el-table-column prop="name" label="名称" width="120" sortable>
					</el-table-column>
					<el-table-column prop="brand" label="品牌" width="100">
					</el-table-column>
					<el-table-column prop="form" label="规格" width="200">
					</el-table-column>
					<el-table-column prop="unit" label="单位" width="80">
					</el-table-column>
					<el-table-column prop="price" label="价格" width="80">
					</el-table-column>
					<el-table-column prop="count" label="数量" width="80">
					</el-table-column>
					<el-table-column prop="startTime" label="起始日期" width="120">
					</el-table-column>
					<el-table-column prop="endTime" label="截止日期" width="120">
					</el-table-column>
					<el-table-column label="操作" width="150">
						<template scope="scope">
							<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
						</template>
					</el-table-column>
	            </el-table>
        	</el-form-item>
			<br>
        	<el-form-item label="总数量">
				<b>{{count}}</b>
			</el-form-item>
			<el-form-item label="总金额" prop="sum">
				<span><b>{{addForm.sum}}</b> &nbsp;RMB</span>
			</el-form-item>
		</el-form>

		<div slot="footer" class="dialog-footer" align="middle" style="margin-top:30px">
			<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交订单</el-button>
			<el-button type="warning" @click.native="backList">返回列表</el-button>
		</div>

		<!--物料列表界面-->
		<el-dialog title="物料列表" :visible.sync="itemsVisible" :close-on-click-modal="false" >
			<el-input v-model="filters.name" placeholder="按名称或编号搜索" @input="getItems" style="margin-bottom:20px"></el-input>
			提示: 输入数量后按回车键即可添加，默认数量为1个
			<!--列表-->
			<el-table :data="items" highlight-current-row v-loading="itemsLoading" style="width: 100%;margin-top:10px" height="500">
			    <el-table-column prop="itemNumber" label="编号" width="70">
				</el-table-column>
				<el-table-column prop="name" label="名称" width="120">
				</el-table-column>
				<el-table-column prop="brand" label="品牌" width="80">
				</el-table-column>
				<el-table-column prop="form" label="规格" width="200">
				</el-table-column>
				<el-table-column prop="unit" label="单位" width="70">
				</el-table-column>
				<el-table-column prop="price" label="价格" width="80">
				</el-table-column>
				<el-table-column prop="endTime" label="到期日期" width="95" :formatter="formatDate">
				</el-table-column>
				<el-table-column prop="count" label="数量" width="100">
					<template scope="scope">
						<el-input type="number" size="mini" min="1" :key="scope.row.id" @change="handleItemCountChange(scope.$index, scope.row, $event)" @keyup.enter.native="handleAdd(scope.$index, scope.row)"></el-input>
					</template>
				</el-table-column>
			</el-table>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-dialog>
	</section>
</template>

<script>
	import util from '../../common/js/util'
	//import NProgress from 'nprogress'
	import { addOrder, getItemList, getProviderList, getDemanderList} from '../../api/api';
	export default {
		data() {
			return {
				addLoading: false,
				itemsLoading: false,
				itemsVisible: false,
				items: [],
				total: 0,
				page: 1,
				filters: {
					name: '',
					providerId: ''
				},

				//供应商
				providers: [],

				//需求公司
				demanders: [],

				//请购人
				purchasers: [],

				//采购员
				buyers: [],

				//仓库
				stockers: [],

				//校验规则
				addFormRules: {
					providerId: [
						{ required: true, message: '请选择供应商', trigger: 'blur', type: 'number'}
					],
					demanderId: [
						{ required: true, message: '请选择需求公司', trigger: 'blur', type: 'number'}
					],
					remark: [
						{ required: true, message: '请备注相应采购、请购人、区域', trigger: 'blur'}
					]
				},

				//新增界面数据
				addForm: {
					status: 9,
					cdSn: '',
					qgSn: '',
					providerId: '',
					demanderId: '',
					purchaserId: 0,
					buyerId: 0,
					stockerId: 0,
					sum: 0,
					org: '广西区域',
					itemList: []
				},
				count:0
			}
		},
		methods: {
			formatDate: function (row, column) {
				return util.formatDate.format(new Date(row.endTime),"yyyy-MM-dd");
			},
			//获取物料倩价列表
			getItems() {
				let para = {
					page:this.page,
                    size:20,
					name: this.filters.name,
					providerId:this.filters.providerId	
				};
				this.itemsLoading = true;
				//NProgress.start();
				getItemList(para).then((res) => {
					this.itemsLoading = false;
					let msg = res.data.msg;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.items = res.data.data.list
						this.total = res.data.data.total
						//NProgress.done();
					}
				});
			},
			//获取供应商列表
			getProviders() {
				let para = {
				};
				getProviderList(para).then((res) => {
					let msg = res.data.msg;
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
			//获取需求公司列表
			getDemanders() {
				let para = {
				};
				getDemanderList(para).then((res) => {
					let msg = res.data.msg;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.demanders = res.data.data.list
					}
				});
			},

			//新增订单
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						if(this.addForm.itemList.length == 0){
							this.$message({
				              message: '请添加订单所需物料',
				              type: 'error'
				            });
				            return false;
						}
						//NProgress.start();
						this.addLoading = true;
						addOrder(this.addForm).then((res) => {
							//NProgress.done();
							this.addLoading = false;
							let msg = res.data.msg;
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
								this.$refs['addForm'].resetFields();
							}
						});
					}
				});
			},
			//返回列表
			backList: function(){
				this.$router.push({path: '/order/list'});
			},

			//弹出物料列表
			showItemList: function(){
				this.getItems();
				this.itemsVisible = true;
			},

			handleCurrentChange(val) {
				this.page = val;
				this.getItems();
			},

			//将物料加入订单
			handleAdd: function (index, row) {
				//默认数量为1
				if(row.count == 0){
					row.count++;
				}
				//加入订单队列
				this.addForm.itemList.push(row);
				//计算金额
				let sum = this.addForm.sum + (row.price * row.count);
				this.count += row.count;
				this.addForm.sum = util.formatNumber(sum);
			},

			//将物料从订单移除
			handleDel: function(index, row){
				//移除订单列表
				this.addForm.itemList.splice(index,1);
				//计算金额
				let sum = this.addForm.sum - (row.price * row.count);
				this.count -= row.count;
				this.addForm.sum = util.formatNumber(sum);
			},
			//处理物料数量
			handleItemCountChange: function(index, row, e){
				row.count = Number(e);
			},
			providerChangeHandler(){
				this.filters.providerId = this.addForm.providerId
			}
		},
		mounted() {
			this.getProviders();
			this.getDemanders();
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
</style>