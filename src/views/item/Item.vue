<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="名称或编号" @input="getItems" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.form" placeholder="规格" @input="getItems" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-select v-model="filters.providerId" filterable placeholder="抬头" @change="getItems" clearable>
					    <el-option
					      v-for="item in providers"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="isAread">
					<el-select v-model="filters.areaId" filterable placeholder="采购组织" @change="getItems" clearable>
					    <el-option
					      v-for="item in areas"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
				<br>
				<el-form-item>
					<el-input v-model="filters.remark" placeholder="备注" @input="getItems" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-checkbox v-model="imgurlNull" @change="getItems">图片为空</el-checkbox>
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
				<el-form-item>
					<el-button type="primary" @click="export2Excel" >导出</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--批量导入界面-->
		<el-dialog title="批量导入" :visible.sync="isItemsBatAddShow" :close-on-click-modal="false" width="30%">
			<el-form :model="batAddForm" label-width="80px" :rules="batAddFormRules" ref="batAddForm">
				<el-form-item label="抬头" prop="providerId">
					<el-select v-model="batAddForm.providerId" placeholder="请选择" clearable>
					    <el-option
					      v-for="item in providers"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="isAread" label="采购组织" prop="areaId">
					<el-select v-model="batAddForm.areaId" placeholder="请选择" clearable>
					    <el-option
					      v-for="item in areas"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<div style="margin-top:30px">
				<font color="red"><b>请按照模版进行填写，文件后缀为.xlsx&nbsp;&nbsp;&nbsp;&nbsp;</b></font>
				<a href="https://bapi.kyb66.com/xlsx/itemTemplate/物料批量上传模板.xlsx" target="_blank" style="font-size:18px;color:#CD6839;">下载模版</a>
				&nbsp;
				<el-button @click.native="uploadClick" style="font-size:18px;color:green">立即上传</el-button>
			</div>
		</el-dialog>

		<!--列表-->
		<el-table :data="items" @row-click="clickRow" ref="tb" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
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
			<el-table-column width="60">
				<template scope="scope">
					<i class="fa fa-copy" @click="copy(scope.row.form)"></i>
				</template>
			</el-table-column>
			<el-table-column prop="unit" label="单位" width="80">
			</el-table-column>
			<el-table-column prop="price" label="价格" width="80">
			</el-table-column>
			<el-table-column prop="bidPrice" v-if="isAdmin" label="最新进价" width="80">
			</el-table-column>
			<el-table-column prop="providerId" label="抬头" width="100" :formatter="formatProvider">
			</el-table-column>
			<el-table-column prop="areaId" v-if="isAread" label="采购组织" width="100" :formatter="formatArea">
			</el-table-column>
			<el-table-column prop="remark" label="备注" width="120">
			</el-table-column>
			<el-table-column prop="endTime" label="截止日期" width="120">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button size="small" type="warning" icon="fa fa-file-picture-o" :disabled="scope.row.imgurl==''" @click="handlePrint(scope.$index, scope.row)"></el-button>
					<el-button size="small" type="primary" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)"></el-button>
					<el-button size="small" type="danger" icon="el-icon-delete" @click="handleDel(scope.$index, scope.row)"></el-button>
					<el-button size="small" @click="handleRelated(scope.$index, scope.row)">相关订单</el-button>
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
			<el-button type="primary" @click="handleAllSelect">全选</el-button>
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-button type="info" @click="handleBatUpdateImg" :disabled="this.sels.length===0">批量更新选中图片</el-button>
			<el-button type="warning" @click="handleNoImgSelect" :disabled="this.itemsNoImg.length==0">更新本页没有图片的项</el-button>
			<el-pagination layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
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
					<el-input type="number" v-model="editForm.price" :min="0" :max="99999"></el-input>
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
					<el-button type="warning" size="mini" @click="handleSimilar()">引用图片</el-button>
				</el-form-item>
				<el-form-item label="截止时间" prop="endTime">
					<el-date-picker type="datetime" placeholder="选择日期" v-model="editForm.endTime" value-format="yyyy-MM-dd"  format="yyyy-MM-dd"></el-date-picker>
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

		<!--引用图片界面-->
		<el-dialog title="物料列表" :visible.sync="similarVisible" :close-on-click-modal="false">
			<el-table :data="similarItems" highlight-current-row v-loading="listLoading" style="width: 100%;" >
				<el-table-column prop="itemNumber" label="编号" width="65">
				</el-table-column>
				<el-table-column prop="name" label="物料名称" width="100">
				</el-table-column>
				<el-table-column prop="brand" label="品牌" width="80">
				</el-table-column>
				<el-table-column prop="form" label="规格" width="200">
				</el-table-column>
				<el-table-column prop="unit" label="单位" width="60">
				</el-table-column>
				<el-table-column prop="price" label="单价" width="70">
				</el-table-column>
				<el-table-column label="操作" width="200">
					<template scope="scope">
						<el-button size="mini" type="warning" icon="fa fa-file-picture-o" :disabled="scope.row.imgurl==''" @click="handlePrint(scope.$index, scope.row)"></el-button>
						<el-button size="mini" type="primary" @click="handleQuote(scope.$index, scope.row)">引用</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div slot="footer" class="dialog-footer">
				<el-button type="danger" @click.native="similarVisible=false">取消</el-button>
			</div>
		</el-dialog>

		<!--批量更新图片界面-->
		<el-dialog title="批量更新图片" :visible.sync="batUpdateImgFormVisible" :close-on-click-modal="false">
			<el-form :model="batUpdateImgForm" label-width="80px" :rules="batUpdateImgFormRules" ref="batUpdateImgForm">
				<el-form-item label="图片" prop="imgurl">
					<el-upload
					  class="avatar-uploader"
					  action=""
					  accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.JPG,.JPEG,.PBG,.GIF,.BMP,.PDF"
					  :http-request="uploadImg"
					  :show-file-list="false">
					  <pdf v-if="batUpdateImgForm.imgurl && this.uploadFlag == false && batUpdateImgForm.imgurl.endsWith('.pdf')" :src="editForm.imgurl" class="avatar"></pdf>
					  <img v-if="batUpdateImgForm.imgurl && this.uploadFlag == false && !batUpdateImgForm.imgurl.endsWith('.pdf')" :src="editForm.imgurl" class="avatar">
					  <i v-else-if="!batUpdateImgForm.imgurl && this.uploadFlag == false" class="el-icon-plus avatar-uploader-icon"></i>
					  <el-progress v-if="this.uploadFlag" type="circle" :percentage="uploadPercent" style="margin-top:30px;"></el-progress>
					</el-upload>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="batUpdateImgFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="batUpdateImgSubmit" :loading="batUpdateImgLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="抬头" prop="providerId">
					<el-select v-model="addForm.providerId" placeholder="抬头" clearable>
					    <el-option
					      v-for="item in providers"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item v-if="isAread" label="采购组织" prop="areaId">
					<el-select v-model="addForm.areaId" placeholder="请选择" clearable>
					    <el-option
					      v-for="item in areas"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
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
					<el-input type="number" v-model="addForm.price" :min="0" :max="99999"></el-input>
				</el-form-item>
				<el-form-item label="图片" prop="imgurl">
					<el-upload
					  class="avatar-uploader"
					  action=""
					  accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.JPG,.JPEG,.PBG,.GIF,.BMP,.PDF"
					  :http-request="uploadImg"
					  :show-file-list="false">
					  <pdf v-if="addForm.imgurl && this.uploadFlag == false && addForm.imgurl.endsWith('.pdf')" :src="addForm.imgurl" class="avatar"></pdf>
					  <img v-if="addForm.imgurl && this.uploadFlag == false && !addForm.imgurl.endsWith('.pdf')" :src="addForm.imgurl" class="avatar">
					  <i v-else-if="!addForm.imgurl && this.uploadFlag == false" class="el-icon-plus avatar-uploader-icon"></i>
					  <el-progress v-if="this.uploadFlag" type="circle" :percentage="uploadPercent" style="margin-top:30px;"></el-progress>
					</el-upload>
				</el-form-item>
				<el-form-item label="截止时间" prop="endTime">
					<el-date-picker type="datetime" placeholder="选择日期" v-model="addForm.endTime" value-format="yyyy-MM-dd" format="yyyy-MM-dd"></el-date-picker>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
					<el-input v-model="addForm.remark"></el-input>
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
	import Cookies from 'js-cookie'
	//import NProgress from 'nprogress'
	import { getItemList, addItem, editItem, batAddItem, batchRemoveItem, batUpdateImgurl, getProviderList, getOrdersByItemId, fileItemUpload, getAreaList, getSimilarList } from '../../api/api';
	export default {
		components:
		{
			pdf
		},
		data() {
			return {
				//图片是否为空
				imgurlNull:false,
				btnFlag:false,
				isAread: Cookies.get('is_aread')==1,
				isAdmin: Cookies.get('user_type')==1,
				filters: {
					name: '',
					form: '',
					remark: '',
					providerId: '',
					areaId: ''
				},
				items: [],
				similarItems:[],
				total: 0,
				page: 1,
				pageSize: 20,
				listLoading: false,
				sels: [],//列表选中列
				itemsNoImg: [],//没有

				//图片上传
				uploadFlag: false,
				uploadPercent:0,

				//采购组织
				areas: [],
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

				batUpdateImgFormVisible: false,//批量更新图片界面是否显示
				batUpdateImgLoading: false,
				batUpdateImgFormRules: {
					imgurl: [
						{ required: true, message: '请上传图片', trigger: 'blur' }
					]
				},
				//批量更新图片界面数据
				batUpdateImgForm: {
				},

				addFormVisible: false,//新增界面是否显示
				addLoading: false,
				addFormRules: {
					providerId: [
						{ required: true, message: '请选择抬头', trigger: 'blur', type: 'number'}
					],
					areaId: [
						{ required: true, message: '请选择采购组织', trigger: 'blur', type: 'number'}
					],
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
				//新增界面数据
				addForm: {
				},

				batAddFormRules: {
					providerId: [
						{ required: true, message: '请选择抬头', trigger: 'blur', type: 'number'}
					],
					areaId: [
						{ required: true, message: '请选择采购组织', trigger: 'blur', type: 'number'}
					]
				},
				//批量新增界面数据
				batAddForm: {
				},
				isItemsBatAddShow: false,

				similarVisible:false
			}
		},
		methods: {
			copy(value) {
		      var oInput = document.createElement("input");
		      oInput.value = value;
		      document.body.appendChild(oInput);
		      oInput.select(); // 选择对象
		      document.execCommand("Copy"); // 执行浏览器复制命令
		      oInput.className = "oInput";
		      oInput.style.display = "none";
		    },
			uploadClick(){
				this.$refs.batAddForm.validate((valid) => {
					if (valid) {
						this.isItemsBatAddShow = false;
						document.getElementById("upload").click();
					}
				});
			},
			clickRow(row,event){
				if(event.toElement.localName == "div" || event.toElement.localName == "td"){
					this.$refs.tb.toggleRowSelection(row);
				};
            },
			formatProvider: function (row, column) {
				for(let i=0; i<this.providers.length; i++){
					let provider = this.providers[i];
					if(row.providerId == provider.id){
						return util.formatProvider(provider.name);
					}
				}
			},
			formatArea: function (row, column) {
				for(let i=0; i<this.areas.length; i++){
					let area = this.areas[i];
					if(row.areaId == area.id){
						return area.name;
					}
				}
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
		                    obj.providerId = _this.batAddForm.providerId
		                    obj.areaId = _this.batAddForm.areaId
		                    obj.endTime = v.endTime
		                    obj.status = 1
		                    arr.push(obj)
		                })
		                batAddItem(JSON.stringify(arr)).then(res => {
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
				              }
				              document.getElementById("upload").value = '';
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
			        let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.addForm.imgurl = res.data.data;
						this.editForm.imgurl = res.data.data;
						this.batUpdateImgForm.imgurl = res.data.data;
					}
		    	});
		    },
		    //页数变化处理
			handleCurrentChange(val) {
				this.page = val;
				this.getItems();
			},
			//页大小变化处理
			handleSizeChange(val){
				this.pageSize = val;
				this.getItems();
			},
			//获取采购组织列表
			getAreas() {
				let para = {
				};
				getAreaList(para).then((res) => {
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.areas = res.data.data.list
					}
				});
			},
			//获取物料倩价列表
			getItems() {
				let para = {
					page:this.page,
                    size:this.pageSize,
                    name:this.filters.name,
                    form:this.filters.form,
                    remark:this.filters.remark,
                    providerId:this.filters.providerId,
                    areaId:this.filters.areaId,
                    imgurlNull:this.imgurlNull
				};
				this.listLoading = true;
				getItemList(para).then((res) => {
					this.listLoading = false;
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.items = res.data.data.list
	                    this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
	                    this.total = res.data.data.total
	                    //筛选没有图片的物料
	                    this.itemsNoImg = []
	                    for(let i=0;i<this.items.length;i++){
	                    	if(this.items[i].imgurl==''){
	                    		this.itemsNoImg.push(this.items[i]);
	                    	}
	                    }
	                }
				});
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
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					//NProgress.start();
					let para = { id: row.id, status: 0 };
					editItem(para).then((res) => {
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
							this.getItems();
						}
					});
				}).catch(() => {

				});
			},
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			//显示批量上传图片界面
			handleBatUpdateImg: function (index, row) {
				this.batUpdateImgFormVisible = true;
			},
			handleNoImgSelect: function () {
				if (this.itemsNoImg) {
		          this.itemsNoImg.forEach(row => {
	            	this.$refs.tb.toggleRowSelection(row);
		          });
		          this.batUpdateImgFormVisible = true;
		        }
			},
			handleAllSelect: function () {
				if (this.items) {
		          this.items.forEach(row => {
		            this.$refs.tb.toggleRowSelection(row);
		          });
		        }
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
					providerId: '',
					areaId: '',
					endTime: new Date(new Date().getTime() + 365*24*60*60*1000)
				};
			},
			//物料签价图片
    		handlePrint: function (index, row) {
    			// let newWindow=""
		    	// 		if(row.imgurl.endsWith('.pdf')){
		    	// 			var printHtml = "<iframe id='pdf' width='100%'' height='100%'' src='" + row.imgurl + "' />";
							// newWindow = window.open("",'newwindow');
							// newWindow.document.body.innerHTML = printHtml;
		    	// 		}else{
		    	// 			var printHtml = "<img id='img' src='" + row.imgurl + "' width='868px' height='1195px' />";
							// newWindow = window.open("",'newwindow');
							// newWindow.document.body.innerHTML = printHtml;
		    	// 		}
    			window.open(row.imgurl);
    		},
    		//物料相关订单
    		handleRelated: function (index, row) {
    			let para = {
					page:this.page,
                    size:20,
                    itemId:row.id
				};
				getOrdersByItemId(para).then((res) => {
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.$router.push({name: '采购订单列表', params: {relatedResponse: res}});
					}
				});
    		},
    		//展示相似物料
    		handleSimilar: function () {
				this.similarVisible = true;
				let para = {};
				if(this.editFormVisible){
					para.itemNumber = this.editForm.itemNumber;
					para.name = this.editForm.name;
					para.providerId = this.editForm.providerId;
					para.areaId = this.editForm.areaId;
				}
				getSimilarList(para).then((res) => {
					this.listLoading = false;
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.similarItems = res.data.data
	                }
				});
			},
			//处理引用
			handleQuote: function (index, row) {
				if(this.editFormVisible){
					this.editForm.imgurl = row.imgurl;
				}
				this.similarVisible = false;
			},
    		
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.editLoading = true;
						let para = Object.assign({}, this.editForm);
						para.createTime = undefined;
						para.updateTime = undefined;
						editItem(para).then((res) => {
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
								this.getItems();
								this.$refs['editForm'].resetFields();
							}
						});
					}
				});
			},
			//批量更新图片
			batUpdateImgSubmit: function () {
				this.$refs.batUpdateImgForm.validate((valid) => {
					if (valid) {
						this.batUpdateImgLoading = true;
						let para = {
							ids: this.sels.map(item => item.id),
							imgurl: this.batUpdateImgForm.imgurl
						};
						batUpdateImgurl(para).then((res) => {
							this.batUpdateImgLoading = false;
							this.batUpdateImgFormVisible = false;
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
								this.getItems();
								this.$refs['batUpdateImgForm'].resetFields();
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
						addItem(para).then((res) => {
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
								this.getItems();
							}
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
					batchRemoveItem(para).then((res) => {
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
							this.getItems();
						}
					});
				}).catch(() => {

				});
			},
			//导出物料
			export2Excel() {
    			let exportItems=[];
    			let para = {
                    name:this.filters.name,
                    providerId:this.filters.providerId,
                    areaId:this.filters.areaId,
                    imgurlNull:this.imgurlNull
				};
				this.listLoading = true;
				getItemList(para).then((res) => {
					this.listLoading = false;
					let msg = res.data.message;
	            	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						exportItems = res.data.data.list
						exportItems.forEach(row => {
			            	row.provider = this.formatProvider(row);
			            	row.area = this.formatArea(row);
				          });
						require.ensure([], () => {
					　　　const { export_json_to_excel } = require('../../excel/Export2Excel');
					　　　const tHeader = ['编号','名称','品牌','规格','单位','价格','抬头','区域','备注','截止日期'];
					　　　// 上面设置Excel的表格第一行的标题
					　　　const filterVal = ['itemNumber','name','brand','form','unit','price','provider','area','remark','endTime'];
					　　　// 上面的index、phone_Num、school_Name是tableData里对象的属性
					　　　const list = exportItems;  //把data里的tableData存到list
					　　　const data = this.formatJson(filterVal, list);
						 const provider = (this.filters.providerId==''?'':(this.formatProvider(this.filters)+'-'));
						 const area = (this.filters.areaId==''?'':(this.formatArea(this.filters)+'-'));
						 const fileName = provider + area + '签价导出';
					　　　export_json_to_excel(tHeader, data, fileName);
					　})
	                }
				});
			},
		　　formatJson(filterVal, jsonData) {
		     return jsonData.map(v => filterVal.map(j => v[j]))
		   }
		},
		mounted() {
			this.getItems();
			this.getProviders();
			this.getAreas();
		},
	}

</script>

<style scoped>
	i:hover{ 
		color:#999;
		cursor: pointer;
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

