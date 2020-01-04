<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.detail" placeholder="开销明细" @input="getExpenses" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.money" placeholder="金额" @input="getExpenses" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getExpenses" >查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="warning" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="expenses" show-summary :summary-method="getSummaries" highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column type="index" label="序号" width="100">
			</el-table-column>
			<el-table-column prop="detail" label="开销明细" width="250">
			</el-table-column>
			<el-table-column prop="money" label="金额" width="120">
			</el-table-column>
			<el-table-column prop="createTime" label="登记时间" width="200">
			</el-table-column>
			<el-table-column label="操作" width="280">
				<template scope="scope">
					<el-button size="small" type="info" icon="fa fa-file-picture-o" :disabled="scope.row.imgurl==''" @click="showImg(scope.$index, scope.row)"></el-button>
					<el-button type="primary" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="开销明细" prop="detail">
					<el-input v-model="editForm.detail"></el-input>
				</el-form-item>
				<el-form-item label="金额" prop="money">
					<el-input type="number" v-model="editForm.money" :maxlength="10" ></el-input>
				</el-form-item>
				<el-form-item label="图片" prop="imgurl">
					<el-upload
					  class="avatar-uploader"
					  action=""
					  accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.JPG,.JPEG,.PBG,.GIF,.BMP"
					  :http-request="uploadImg"
					  :show-file-list="false">
					  <img v-if="editForm.imgurl && this.uploadFlag == false" :src="editForm.imgurl" class="avatar">
					  <i v-else-if="!editForm.imgurl && this.uploadFlag == false" class="el-icon-plus avatar-uploader-icon"></i>
					  <el-progress v-if="this.uploadFlag" type="circle" :percentage="uploadPercent" style="margin-top:30px;"></el-progress>
					</el-upload>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="开销明细" prop="detail">
					<el-input v-model="addForm.detail"></el-input>
				</el-form-item>
				<el-form-item label="金额" prop="money">
					<el-input type="number" v-model="addForm.money" :maxlength="10" ></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '../../common/js/util'
	import { getExpensesList, addExpenses, editExpenses, getExpensesSum, fileExpenseUpload } from '../../api/api';
	export default {
		data() {
			return {
				filters: {
					detail: '',
					money: ''
				},
				expenses: [],
				total: 0,
				page: 1,
				listLoading: false,

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					detail: [
						{ required: true, message: '请输入开销明细', trigger: 'blur' }
					],
					money: [
						{ required: true, message: '请输入金额', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					detail: [
						{ required: true, message: '请输入开销明细', trigger: 'blur' }
					],
					money: [
						{ required: true, message: '请输入金额', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
				},

				//图片上传
				uploadFlag: false,
				uploadPercent:0,
				//发票金额合计
				sums:['合计'],
				status:2,
			}
		},
		methods: {
			getSummaries(param) {
				return this.sums;
			},
			handleCurrentChange(val) {
				this.page = val;
				this.getExpenses();
			},
			//获取开支列表
			getExpenses() {
				let para = {
					page:this.page,
                    size:20,
                    detail:this.filters.detail,
                    money:this.filters.money,
                    status:this.status
				};
				this.listLoading = true;
				getExpensesSum(para).then((res) => {
					this.listLoading = false
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
	                	this.sums[1] = res.data.data+"元";
	                }
				});
				getExpensesList(para).then((res) => {
					this.listLoading = false;
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.expenses = res.data.data.list
	                    this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
	                    this.total = res.data.data.total
	                }
				});
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = {
						id: row.id,
						status: 0
					};
					editExpenses(para).then((res) => {
						this.listLoading = false;
						//NProgress.done();
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
							this.getExpenses();
						}
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = {
					id: row.id,
					detail: row.detail,
					money: row.money,
					imgurl: row.imgurl
				};
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					detail: '',
					money: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.editLoading = true;
						let para = Object.assign({}, this.editForm);
						editExpenses(para).then((res) => {
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
								this.getExpenses();
								this.$refs['editForm'].resetFields();
							}
						});
					}
				});
			},
			//新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.addLoading = true;
						this.addForm.status = this.status;
						let para = Object.assign({}, this.addForm);
						addExpenses(para).then((res) => {
							this.addLoading = false;
							this.addFormVisible = false;
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
								this.$refs['addForm'].resetFields();
								this.getExpenses();
							}
						});
					}
				});
			},

			//查看发票图片
    		showImg: function (index, row) {
    			window.open(row.imgurl);
    		},
    		//上传发票图片
    		uploadImg(content){
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
		    	fileExpenseUpload(formData).then((res) => {
			        this.uploadFlag = false;
			        let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.editForm.imgurl = res.data.data;
					}
		    	});
		    },

		},
		mounted() {
			this.getExpenses();
		}
	}

</script>

<style scoped>

</style>