<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.cdSn" placeholder="订单号" @input="getPrepareItems" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.name" placeholder="名称或编号" @input="getPrepareItems" clearable></el-input>
				</el-form-item>
				<el-form-item prop="providerId">
					<el-select v-model="filters.providerId" filterable placeholder="供货商" @change="getPrepareItems" clearable >
					    <el-option
					      v-for="item in providers"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item prop="demanderId">
					<el-select v-model="filters.demanderId" filterable placeholder="需求公司" @change="getPrepareItems" clearable >
					    <el-option
					      v-for="item in demanders"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.remark" placeholder="项目名" @input="getPrepareItems" clearable></el-input>
				</el-form-item>
			</el-form>
		</el-col>

		<zk-table
			ref="table"
	      sum-text="sum"
	      index-text="#"
	      :data="items"
	      :columns="columns"
	      :stripe="props.stripe"
	      :border="props.border"
	      :show-header="props.showHeader"
	      :show-summary="props.showSummary"
	      :show-row-hover="props.showRowHover"
	      :show-index="props.showIndex"
	      :tree-type="props.treeType"
	      :is-fold="props.isFold"
	      :expand-type="props.expandType"
	      :selection-type="props.selectionType"
	      @checkbox-click="selsChange">
			<template slot="provider" scope="scope">
				{{ formatProvider(scope.row)}}
        	</template>
			<template slot="url" scope="scope">
				<el-button v-if="scope.row.cdSn" size="small" @click="handleRelated(scope.$index, scope.row)">相关订单</el-button>
		        <el-button v-if="scope.row.cdSn" type="danger" size="small" icon="fa fa-file-pdf-o" :disabled="scope.row.url==''" @click="handlePdfPrint(scope.$index, scope.row)"></el-button>
        	</template>
	    </zk-table>

		<br>
		<br>
		<!--工具条-->
		<el-col :span="24" class="r">
			选中物料金额合计：{{this.selSum}}
			<el-button type="warning" @click="handleInvoice" :disabled="this.sels.length===0">发票填开</el-button>
		</el-col>
		<el-col :span="24" class="footer">
			<el-pagination layout="total, prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--开票界面-->
		<el-dialog title="开票" :visible.sync="invoiceFormVisible" :close-on-click-modal="false">
			<el-form :model="invoiceForm" label-width="80px" :rules="invoiceFormRules" ref="invoiceForm" >
				<el-form-item label="发票号" prop="invoiceSn" >
					<el-input v-model="invoiceForm.invoiceSn" @input="handleInput"></el-input>
				</el-form-item>
				<el-form-item label="发票金额" prop="money">
					<el-input type="number" v-model="invoiceForm.money" :maxlength="10"></el-input>
				</el-form-item>
				<el-form-item label="填开日期" prop="invoiceDate">
					<el-date-picker type="date" placeholder="选择日期" v-model="invoiceForm.invoiceDate" value-format="yyyy-MM-dd"  format="yyyy-MM-dd"></el-date-picker>
				</el-form-item>
				<el-form-item label="图片" prop="imgurl">
					<el-upload
					  class="avatar-uploader"
					  action=""
					  accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.JPG,.JPEG,.PBG,.GIF,.BMP"
					  :http-request="uploadImg"
					  :show-file-list="false">
					  <img v-if="invoiceForm.imgurl && this.uploadFlag == false" :src="invoiceForm.imgurl" class="avatar">
					  <i v-else-if="!invoiceForm.imgurl && this.uploadFlag == false" class="el-icon-plus avatar-uploader-icon"></i>
					  <el-progress v-if="this.uploadFlag" type="circle" :percentage="uploadPercent" style="margin-top:30px;"></el-progress>
					</el-upload>
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

		<!--发票列表-->
		<el-dialog title="发票列表" :visible.sync="invoiceListVisible" :close-on-click-modal="false">
			<font color="red">*该发票号已存在，请核对发票信息，确认无误后可以直接引用</font>
			<el-table :data="invoices" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column prop="invoiceSn" label="发票号" width="90">
				</el-table-column>
				<el-table-column prop="money" label="发票金额" width="90">
				</el-table-column>
				<el-table-column prop="demander" show-overflow-tooltip label="需求公司" width="150">
				</el-table-column>
				<el-table-column prop="provider" show-overflow-tooltip label="供应商" width="90" :formatter="formatProvider">
				</el-table-column>
				<el-table-column prop="invoiceDate" label="填开日期" width="100">
				</el-table-column>
				<el-table-column prop="incomeDate" label="回款日期" width="100">
				</el-table-column>
				<el-table-column prop="remark" label="备注" width="100" >
				</el-table-column>
				<el-table-column label="操作" width="100">
					<template scope="scope">
						<el-button size="small" type="warning" @click="handleQuote(scope.$index, scope.row)">引用</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-dialog>

	</section>
