<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="名称" @input="getFiles" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-button size="mini" type="primary" v-on:click="getFiles" >查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button size="mini" type="warning" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<div class="demo-image">
		  <div class="block" v-for="file in files" :key="file.id">
		    <span class="demonstration">{{ file.name }}</span>
		    <img :src="file.url" class="avatar" style="padding-bottom:20px;cursor:pointer" @click="handlePrint(file)"></img>
		    <i class="el-icon-edit" style="width:50px;" @click="handleEdit(file)"></i>
		    <i class="el-icon-delete" @click="handleDel(file)"></i>
		  </div>
		</div>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--上传界面-->
		<el-dialog title="上传" :visible.sync="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="图片" prop="url">
					<el-upload
					  class="avatar-uploader"
					  action=""
					  accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.JPG,.JPEG,.PBG,.GIF,.BMP"
					  :http-request="uploadImg"
					  :show-file-list="false">
					  <img v-if="addForm.url && this.uploadFlag == false" :src="addForm.url" class="avatar">
					  <i v-else-if="!addForm.url && this.uploadFlag == false" class="el-icon-plus avatar-uploader-icon"></i>
					  <el-progress v-if="true" type="circle" :percentage="uploadPercent" style="margin-top:30px;margin-left:25px;"></el-progress>
					</el-upload>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--编辑界面-->
		<el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="图片" prop="url">
					<el-upload
					  class="avatar-uploader"
					  action=""
					  accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.JPG,.JPEG,.PBG,.GIF,.BMP,.PDF"
					  :http-request="uploadImg"
					  :show-file-list="false">
					  <img v-if="editForm.url && this.uploadFlag == false" :src="editForm.url" class="avatar">
					  <i v-else-if="!editForm.url && this.uploadFlag == false" class="el-icon-plus avatar-uploader-icon"></i>
					  <el-progress v-if="this.uploadFlag" type="circle" :percentage="uploadPercent" style="margin-top:30px;margin-left:25px;"></el-progress>
					</el-upload>
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
	import { getFileList, addFile, editFile, fileUpload } from '../../api/api';
	export default {
		data() {
			return {
				filters: {
					name: '',
				},
				files: [],
				total: 0,
				page: 1,
				listLoading: false,

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				//新增界面数据
				addForm: {
					name: ''
				},
				addFormRules: {
					url: [
						{ required: true, message: '请上传图片', trigger: 'blur' }
					]
				},

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				//编辑界面数据
				editForm: {
					id: 0,
					name: ''
				},
				editFormRules: {
					url: [
						{ required: true, message: '请上传图片', trigger: 'blur' }
					]
				},

				//图片上传
				uploadFlag: false,
				uploadPercent:0,

			}
		},
		methods: {
			handleCurrentChange(val) {
				this.page = val;
				this.getFiles();
			},
			//获取采购组织列表
			getFiles() {
				let para = {
					name:this.filters.name,
					page:this.page,
                    size:20
				};
				this.listLoading = true;
				getFileList(para).then((res) => {
					this.listLoading = false;
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.files = res.data.data.list
	                    this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
	                    this.total = res.data.data.total
	                }
				});
			},
            
			//删除
			handleDel: function (row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let para = {
						id: row.id,
						status: 0
					};
					editFile(para).then((res) => {
						this.listLoading = false;
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
							this.getFiles();
						}
					});
				}).catch(() => {

				});
			},

			//显示编辑界面
			handleEdit: function (row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},

			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.editLoading = true;
						let para = {
							id:this.editForm.id,
							name:this.editForm.name,
							url:this.editForm.url
						};
						editFile(para).then((res) => {
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
								this.getFiles();
								this.$refs['editForm'].resetFields();
							}
						});
					}
				});
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					name: '',
					url: ''
				};
			},
			//新增
			addSubmit: function () {
				this.addLoading = true;
				let para = Object.assign({}, this.addForm);
				addFile(para).then((res) => {
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
						this.getFiles();
					}
				});
			},
			//物料签价图片
    		handlePrint: function (row) {
    			window.open(row.url);
    		},
			uploadImg(content){
				let para = {
					name:content.file.name,
					page:this.page,
                    size:20
				};
				getFileList(para).then((res) => {
					this.listLoading = false;
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else if(res.data.data.list.length>0 & this.addFormVisible){
						this.$message({
		                    message: "该文件名已存在，请重命名后上传",
		                    type: 'error'
		                  });
	                } else{
	                	this.uploadPercent = 0;
					    this.uploadFlag = true;
					    let _this = this;
					    clearInterval(this.time);
					    this.time = setInterval(function(){  
				           if(_this.uploadPercent<75){
				               _this.uploadPercent += 25;//进程条
				           }else{                 
				           }          
				        },100)
				    	var formData = new FormData();
				    	formData.append("file", content.file);
				    	fileUpload(formData).then((res) => {
					        this.uploadFlag = false;
					        let msg = res.data.message;
		                	let code = res.data.code;
							if (code !== 200) {
			                  this.$message({
			                    message: msg,
			                    type: 'error'
			                  });
			                } else {
			                	this.addForm.name = content.file.name;
			                	this.editForm.name = content.file.name;
								this.addForm.url = res.data.data;
								this.editForm.url = res.data.data;
							}
				    	});
	                }
				});
		    	
		    },

		},
		mounted() {
			this.getFiles();
		}
	}

</script>

<style scoped>
	.block {
    padding: 30px 0;
    text-align: center;
    border-right: 1px solid #eff2f6;
    display: inline-block;
    width: 20%;
    box-sizing: border-box;
    vertical-align: top;
	}

	.demonstration {
    display: block;
    color: #8492a6;
    font-size: 14px;
    margin-bottom: 20px;
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
	margin:auto; 
  }

</style>