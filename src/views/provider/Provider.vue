<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true">
				<el-form-item>
					<el-button type="warning" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="providers" highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column type="index" label="序号" width="70">
			</el-table-column>
			<el-table-column prop="name" show-overflow-tooltip label="名称" width="250">
			</el-table-column>
			<el-table-column prop="master" label="联系人" width="100">
			</el-table-column>
			<el-table-column prop="phone" label="联系电话" width="130">
			</el-table-column>
			<el-table-column prop="address" show-overflow-tooltip label="地址" width="400">
			</el-table-column>
			<el-table-column prop="loginname" label="招采账号" width="100">
			</el-table-column>
			<el-table-column prop="password" label="招采密码" width="100">
			</el-table-column>
			<el-table-column label="操作" width="200">
				<template scope="scope">
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
				<el-form-item label="名称" prop="name">
					<el-input v-model="editForm.name"></el-input>
				</el-form-item>
				<el-form-item label="联系人" prop="master">
					<el-input v-model="editForm.master"></el-input>
				</el-form-item>
				<el-form-item label="联系方式" prop="phone">
					<el-input v-model="editForm.phone" :maxlength="11"></el-input>
				</el-form-item>
				<el-form-item label="地址" prop="address">
					<el-input v-model="editForm.address"></el-input>
				</el-form-item>
				<el-form-item label="招采账号" prop="loginname">
					<el-input v-model="editForm.loginname"></el-input>
				</el-form-item>
				<el-form-item label="招采密码" prop="password">
					<el-input v-model="editForm.password"></el-input>
				</el-form-item>
				<el-form-item label="送货单" prop="template">
					<el-radio v-model="editForm.template" label="1">
						<viewer :images="signImages">
				        	<img src="https://bapi.kyb66.com/img/template/template1.png">
				    	</viewer>
				    </el-radio>
  					<el-radio v-model="editForm.template" label="2">
	  					<viewer :images="signImages">
					        <img src="https://bapi.kyb66.com/img/template/template2.png">
					    </viewer>
					</el-radio>
  					<el-radio v-model="editForm.template" label="3">
	  					<viewer :images="signImages">
					        <img src="https://bapi.kyb66.com/img/template/template3.png">
					    </viewer>
					</el-radio>
					<el-radio v-model="editForm.template" label="4">
	  					<viewer :images="signImages">
					        <img src="https://bapi.kyb66.com/img/template/model4.png">
					    </viewer>
					</el-radio>
					<el-radio v-model="editForm.template" label="5">
	  					<viewer :images="signImages">
					        <img src="https://bapi.kyb66.com/img/template/template5.png">
					    </viewer>
					</el-radio>
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
				<el-form-item label="名称" prop="name">
					<el-input v-model="addForm.name"></el-input>
				</el-form-item>
				<el-form-item label="联系人" prop="master">
					<el-input v-model="addForm.master" ></el-input>
				</el-form-item>
				<el-form-item label="联系电话" prop="phone">
					<el-input v-model="addForm.phone" :maxlength="11" ></el-input>
				</el-form-item>
				<el-form-item label="地址" prop="address">
					<el-input v-model="addForm.address"></el-input>
				</el-form-item>
				<el-form-item label="招采账号" prop="loginname">
					<el-input v-model="addForm.loginname"></el-input>
				</el-form-item>
				<el-form-item label="招采密码" prop="password">
					<el-input v-model="addForm.password"></el-input>
				</el-form-item>
				<el-form-item label="送货单" prop="template">
					<el-radio v-model="addForm.template" label="1">
						<viewer :images="signImages">
					        <img src="https://bapi.kyb66.com/img/template/template1.png">
					    </viewer>
					</el-radio>
  					<el-radio v-model="addForm.template" label="2">
  						<viewer :images="signImages">
					        <img src="https://bapi.kyb66.com/img/template/template2.png">
					    </viewer>
  					</el-radio>
  					<el-radio v-model="addForm.template" label="3">
  						<viewer :images="signImages">
					        <img src="https://bapi.kyb66.com/img/template/template3.png">
					    </viewer>
  					</el-radio>
  					<el-radio v-model="addForm.template" label="4">
  						<viewer :images="signImages">
					        <img src="https://bapi.kyb66.com/img/template/model4.png">
					    </viewer>
  					</el-radio>
  					<el-radio v-model="editForm.template" label="5">
	  					<viewer :images="signImages">
					        <img src="https://bapi.kyb66.com/img/template/template5.png">
					    </viewer>
					</el-radio>
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
	import { getProviderList, addProvider, editProvider } from '../../api/api';
	export default {
		data() {
			return {
				providers: [],
				total: 0,
				page: 1,
				listLoading: false,

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入名称', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
					id: 0,
					name: '',
					master: '',
					phone: '',
					address: '',
					loginname: '',
					password: ''
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入名称', trigger: 'blur' }
					]
				},
				//新增界面数据
				addForm: {
					name: '',
					master: '',
					phone: '',
					address: '',
					loginname: '',
					password: ''
				},

				signImages: []
			}
		},
		methods: {
			handleCurrentChange(val) {
				this.page = val;
				this.getProviders();
			},
			//获取请购人列表
			getProviders() {
				let para = {
					page:this.page,
                    size:20
				};
				this.listLoading = true;
				getProviderList(para).then((res) => {
					this.listLoading = false;
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.providers = res.data.data.list
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
					editProvider(para).then((res) => {
						this.listLoading = false;
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
								message: '删除成功',
								type: 'success'
							});
							this.getProviders();
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
					name: row.name,
					master: row.master,
					phone: row.phone,
					address: row.address,
					template: row.template,
					loginname: row.loginname,
					password: row.password
				};
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					name: '',
					master: '',
					phone: '',
					address: '',
					template: '1',
					loginname: '',
					password: ''
				};
			},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.editLoading = true;
						let para = Object.assign({}, this.editForm);
						editProvider(para).then((res) => {
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
								this.getProviders();
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
							let para = Object.assign({}, this.addForm);
							addProvider(para).then((res) => {
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
									this.$message({
										message: '提交成功',
										type: 'success'
									});
									this.$refs['addForm'].resetFields();
									this.getProviders();
								}
							});
					}
				});
			},

		},
		mounted() {
			this.getProviders();
		}
	}

</script>

<style scoped>

  img{
  	width:50px;
  }

</style>