</template>

    
<script>
	import util from '../../common/js/util'
	import wx from 'weixin-js-sdk';
	import { getOrderList, getOrderDetail, getProviderList, getDemanderList, getPurchaserList, addInvoice, fileInvoiceUpload, getInvoiceList, getPrepareItemList} from '../../api/api';

	export default {
	  data() {
		 return {
		 	props: {
	          stripe: false,
	          border: false,
	          showHeader: true,
	          showSummary: false,
	          showRowHover: true,
	          showIndex: false,
	          treeType: true,
	          isFold: true,
	          expandType: false,
	          selectionType: true,
	        },
	        columns: [
        		{
	            label: '订单号',
	            prop: 'cdSn',
	            minWidth: '120px',
	          },
	          {
	            label: '序号',
	            prop: 'rownum',
	            minWidth: '50px',
	          },
	          {
	            label: '物料名称',
	            prop: 'name',
	            minWidth: '90px',
	          },
	          {
	            label: '单位',
	            prop: 'unit',
	            minWidth: '70px',
	          },
	          {
	            label: '价格',
	            prop: 'price',
	            minWidth: '80px',
	          },
	          {
	            label: '数量',
	            prop: 'count',
	            minWidth: '80px',
	          },
	          {
	            label: '需求公司',
	            prop: 'demander',
	            minWidth: '250px',
	          },
	          {
	            label: '供应商',
	            prop: 'provider',
	            minWidth: '60px',
	            type: 'template',
	            template: 'provider',
	          },
	          {
	            label: '操作',
	            prop: 'url',
	            minWidth: '160px',
	            type: 'template',
	            template: 'url',
	          },
	          
	        ],
		 	pageSize:30,
			pages:0,

			filters: {
				name:'',
				cdSn: '',
				providerId: '',
				demanderId: '',
				remark: ''
			},
			orders: [],
			invoices: [],
			invoiceListVisible: false,
			total: 0,
			page: 1,
			listLoading: false,
			sels: [],//列表选中列
			selSum: 0,//列表选中列总金额

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

			//供货商
			providers:[],

			//需求公司
			demanders:[],

			//图片上传
			uploadFlag: false,
			uploadPercent:0,
		 };
	 },
	 methods: {
			//供货商转化
			formatProvider: function (row, column) {
				return util.formatProvider(row.provider);
			},
			//分页
			handleCurrentChange(val) {
				this.page = val;
				this.getPrepareItems();
			},
			//根据发票号获取发票列表
			getInvoices() {
				let para = {
					page:this.page,
                    size:this.pageSize,
                    invoiceSn:this.invoiceForm.invoiceSn,
                    status:1
				};
				getInvoiceList(para).then((res) => {
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
	                	this.invoices = res.data.data.list;
	                	if(this.invoices.length>0){
	                		this.invoiceListVisible =true;
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
			//获取需求公司列表
			getDemanders() {
				let para = {
				};
				getDemanderList(para).then((res) => {
					let msg = res.data.message;
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
			//获取物料列表
			getPrepareItems() {
				let para = {
					page:this.page,
                    size:this.pageSize,
                    name:this.filters.name,
                    cdSn:this.filters.cdSn,
                    providerId:this.filters.providerId,
                    demanderId:this.filters.demanderId,
                    remark:this.filters.remark,
                    status:4
				};
				this.listLoading = true;
				getPrepareItemList(para).then((res) => {
					this.listLoading = false;
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
	                	this.selSum=0;
	                	this.sels=[];
						this.items = res.data.data.list
	                    this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
	                    this.total = res.data.data.total
	                }
				});
			},
			//显示开票界面
			handleInvoice: function (){
				if(this.filters.providerId==0 || this.filters.demanderId==0){
					this.$message({
			          showClose: true,
			          message: '请选择供应商和需求公司',
			          type: 'error'
			        });
				}else{
					this.invoiceFormVisible = true;
				}
			},
			//开票提交处理
			invoiceSubmit: function () {
				this.$refs.invoiceForm.validate((valid) => {
					if (valid) {
						//判断填开日期
						if(this.invoiceForm.invoiceDate){
							//处理订单id和物料id
							let orderIds=new Set()
							let itemIds=[]
							for(let i=0;i<this.sels.length;i++){
								orderIds.add(this.sels[i].orderId);
								itemIds.push(this.sels[i].id);
							}
							this.invoiceForm.sum = this.selSum;
							this.invoiceForm.orderIdList = orderIds;
							this.invoiceForm.itemIdList = itemIds;
							this.invoiceForm.providerId = this.filters.providerId;
							this.invoiceForm.demanderId = this.filters.demanderId;
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
										this.$message({
											message: '提交成功',
											type: 'success'
										});
										this.getPrepareItems();
										this.$refs['invoiceForm'].resetFields();
									}
								});
							});
						}else{
							this.$message({
					          showClose: true,
					          message: '请选择填开日期'
					        });
						}
					}
				});
			},
			//多选
			selsChange: function () {
				this.selSum = 0;
				this.sels = [];
				//选中的物料id数组
				let selsId = this.$refs.table.getCheckedProp("id");
				//选中的订单id数组
				let selsOrderId = this.$refs.table.getCheckedProp("orderId");
				//选中的物料数量数组
				let selsCount = this.$refs.table.getCheckedProp("count");
				//选中的物料金额数组
				let selsPrice = this.$refs.table.getCheckedProp("price");
				//选中的需求公司数组
				let selsDemanderId = this.$refs.table.getCheckedProp("demanderId");
				//选中的需求公司数组
				let selsProviderId = this.$refs.table.getCheckedProp("providerId");

				for(let i=0;i<selsId.length;i++){
					if(selsId[i]!=0){
						let sel = {};
						sel.id=selsId[i];
						sel.orderId=selsOrderId[i];
						sel.count=selsCount[i];
						sel.price=selsPrice[i];
						this.selSum = util.formatNumber(this.selSum+sel.count*sel.price);
						this.sels.push(sel);
					}
				}

				//处理需求公司
				let demanderIdCount = 0;
				selsDemanderId.forEach(demanderId=>{
					if(demanderId!=0){
						demanderIdCount++;
					}
				});
				//处理供应商
				let providerIdCount = 0;
				selsProviderId.forEach(providerId=>{
					if(providerId!=0){
						providerIdCount++;
					}
				});
				if((!this.filters.providerId || !this.filters.demanderId) && this.items.length==1){
					if(providerIdCount==1){
						this.filters.providerId = selsProviderId[0];
					}
					if(demanderIdCount==1){
						this.filters.demanderId = selsDemanderId[0];
					}
					if(this.items.length>1 && (providerIdCount==1||demanderIdCount==1)){
						this.getPrepareItems();
					}
				}
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
		    	fileInvoiceUpload(formData).then((res) => {
			        this.uploadFlag = false;
			        let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.invoiceForm.imgurl = res.data.data;
					}
		    	});
		    },
		    //显示订单pdf
		    handlePdfPrint: function (index, row) {
    			var ua = window.navigator.userAgent.toLowerCase();
    			//在微信里
    			if(ua.match(/MicroMessenger/i) == 'micromessenger'){
    				wx.miniProgram.getEnv((res)=>{
    					//在小程序里
    					if (res.miniprogram) {
    						wx.miniProgram.navigateTo({
		    					url: '/pages/pdf/pdf?url='+row.url
		    				});
    					}else{
    						window.open(row.url);
    					}
    				});
				}else{
    				window.open(row.url);
    			}
    		},
    		//处理发票号输入
    		handleInput: function (){
    			this.invoiceForm.invoiceSn = this.invoiceForm.invoiceSn.replace(/'/g,'');
    			if(this.invoiceForm.invoiceSn.length>=8){
    				this.getInvoices();
    			}
			},
			//处理引用
			handleQuote: function (index, row) {
				//处理订单id和物料id
				let orderIds=new Set()
				let itemIds=[]
				for(let i=0;i<this.sels.length;i++){
					orderIds.add(this.sels[i].orderId);
					itemIds.push(this.sels[i].id);
				}
				this.invoiceForm.orderIdList = orderIds;
				this.invoiceForm.itemIdList = itemIds;
				this.invoiceForm.sum = row.sum + this.selSum;
				this.invoiceForm.id = row.id;
				this.$confirm('确认引用吗？', '提示', {}).then(() => {
					this.invoiceLoading = true;
					addInvoice(this.invoiceForm).then((res) => {
						this.invoiceLoading = false;
						this.invoiceFormVisible = false;
						this.invoiceListVisible = false;
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
							this.getPrepareItems();
							this.$refs['invoiceForm'].resetFields();
						}
					});
				});
    		},
    		//物料相关订单
    		handleRelated: function (index, row) {
    			let para = {
                    orderId:row.orderId
				};
				getOrderList(para).then((res) => {
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
	                	res.data.data.name = '待开票物料';
	                	res.data.data.filters = this.filters;
	                	res.data.data.sels = this.sels;
	                	res.data.data.selSum = this.selSum;
						this.$router.push({name: '采购订单列表', params: {relatedResponse: res}});
					}
				});
    		},
		},
		mounted() {
			this.$nextTick(() => {
				let that = this;
				$('.zk-table__header').off('click','.zk-checkbox').on('click','.zk-checkbox__input',function(){
			  		that.selsChange();
				});
			 });
			this.getProviders();
			this.getDemanders();
			let res = this.$route.params.relatedResponse;
			if(res == undefined){
				this.getPrepareItems();
			}else{
				this.filters = res.data.data.filters;
				this.getPrepareItems();
				this.sels = res.data.data.sels;
				this.sels.forEach(row => {
	            	this.$refs.tb.toggleRowSelection(row);
		        });
			}
		},

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
  .el-upload {
  	margin-left: 25px;
  }
  .r{
  	position:fixed; 
  	bottom:0;
  	padding-left: 20px;
  	padding-top: 5px;
  	padding-bottom: 5px;
  	background-color: white;
  	width:300px;
  }
</style>
