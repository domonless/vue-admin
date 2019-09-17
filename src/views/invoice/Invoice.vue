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
				<el-form-item label="填开日期范围">
					<el-date-picker
				      v-model="filters.dates"
				      type="daterange"
				      align="left"
				      unlink-panels
				      range-separator="至"
				      start-placeholder="开始日期"
				      end-placeholder="结束日期"
				      :picker-options="pickerOptions"
				      @change="getInvoices">
				    </el-date-picker>
				</el-form-item>
				<br>
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
		<el-table :data="invoices" show-summary :summary-method="getSummaries" highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column prop="invoiceSn" label="发票号" width="90">
			</el-table-column>
			<el-table-column prop="money" label="发票金额" width="120">
			</el-table-column>
			<el-table-column prop="sum" label="物料总额" width="90">
			</el-table-column>
			<el-table-column prop="" label="差额" width="80">
				<template scope="scope">
					{{(scope.row.money*1000-scope.row.sum*1000)/1000}}
				</template>
			</el-table-column>
			<el-table-column prop="demander" show-overflow-tooltip label="需求公司" width="300">
			</el-table-column>
			<el-table-column prop="provider" show-overflow-tooltip label="供货商" width="100" :formatter="formatProvider">
			</el-table-column>
			<el-table-column prop="createTime" label="创建时间" width="100">
			</el-table-column>
			<el-table-column prop="invoiceDate" label="填开日期" width="100">
			</el-table-column>
			<el-table-column prop="incomeDate" label="回款日期" width="100">
			</el-table-column>
			<el-table-column prop="remark" show-overflow-tooltip label="备注" width="150" >
			</el-table-column>
			<el-table-column label="操作" width="430">
				<template scope="scope">
					<el-button size="small" icon="el-icon-search" @click="handleView(scope.$index, scope.row)"></el-button>
					<el-button v-if="scope.row.status==1" type="warning" size="small" @click="handleReturn(scope.$index, scope.row)">回款</el-button>
					<el-button v-if="scope.row.status==2" type="success" size="small">已回</el-button>
					<el-button size="small" type="info" icon="fa fa-file-picture-o" :disabled="scope.row.imgurl==''" @click="showImg(scope.$index, scope.row)"></el-button>
					<el-button type="primary" size="small" @click="handleEdit(scope.$index, scope.row)" icon="el-icon-edit"></el-button>
					<el-button v-if="isAdmin && scope.row.status==1" type="danger" size="small" @click="handleDel(scope.$index, scope.row)" icon="el-icon-delete"></el-button>
					<el-button size="small" @click="handleRelated(scope.$index, scope.row)">相关订单</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="total, prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
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
				<el-form-item label="备注" prop="remark">
					<el-input type="textarea" v-model="editForm.remark"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--物料详情界面-->
		<el-dialog title="物料详情" :visible.sync="itemListVisible" :close-on-click-modal="false">
			<el-table :data="items" ref="viewTable" :span-method="objectSpanMethod" highlight-current-row v-loading="itemsLoading" style="width: 100%;" >
			    <el-table-column prop="cdSn" label="订单号" width="140">
				</el-table-column>
				<el-table-column prop="rownum" label="序号" width="55">
				</el-table-column>
				<el-table-column prop="name" label="物料名称" width="150">
				</el-table-column>
				<el-table-column prop="brand" label="品牌" width="60">
				</el-table-column>
				<el-table-column prop="form" label="规格" width="200">
				</el-table-column>
				<el-table-column prop="unit" label="单位" width="60">
				</el-table-column>
				<el-table-column prop="price" label="单价" width="70">
				</el-table-column>
				<el-table-column prop="count" label="数量" width="65">
				</el-table-column>
			</el-table>
		</el-dialog>

		<!--回款界面-->
		<el-dialog title="回款确认" :visible.sync="returnFormVisible" :close-on-click-modal="false">
			<el-form :model="returnForm" label-width="80px" ref="returnForm">
				<el-form-item label="发票号" prop="invoiceSn">
					<el-input v-model="editForm.invoiceSn" disabled></el-input>
				</el-form-item>
				<el-form-item label="发票金额" prop="money">
					<el-input type="number" v-model="editForm.money" disabled></el-input>
				</el-form-item>
				<el-form-item label="备注" prop="remark">
					<el-input type="textarea" v-model="editForm.remark" disabled></el-input>
				</el-form-item>
				<el-form-item label="回款日期" prop="incomeDate">
					<el-date-picker type="date" placeholder="选择日期" v-model="returnForm.incomeDate" value-format="yyyy-MM-dd"  format="yyyy-MM-dd"></el-date-picker>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="returnFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="returnSubmit" :loading="returnLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
	import util from '../../common/js/util'
	import Cookies from 'js-cookie'
	import { getInvoiceList, getProviderList, editInvoice, delInvoice, getOrdersByInvoiceId, fileInvoiceUpload, getInvoiceSum,getItemsByInvoiceId} from '../../api/api';

	export default {
		data() {
			return {
				//分页
				pageSize:20,
				pages:0,
				total: 0,
				page: 1,

				isAdmin: Cookies.get('user_type')==1,

				//筛选
				filters: {
					invoiceSn: '',
					money: '',
					providerId: '',
					demander: '',
					status:'',
					dates:''
				},

				//发票列表
				invoices: [],
				listLoading: false,

				//查看页面
				itemListVisible: false,//查看页面是否显示
				itemsLoading: false,
				items: [],//物料列表

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

				//回款界面是否显示
				returnFormVisible: false,
				returnLoading: false,
				//回款数据
				returnForm: {
				},

				//供货商
				providers:[],

				//发票状态
				status:[
					{
						value:1,
						label:'未回款'
					},
					{
						value:2,
						label:'已回款'
					}
				],

				pickerOptions: {
		          shortcuts: [{
		            text: '最近一个月',
		            onClick(picker) {
		              const end = new Date();
		              const start = new Date();
		              start.setTime(start.getTime() - 3600 * 1000 * 24 * 365/12);
		              picker.$emit('pick', [start, end]);
		            }
		          }, {
		            text: '最近三个月',
		            onClick(picker) {
		              const end = new Date();
		              const start = new Date();
		              start.setTime(start.getTime() - 3600 * 1000 * 24 * 365/4);
		              picker.$emit('pick', [start, end]);
		            }
		          }, {
		            text: '最近半年',
		            onClick(picker) {
		              const end = new Date();
		              const start = new Date();
		              start.setTime(start.getTime() - 3600 * 1000 * 24 * 365/2);
		              picker.$emit('pick', [start, end]);
		            }
		          }, {
		            text: '最近一年',
		            onClick(picker) {
		              const end = new Date();
		              const start = new Date();
		              start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
		              picker.$emit('pick', [start, end]);
		            }
		          }]
		        },

		        //图片上传
				uploadFlag: false,
				uploadPercent:0,

				//发票金额合计
				sums:['合计'],

				spanArr:[],
			}
		},
		methods: {
			getSummaries(param) {
				return this.sums;
			},
			//供货商转化
			formatProvider: function (row, column) {
				return util.formatProvider(row.provider);
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
				let start,end = '';
				if(this.filters.dates!='' && this.filters.dates!=undefined){
					start = util.formatDate.format(this.filters.dates[0],"yyyy-MM-dd 00:00:00");
					end = util.formatDate.format(this.filters.dates[1],"yyyy-MM-dd 23:59:59");
				}
				let para = {
					page:this.page,
                    size:this.pageSize,
                    invoiceSn:this.filters.invoiceSn,
                    money:this.filters.money,
                    providerId:this.filters.providerId,
                    demander:this.filters.demander,
                    status:this.filters.status,
                    startTime:start==undefined?'':start,
                    endTime:end==undefined?'':end
				};
				this.listLoading = true;
				getInvoiceSum(para).then((res) => {
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
							invoiceDate: this.editForm.invoiceDate,
							remark:this.editForm.remark,
							imgurl:this.editForm.imgurl
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
			//显示回款界面
			handleReturn: function (index, row) {
				this.returnFormVisible = true;
				this.editForm = Object.assign({}, row);
			},
			//回款处理
			returnSubmit: function () {
				this.returnForm.id = this.editForm.id;
				this.returnForm.status = 2;
				this.$confirm('确认提交吗？', '提示', {}).then(() => {
					this.returnLoading = true;
					editInvoice(this.returnForm).then((res) => {
						this.returnLoading = false;
						this.returnFormVisible = false;
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
                    size:this.pageSize,
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
	                	res.data.data.name = '发票列表';
	                	res.data.data.filters = this.filters;
						this.$router.push({name: '采购订单列表', params: {relatedResponse: res}});
					}
				});
    		},
			//根据发票id查看物料详情
			handleView: function(index, row){
				let para = {
					invoiceId: row.id 
				};
				this.itemsLoading = true;
				getItemsByInvoiceId(para).then((res) => {
					this.itemsLoading = false;
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						this.items = res.data.data.list
						this.getSpanArr(res.data.data.list);
						this.itemListVisible = true
					}
				});
			},
			//合并单元格
			getSpanArr(data){
				let contactDot = 0;
				this.spanArr=[];
		        data.forEach((item,index) => {
		            if(index===0){
		                this.spanArr.push(1)
		            }else{
		                if(item.cdSn!='' && item.cdSn === data[index-1].cdSn){
		                    this.spanArr[contactDot] += 1;
		                    this.spanArr.push(0)
		                }else{
		                    contactDot = index
		                    this.spanArr.push(1)
		                }
		            }
		        })
			},
			//合并单元格
			objectSpanMethod({row, column, rowIndex, columnIndex}){
		        if(columnIndex === 0){
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
						this.editForm.imgurl = res.data.data;
					}
		    	});
		    },

		},
		mounted() {
			this.getProviders();
			let res = this.$route.params.relatedResponse;
			if(res == undefined){
				this.getInvoices();
			}else{
				if(res.data.data.filters != undefined){
					this.filters = res.data.data.filters;
					this.getInvoices();
				}else{
					this.invoices = res.data.data.list
                	this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
                	this.total = res.data.data.total
				}
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