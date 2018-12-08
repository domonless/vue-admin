<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="名称或编号" @input="getItems"></el-input>
				</el-form-item>
				<el-form-item>
					<el-select v-model="filters.providerId" placeholder="请选择" @change="getItems" clearable>
					    <el-option
					      v-for="item in providers"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getItems" >查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="warning" @click="handleAdd">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="isItemsBatAddShow=true" >批量导入</el-button>
					<el-input id="upload" type="file" size="mini" @change="importFromExcel(this)" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style="display:none;"></el-input>
				</el-form-item>
			</el-form>
		</el-col>

		<!--批量导入界面-->
		<el-dialog title="批量导入" :visible.sync="isItemsBatAddShow" :close-on-click-modal="false" width="30%">
			<font color="red"><b>请按照模版中的格式进行填写，文件后缀为.xlsx&nbsp;&nbsp;&nbsp;&nbsp;</b></font>
			<a href="http://bapi.kyb66.com/xlsx/itemTemplate/物料批量上传模板.xlsx" target="_blank" style="font-size:18px;color:#CD6839;">下载模版</a>
			&nbsp;
			<a href="javascript:void(0);" @click="uploadClick" style="font-size:18px;color:green">立即上传</a>
		</el-dialog>

		<!--列表-->
		<el-table :data="items" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="50">
			</el-table-column>
			<el-table-column prop="itemNumber" label="编号" width="80" sortable>
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
			<el-table-column prop="remark" label="备注" width="120">
			</el-table-column>
			<el-table-column prop="endTime" label="截止日期" width="120">
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<el-button size="mini" type="primary" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button size="mini" type="danger" @click="handleDel(scope.$index, scope.row)">删除</el-button>
					<el-button size="mini" type="warning" :disabled="scope.row.imgurl==''" @click="handlePrint(scope.$index, scope.row)">打印</el-button>
					<el-button size="mini" @click="handleRelated(scope.$index, scope.row)">相关订单</el-button>
				</template>
			</el-table-column>
			<!-- <el-table-column label="签价单" width="100">
				<template scope="scope">
						<pdf :id="scope.row.itemNumber" v-if="scope.row.imgurl && scope.row.imgurl.endsWith('.pdf')" :src="scope.row.imgurl"></pdf>
						<div :id="scope.row.itemNumber" v-if="scope.row.imgurl && !scope.row.imgurl.endsWith('.pdf')"><img :src="scope.row.imgurl" :key="scope.row.imgurl" class="signImg"></div>
				</template>
			</el-table-column> -->
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="20" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="编号" prop="itemNumber">
					<el-input v-model="editForm.itemNumber"></el-input>
				</el-form-item>
				<el-form-item label="名称" prop="name">
					<el-input v-model="editForm.name"></el-input>
				</el-form-item>
				<el-form-item label="品牌" prop="brand">
					<el-input v-model="editForm.brand"></el-input>
				</el-form-item>
				<el-form-item label="规格" prop="form">
					<el-input v-model="editForm.form"></el-input>
				</el-form-item>
				<el-form-item label="单位" prop="unit">
					<el-input v-model="editForm.unit"></el-input>
				</el-form-item>
				<el-form-item label="价格" prop="price">
					<el-input-number v-model="editForm.price" :min="0" :max="99999"></el-input-number>
				</el-form-item>
				<el-form-item label="图片" prop="imgurl">
					<el-upload
					  class="avatar-uploader"
					  action=""
					  accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.JPG,.JPEG,.PBG,.GIF,.BMP,.PDF"
					  :http-request="uploadImg"
					  :show-file-list="false">
					  <pdf v-if="editForm.imgurl && this.uploadFlag == false && editForm.imgurl.endsWith('.pdf')" :src="editForm.imgurl" class="avatar"></pdf>
					  <img v-if="editForm.imgurl && this.uploadFlag == false && !editForm.imgurl.endsWith('.pdf')" :src="editForm.imgurl" class="avatar">
					  <i v-else-if="!editForm.imgurl && this.uploadFlag == false" class="el-icon-plus avatar-uploader-icon"></i>
					  <el-progress v-if="this.uploadFlag" type="circle" :percentage="uploadPercent" style="margin-top:30px;"></el-progress>
					</el-upload>
				</el-form-item>

				<el-form-item label="起始时间" prop="startTime">
					<el-date-picker type="datetime" placeholder="选择日期" v-model="editForm.startTime" value-format="yyyy-MM-dd" format="yyyy-MM-dd"></el-date-picker>
				</el-form-item>
				<el-form-item label="截止时间" prop="endTime">
					<el-date-picker type="datetime" placeholder="选择日期" v-model="editForm.endTime" value-format="yyyy-MM-dd"  format="yyyy-MM-dd"></el-date-picker>
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
				<el-form-item label="编号" prop="itemNumber">
					<el-input v-model="addForm.itemNumber"></el-input>
				</el-form-item>
				<el-form-item label="名称" prop="name">
					<el-input v-model="addForm.name"></el-input>
				</el-form-item>
				<el-form-item label="品牌" prop="brand">
					<el-input v-model="addForm.brand"></el-input>
				</el-form-item>
				<el-form-item label="规格" prop="form">
					<el-input v-model="addForm.form"></el-input>
				</el-form-item>
				<el-form-item label="单位" prop="unit">
					<el-input v-model="addForm.unit"></el-input>
				</el-form-item>
				<el-form-item label="价格" prop="price">
					<el-input-number v-model="addForm.price" :min="0" :max="99999"></el-input-number>
				</el-form-item>
				<el-form-item label="起始时间" prop="startTime">
					<el-date-picker type="datetime" placeholder="选择日期" v-model="addForm.startTime" value-format="yyyy-MM-dd" format="yyyy-MM-dd"></el-date-picker>
				</el-form-item>
				<el-form-item label="截止时间" prop="endTime">
					<el-date-picker type="datetime" placeholder="选择日期" v-model="addForm.endTime" value-format="yyyy-MM-dd" format="yyyy-MM-dd"></el-date-picker>
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
	import pdf from 'vue-pdf'
	import qs from 'qs'
	import axios from 'axios'
	//import NProgress from 'nprogress'
	import { getItemList, addItem, editItem, removeItem, batAddItem, batchRemoveItem, getProviderList, getOrdersByItemId, fileItemUpload } from '../../api/api';
	export default {
		components:
		{
			pdf
		},
		data() {
			return {
				filters: {
					name: '',
					providerId: 1
				},
				items: [],
				total: 0,
				page: 1,
				listLoading: false,
				sels: [],//列表选中列

				//图片上传
				uploadFlag: false,
				uploadPercent:0,

				//供应商
				providers: [],

				editFormVisible: false,//编辑界面是否显示
				editLoading: false,
				editFormRules: {
					itemNumber: [
						{ required: true, message: '请输入编号', trigger: 'blur' }
					],
					name: [
						{ required: true, message: '请输入物料名称', trigger: 'blur' }
					],
					unit: [
						{ required: true, message: '请输入单位', trigger: 'blur' }
					]
				},
				//编辑界面数据
				editForm: {
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					itemNumber: [
						{ required: true, message: '请输入编号', trigger: 'blur' }
					],
					name: [
						{ required: true, message: '请输入物料名称', trigger: 'blur' }
					],
					unit: [
						{ required: true, message: '请输入单位', trigger: 'blur' }
					]
					// price: [
					// 	{ required: true, message: '请输入价格', trigger: 'change' }
					// ],
					// startTime: [
					// 	{ required: true, message: '请输入起始日期', trigger: 'change' }
					// ],
					// endTime: [
					// 	{ required: true, message: '请输入截止日期', trigger: 'change' }
					// ]
				},
				//新增界面数据
				addForm: {
				},

				isItemsBatAddShow: false
			}
		},
		methods: {
			uploadClick(){
				this.isItemsBatAddShow = false;
				document.getElementById("upload").click();
			},
			//导入excel数据
			importFromExcel: function(obj) {
		        let _this = this;
		        let inputDOM = this.$refs.inputer;
		        // 通过DOM取文件数据
		        this.file = event.currentTarget.files[0];
		        var rABS = false; //是否将文件读取为二进制字符串
		        var f = this.file;
		        var reader = new FileReader();
		        //if (!FileReader.prototype.readAsBinaryString) {
		        FileReader.prototype.readAsBinaryString = function(f) {
		            var binary = "";
		            var rABS = false; //是否将文件读取为二进制字符串
		            var pt = this;
		            var wb; //读取完成的数据
		            var outdata;
		            var reader = new FileReader();
		            reader.onload = function(e) {
		                var bytes = new Uint8Array(reader.result);
		                var length = bytes.byteLength;
		                for(var i = 0; i < length; i++) {
		                    binary += String.fromCharCode(bytes[i]);
		                }
		                var XLSX = require('xlsx');
		                if(rABS) {
		                    wb = XLSX.read(btoa(fixdata(binary)), { //手动转化
		                        type: 'base64'
		                    });
		                } else {
		                    wb = XLSX.read(binary, {
		                        type: 'binary'
		                    });
		                }
		                outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);//outdata就是你想要的东西
		                this.da = [...outdata]
		                let arr = []
		                this.da.map(v => {
		                    let obj = {}
		                    obj.itemNumber = v.itemNumber
		                    obj.name = v.name
		                    obj.brand = v.brand
		                    obj.form = v.form
		                    obj.unit = v.unit
		                    obj.price = v.price
		                    obj.remark = v.remark
		                    obj.providerId = v.providerId
		                    obj.startTime = v.startTime
		                    obj.endTime = v.endTime
		                    obj.createTime = new Date()
		                    obj.updateTime = new Date()
		                    obj.status = 1
		                    arr.push(obj)
		                })
		                let para = {
		                    itemListStr: JSON.stringify(arr)
		                    // withList: arr
		                }
		                batAddItem(qs.stringify(para)).then(res => {
		                	if (res.data.code !== 200) {
				                _this.$message({
				                  message: '上传失败，请检查文档格式',
				                  type: 'error'
				                });
				              } else {
				                _this.$message({
				                  message: '上传成功',
				                  type: 'success'
				                });
				                _this.getItems();
				                document.getElementById("upload").value = '';
				              }
		                    
		                })
		                
		            }
		            reader.readAsArrayBuffer(f);
		        }
		        if(rABS) {
		            reader.readAsArrayBuffer(f);
		        } else {
		            reader.readAsBinaryString(f);
		        }
		    },
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
		    	fileItemUpload(formData).then((res) => {
			        this.uploadFlag = false;
					this.editForm.imgurl = res.data.data;
		    	});
		    },
			handleCurrentChange(val) {
				this.page = val;
				this.getItems();
			},
			//获取物料倩价列表
			getItems() {
				let para = {
					page:this.page,
                    size:20,
                    name:this.filters.name,
                    providerId:this.filters.providerId	
				};
				this.listLoading = true;
				getItemList(para).then((res) => {
					this.items = res.data.data.list
                    this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
                    this.total = res.data.data.total
					this.listLoading = false;
				});
			},
			//获取供应商列表
			getProviders() {
				let para = {
				};
				getProviderList(para).then((res) => {
					this.providers = res.data.data.list
				});
			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { id: row.id, status: 0 };
					editItem(qs.stringify(para)).then((res) => {
						this.listLoading = false;
						//NProgress.done();
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getItems();
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			//显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
					itemNumber: '',
					name: '',
					brand: '/',
					form: '',
					unit: '',
					price: 0,
					// providerId: 0,
					startTime: new Date(),
					endTime: new Date(new Date().getTime() + 365*24*60*60*1000)
				};
			},
    		handlePrint: function (index, row) {
    			let newWindow=""
    			if(row.imgurl.endsWith('.pdf')){
				    newWindow = window.open(row.imgurl);
    			}else{
    				var printHtml = "<img src='" + row.imgurl + "' />";
					newWindow = window.open("",'newwindow');
					newWindow.document.body.innerHTML = printHtml;
					setTimeout(function(){ newWindow.print();}, 500);
    			}
    		},
    		//物料相关订单
    		handleRelated: function (index, row) {
    			let para = {
					page:this.page,
                    size:20,
                    itemId:row.id
				};
				getOrdersByItemId(para).then((res) => {
					this.$router.push({path: '/order/list', query: {relatedResponse: res}});
				});
    		},
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.editLoading = true;
						let para = Object.assign({}, this.editForm);
						para.createTime = undefined;
						para.updateTime = undefined;
						editItem(qs.stringify(para)).then((res) => {
							this.editLoading = false;
							this.$message({
								message: '提交成功',
								type: 'success'
							});
							this.getItems();
							this.$refs['editForm'].resetFields();
							this.editFormVisible = false;
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
						addItem(qs.stringify(para)).then((res) => {
							this.addLoading = false;
							this.$message({
								message: '提交成功',
								type: 'success'
							});
							this.$refs['addForm'].resetFields();
							this.addFormVisible = false;
							this.getItems();
						});
					}
				});
			},
			selsChange: function (sels) {
				this.sels = sels;
			},
			//批量删除
			batchRemove: function () {
				var ids = this.sels.map(item => item.id).toString();
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let para = { ids: ids };
					batchRemoveItem(qs.stringify(para)).then((res) => {
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
						this.getItems();
					});
				}).catch(() => {

				});
			},
		},
		mounted() {
			this.getItems();
			this.getProviders();
		}
	}

</script>

<style scoped>
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
  img{
  	width:100%;
  	height:100%;
  }
</style>

<style media="print">
    @page {
        size: auto;  /* auto is the initial value */
        margin: 0mm; /* this affects the margin in the printer settings */
    }
</style>
