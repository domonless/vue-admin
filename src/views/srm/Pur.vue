<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true">
				<el-form-item label="供应商" v-if="!isLogin" prop="providerId">
					<el-select v-model="provider" filterable placeholder="请选择" @change="providerChangeHandler" clearable>
					    <el-option
					      v-for="item in providers"
					      :key="item.id"
					      :label="item.name"
					      :value="item.name">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-if="!isLogin" :disabled="!provider" @click.native.prevent="login">登录</el-button>
					<span v-if="isLogin">当前企业：{{ provider }} &nbsp;&nbsp;&nbsp;&nbsp;</span>
					<el-button type="primary" v-if="isLogin" @click.native.prevent="query(5215)">报价中询价单查询</el-button>
					<el-button type="primary" v-if="isLogin" :disabled="isUpdate" @click.native.prevent="update()">更新数据</el-button>
					<el-button type="warning" v-if="isLogin" @click.native.prevent="handleQueryById">按id查询</el-button>
					<el-button type="warning" v-if="isLogin" @click.native.prevent="logout">退出登录</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="rfxs" v-if="isLogin" highlight-current-row style="width: 100%;" v-loading="importLoading" element-loading-text = "年价导入中，请勿操作">
			<el-table-column type="index" label="序号" width="60">
			</el-table-column>
			<el-table-column prop="status_desc" label="状态" width="70">
			</el-table-column>
			<el-table-column prop="rfx_number" label="询价单号" width="200">
			</el-table-column>
			<el-table-column prop="title" label="询价单标题" show-overflow-tooltip width="200">
			</el-table-column>
			<el-table-column prop="price_category_desc" label="价格类型" width="80">
			</el-table-column>
			<el-table-column prop="round" label="轮次" width="60">
			</el-table-column>
			<el-table-column prop="created_by_desc" label="创建人" width="70">
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<el-tooltip class="item" effect="dark" content="若供应商已参与但查询不出数据，点击上方更新数据按钮进行更新" placement="top">
						<el-button size="small" type="primary" :disabled="isUpdate" @click="queryDetail(scope.$index, scope.row)" icon="el-icon-search"></el-button>
					</el-tooltip>
					<el-button size="small" @click="handlePriceImport(scope.$index, scope.row)">价格导入</el-button>
					<el-input id="upload" type="file" size="mini" @change="importFromExcel(this)" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style="display:none;"></el-input>
				</template>
			</el-table-column>
		</el-table>

		<!--查看界面-->
		<el-dialog title="报价详情" :visible.sync="itemsVisible" :close-on-click-modal="false">
			<div style="margin-top:-20px;margin-bottom:10px;">
				<span style="color:red;font-size:18px">* 若供应商已参与但查询不出数据，点击上方更新数据按钮进行更新。高亮为最新一轮报价。</span>
			</div>
			{{paticipatedCompany}}
			<el-table :data="items" highlight-current-row v-loading="listLoading" style="width: 100%;" :row-class-name="tableRowClassName" :default-sort="{prop: 'line_num', order: 'ascending'}">
				<el-table-column prop="line_num" label="#" width="45">
				</el-table-column>
				<el-table-column prop="item_desc" show-overflow-tooltip label="物料名称" width="100">
				</el-table-column>
				<el-table-column prop="brand" label="品牌" width="80">
				</el-table-column>
				<el-table-column prop="stock_remarks" show-overflow-tooltip label="存货备注" width="150">
				</el-table-column>
				<el-table-column prop="uom_desc" label="单位" width="70">
				</el-table-column>
				<el-table-column prop="quantity" label="数量" width="80">
				</el-table-column>
				<el-table-column prop="valid_fb_by_desc" label="供应商" width="150">
				</el-table-column>
				<el-table-column prop="tax_type_name" label="税率" width="80">
				</el-table-column>
				<el-table-column prop="current_fb_retail_price" label="含税单价" width="80">
				</el-table-column>
			</el-table>
		</el-dialog>

		<!--价格导入界面-->
		<el-dialog title="价格导入" :visible.sync="isAnnualPriceImportShow" :close-on-click-modal="false" width="30%">
			<div>
				<font color="red"><b>请按照模版进行填写，文件后缀为.xlsx&nbsp;&nbsp;&nbsp;&nbsp;</b></font>
				<a href="https://bapi.kyb66.com/xlsx/itemTemplate/年价导入
				.xlsx" target="_blank" style="font-size:18px;color:#CD6839;">下载模版</a>
				&nbsp;
				<el-button @click.native="uploadClick" style="font-size:18px;color:green">立即上传</el-button>
			</div>
		</el-dialog>

		<!--查询界面-->
		<el-dialog title="按id查询" :visible.sync="isFeedBackShow" :close-on-click-modal="false">
			<el-form :model="queryForm" label-width="120px" ref="queryForm" :inline="true">
				<el-form-item label="feedBackHeaderId">
					<el-input v-model="queryForm.feedback_header_id"></el-input>
				</el-form-item>
				<el-form-item label="rfxHeaderId">
					<el-input v-model="queryForm.rfx_header_id"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="isFeedBackShow = false">取消</el-button>
				<el-button type="primary" @click.native="queryDetail(0,queryForm)">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import util from '../../common/js/util'
	import Cookies from 'js-cookie'
	import md5 from 'js-md5';

	import { getProviderList, getFeedBackList, addFeedBack, getMaxFeedBackId} from '../../api/api';
	export default {
		data() {
			return {
				listLoading:false,
				importLoading:false,
				//是否已登录
				isLogin:false,
				//登录名
				loginName:'',
				//登录密码
				password:'',

				//询价单
				rfxs:[],

				//物料
				items:[],
				itemsVisible:false,

				//供应商
				provider: '',
				providers:[],

				//导入价格数组
				priceArr:[],

				//相关供应商
				relatedProviders:[],
				//参与报价供应商
				paticipatedCompany:'',

				//当前查出的结果
				detailResult:[],

				//根链接
				rootUrl: process.env.NODE_ENV === 'development' ? '/zc/' : 'http://bgy.kyb66.com/zc/',

				//年价导入
				isAnnualPriceImportShow:false,
				//批量导入数据
				importForm: {
				},
				importItems:[],

				maxFeedBackId:590000,

				//feedback数组
				feedBacks:[],

				//feedBackIds
				feedBackIds:[],

				//是否在更新
				isUpdate:false,

				//当前feedBackId
				currentFeedBackId:0,

				queryForm:{
					feedback_header_id:0,
					rfx_header_id:0
				},
				isFeedBackShow:false,

			}
		},
		methods: {
			tableRowClassName({row, rowIndex}) {
				if (row.header_status!="FINISHED") {
				  return 'warning-row';
				}
				return '';
			},
			//登录
			login:function(){
				Cookies.remove('route');
				let that = this;
				xyfAjax.ajax({
					url:that.rootUrl + 'login.svc',
					type:'post', //or post
					dataType:'json', //or jsonp
					xhrFields: {withCredentials: true},
   					crossDomain: true,
   					async: true,
					data:{
						user_name:this.loginName,
						user_password:md5(this.password).toUpperCase(),
						language:'简体中文',
						user_language:'ZHS'
					},
					success: function(data){
						//错误
						if(!data.success){
							if("Please input user name!"==data.error.message){
								that.$message({
									message: "账号不存在，请在采购信息管理中更新该供应商招采账号信息",
									type: 'error'
								});
							}else if("页面没有注册"==data.error.message){
								that.login();
							}else{
								that.$message({
									message: data.error.message,
									type: 'error'
								});
							}
						}else{
							//错误
							if(data.result!=null && "ERROR"===data.result.encryted_session_id){
								that.$message({
									message: data.result.message,
									type: 'error'
								});
							}else{
								that.isLogin = true;
								that.$message({
									message: "登录成功",
									type: 'success'
								});
								that.query(5215);
							}
						}
					}
				})
			},
			//退出登录
			logout:function(){
				let that = this;
				xyfAjax.ajax({
					url:that.rootUrl + 'logout.svc',
					type:'post', //or post
					dataType:'json', //or jsonp
					data:{
					},
					success: function(data){
						//错误
						if(data.result!=null && "ERROR"===data.result.encryted_session_id){
							that.$message({
								message: data.result.message,
								type: 'error'
							});
						}else{
							that.isLogin = false;
							that.$message({
								message: "退出登录",
								type: 'success'
							});
						}
					}
				})
			},
			//获取maxId
			getMaxId() {
				let para = {
				};
				getMaxFeedBackId(para).then((res) => {
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
	                	if(res.data.data){
	                		this.maxFeedBackId = res.data.data
	                	}
					}
				});
			},
			//获取相关feedBackIds
			getFeedBackIds(itemId) {
				let para = {
					itemId:itemId
				};
				getFeedBackList(para).then((res) => {
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
	                	if(res.data.data){
	                		this.feedBackIds = res.data.data
	                	}
					}
				});
			},
			//查询导入数据
			queryDataByHeaderId:function(headerId){
				let that = this;
				that.detailResult = [];
				xyfAjax.ajax({
					url:that.rootUrl + 'autocrud/pur.SACPUR5210.pur_rfx_feedback_rfq_line/query?feedback_header_id='+headerId+'&pagesize=1&pagenum=1&_fetchall=false&_autocount=true',
					type:'post', //or post
					dataType:'json', //or jsonp
					data:{
					},
					success: function(data){
						//错误
						if(!data.success){
							that.$message({
								message: data.error.message,
								type: 'error'
							});
						}else{
							//错误
							if(data.result!=null && "ERROR"===data.result.encryted_session_id){
								that.$message({
									message: data.result.message,
									type: 'error'
								});
							}else{
								let record = data.result.record;
								if(record){
									//如果只有一条数据，返回的是对象，需判断是不是数组
									if(record instanceof Array){
										record.forEach(item => {
											let obj = {};
											obj.feedBackId = item.feedback_header_id;
											obj.rfxLineItemId = item.rfx_line_item_id;
											that.feedBacks.push(obj);
										});
									}else{
										let obj = {};
										obj.feedBackId = record.feedback_header_id;
										obj.rfxLineItemId = record.rfx_line_item_id;
										that.feedBacks.push(obj);
									}
								}
							}
						}
					}
				})
			},
			//更新feedback数据
			update:function(){
				this.isUpdate = true;
				//查询系统最大feedBackId
				this.getMaxId();
				let that = this;
				that.feedBacks = [];
				setTimeout(function(){ 
					if(that.maxFeedBackId<that.currentFeedBackId){
						//查询导入数据
						for(let i=that.maxFeedBackId+1;i<that.currentFeedBackId+100;i++){
							that.queryDataByHeaderId(i);
						}
						setTimeout(function(){
							if(that.feedBacks.length>0){
								//插入数据
								addFeedBack(JSON.stringify(that.feedBacks)).then((res) => {
									let msg = res.data.message;
				                	let code = res.data.code;
									if (code !== 200) {
					                  that.$message({
					                    message: msg,
					                    type: 'error'
					                  });
					                } else {
					                	that.isUpdate = false;
										that.$message({
											message: '更新成功',
											type: 'success'
										});
									}
								});
							}
						}, (that.currentFeedBackId-that.maxFeedBackId+100)*30);
					}else{
						//查询导入数据
						for(let i=that.maxFeedBackId+1;i<that.maxFeedBackId+100;i++){
							that.queryDataByHeaderId(i);
						}
						setTimeout(function(){
							if(that.feedBacks.length>0){
								//插入数据
								addFeedBack(JSON.stringify(that.feedBacks)).then((res) => {
									let msg = res.data.message;
				                	let code = res.data.code;
									if (code !== 200) {
					                  that.$message({
					                    message: msg,
					                    type: 'error'
					                  });
					                } else {
					                	that.isUpdate = false;
										that.$message({
											message: '更新成功',
											type: 'success'
										});
									}
								});
							}else{
								that.isUpdate = false;
								that.$message({
									message: '更新成功',
									type: 'success'
								});
							}
						}, 3000);
					}
				}, 600);
			},
			//查询报价 5210-未参与 5215报价中
			query:function(number){
				let that = this;
				that.rfxs = [];
				xyfAjax.ajax({
					url:that.rootUrl + 'autocrud/pur.SACPUR'+number+'.pur_rfx_feedback_query/query',
					type:'post', //or post
					dataType:'json', //or jsonp
					data:{
					},
					success: function(data){
						//错误
						if(!data.success){
							that.$message({
								message: data.error.message,
								type: 'error'
							});
						}else{
							if(data.result!=null && "ERROR"===data.result.encryted_session_id){
								that.$message({
									message: data.result.message,
									type: 'error'
								});
							}else{
								let record = data.result.record;
								if(record){
									//如果只有一条数据，返回的是对象，需判断是不是数组
									if(record instanceof Array){
										that.rfxs = record;
									}else{
										that.rfxs.push(record);
									}
									that.currentFeedBackId = that.rfxs[0].feedback_header_id;
								}else{
									that.rfxs = [];
								}
							}
						}
					},
				})
			},
			//查询报价详情
			queryDetail:function(index, row){
				this.listLoading = true;
				this.itemsVisible=true;
				let that = this;
				let rfxHeaderId = row.rfx_header_id;
				let feedbackHeaderId = row.feedback_header_id;
				//展示的物料
				that.items = [];
				//参与报价供应商查询
				that.queryRelated(rfxHeaderId);
				//先查询出相关的物料数组
				that.queryDetailByHeaderId(feedbackHeaderId,true);

				setTimeout(function(){ 
					that.feedBackIds.forEach(id => {
						that.queryDetailByHeaderId(id);
					});
					that.listLoading=false;
				}, 1000);
			},
			//查询详情
			queryDetailByHeaderId:function(headerId, flag){
				let that = this;
				that.detailResult = [];
				xyfAjax.ajax({
					url:that.rootUrl + 'autocrud/pur.SACPUR5210.pur_rfx_feedback_rfq_line/query?feedback_header_id='+headerId+'&pagesize=10&pagenum=1&_fetchall=true&_autocount=true',
					type:'post', //or post
					dataType:'json', //or jsonp
					data:{
					},
					success: function(data){
						//错误
						if(!data.success){
							that.$message({
								message: data.error.message,
								type: 'error'
							});
						}else{
							//错误
							if(data.result!=null && "ERROR"===data.result.encryted_session_id){
								that.$message({
									message: data.result.message,
									type: 'error'
								});
							}else{
								let record = data.result.record;
								if(record){
									if(flag){
										//如果只有一条数据，返回的是对象，需判断是不是数组
										if(record instanceof Array){
											that.detailResult = record;
										}else{
											that.detailResult.push(record);
										}
										that.getFeedBackIds(that.detailResult[0].rfx_line_item_id);
									}else{
										//如果只有一条数据，返回的是对象，需判断是不是数组
										if(record instanceof Array){
											record.forEach(item => {
												that.items.push(item);
											})
										}else{
											that.items.push(record);
										}
									}
								}
							}
						}
					}
				})
			},
			//查询导入报价详情
			queryImportDetails:function(){
				let that = this;
				that.items = [];
				xyfAjax.ajax({
					url:that.rootUrl + 'autocrud/pur.SACPUR5210.pur_rfx_feedback_rfq_line/query?feedback_header_id='+that.importForm.feedback_header_id+'&pagesize=10&pagenum=1&_fetchall=true&_autocount=true',
					type:'post', //or post
					dataType:'json', //or jsonp
					data:{
					},
					success: function(data){
						//错误
						if(!data.success){
							that.$message({
								message: data.error.message,
								type: 'error'
							});
						}else{
							//错误
							if(data.result!=null && "ERROR"===data.result.encryted_session_id){
								that.$message({
									message: data.result.message,
									type: 'error'
								});
							}else{
								let record = data.result.record;
								if(record){
									//如果只有一条数据，返回的是对象，需判断是不是数组
									if(record instanceof Array){
										Array.prototype.push.apply(that.items, record);
									}else{
										that.items.push(record);
									}
								}
							}
						}
					}
				})
			},
			//参与报价供应商查询
			queryRelated:function(rfx_header_id){
				let that = this;
				that.relatedProviders = [];
				xyfAjax.ajax({
					url:that.rootUrl + 'autocrud/pur.SACPUR5110.pur_rfx_ln_vendors/query?rfx_header_id='+rfx_header_id+'&pagesize=10&pagenum=1&_fetchall=true&_autocount=false',
					type:'post', //or post
					dataType:'json', //or jsonp
					data:{
					},
					success: function(data){
						//错误
						if(!data.success){
							that.$message({
								message: data.error.message,
								type: 'error'
							});
						}else{
							if(data.result!=null && "ERROR"===data.result.encryted_session_id){
								that.$message({
									message: data.result.message,
									type: 'error'
								});
							}else{
								let record = data.result.record;
								if(record){
									//如果只有一条数据，返回的是对象，需判断是不是数组
									if(record instanceof Array){
										that.relatedProviders = record;
									}else{
										that.relatedProviders.push(record);
									}
									that.paticipatedCompany = '参与报价的供应商共'+that.relatedProviders.length+'家：';
									that.relatedProviders.forEach(r => {
										let phoneNo = "(" + r.contact_mobile + ")";
										let isIn = r.feedback_status=="NEW"?'(未参与)。':'(已参与)。';
										let str = r.vendor_desc + phoneNo + isIn;
										that.paticipatedCompany += str;
							        });
								}
							}
						}
					}
				})
			},
			//保存年价
			savePrice:function(){
				let that = this;
				that.importLoading = true;
				//查询报价物料数据列表
				that.queryImportDetails();
				//将价格加入
				setTimeout(function(){ 
					that.importItems = [];
					that.items.forEach((item, index) => {
						let newItem = {};
						newItem.tax_type_id = item.tax_type_id;
						newItem.feedback_line_id = item.feedback_line_id;
						newItem.header_status = item.header_status;
						newItem.current_fb_retail_price = that.priceArr[index];
						newItem.tax_included_flag = item.tax_included_flag;
						newItem.stock_remarks = item.stock_remarks;
						newItem.brand = item.brand;
						newItem.abandoned_flag = item.abandoned_flag;
						newItem.price_adjust_rate_code = item.price_adjust_rate_code;
						newItem.clearing_price = item.clearing_price;
						newItem.clearing_amount = item.clearing_amount;
						that.importItems.push(newItem);
					});
					let params = {};
					let parameter = {};
					// parameter.price_adjust_rate_code = "07";
					parameter.rfx_header_id = that.importForm.rfx_header_id;
					parameter.place_of_delivery = that.importForm.place_of_delivery;
					parameter.owner_business_group = that.importForm.owner_business_group;
					// parameter.price_adjust_rate_desc = "不调整价格";
					parameter.round = that.importForm.round;
					parameter.feedback_end_time = that.importForm.feedback_end_time;
					parameter.auction_direction_desc = that.importForm.auction_direction_desc;
					parameter.auction_direction = that.importForm.auction_direction;
					// parameter.status_desc = "新建";
					parameter.rfx_type_id = that.importForm.rfx_type_id;
					parameter.rfx_category_desc = that.importForm.rfx_category_desc;
					parameter.rfx_number = that.importForm.rfx_number;
					parameter.currency_code = that.importForm.currency_code;
					parameter.inquiry_type = that.importForm.inquiry_type;
					parameter.cancel_flag = that.importForm.cancel_flag;
					// parameter.status = "NEW";
					// parameter.quotation_template = "COMMON";
					parameter.price_category_desc = that.importForm.price_category_desc;
					// parameter.contact_person = "";
					// parameter.futrue_meet_flag = "Y";
					// parameter.rfx_round = 1;
					// parameter.rfx_version = 1;
					parameter.pur_organization_id = that.importForm.pur_organization_id;
					parameter.rfx_type_desc = that.importForm.rfx_type_desc;
					// parameter.pur_buyer_desc = that.importForm.rfx_created_by;
					// parameter.feedback_start_time = "2019-09-04 15:05:32";
					parameter.feedback_header_id = that.importForm.feedback_header_id;
					parameter.source_type_desc = that.importForm.source_type_desc;
					// parameter.futrue_meet_flag_desc = "是";
					parameter.price_category = that.importForm.price_category;
					// parameter.vendor_contact_id = 87866;
					// parameter.tax_type_id = 10021;
					// parameter.fastest_arrival_date = "2019-09-11";
					parameter.coop_company_id = that.importForm.coop_company_id;
					// parameter.left_time = 508779;
					parameter.coop_business_group = that.importForm.coop_business_group;
					parameter.title = that.importForm.title;
					// parameter.contact_mobile = "";
					// parameter.e_mail = "";
					// parameter.feedback_number = "622250";
					// parameter.guarantee_money_rate = 0;
					parameter.currency_desc = that.importForm.currency_desc;
					// parameter.tax_type_name = "小规模纳税人3%";
					parameter.rfx_method_desc = that.importForm.rfx_method_desc;
					parameter.pur_organization_desc = that.importForm.pur_organization_desc;
					// parameter.rfx_created_by = "";
					// parameter.tax_type_rate = "3";
					parameter.creation_date_desc = that.importForm.creation_date_desc;
					parameter.sealed_bid_flag = that.importForm.sealed_bid_flag;
					parameter.comments = that.importForm.comments;
					parameter.tax_included_flag = "Y";
					// parameter.tax_included_flag_desc = "含税";
					parameter.total_amount = 0;
					parameter.feedback_counts = 0;
					parameter.feedback_total_price = 0;
					parameter.items = that.importItems;
					params.parameter = parameter;
					//发送保存请求
					xyfAjax.ajax({
						url:that.rootUrl + 'modules/pur/SACPUR5210/pur_rfx_feedback_save.svc',
						type:'post', //or post
						dataType:'json', //or jsonp
						data:{
							_request_data:JSON.stringify(params)
						},
						success: function(data){
							//错误
							if(!data.success){
								that.$message({
									message: data.error.message,
									type: 'error'
								});
							}else{
								if(data.result!=null && "ERROR"===data.result.encryted_session_id){
									that.$message({
										message: data.result.message,
										type: 'error'
									});
								}else{
									that.importLoading = false;
									that.$message({
										message: "导入成功",
										type: 'success'
									});
									document.getElementById("upload").value = '';
								}
							}
						}
					})
				}, 30000);
			},
			//价格导入处理
			handlePriceImport:function(index, row){
				this.isAnnualPriceImportShow = true;
				this.importForm = Object.assign({}, row);
			},
			//上传点击
			uploadClick(){
				this.isAnnualPriceImportShow = false;
				document.getElementById("upload").click();
			},
			//导入excel数据
			importFromExcel: function(obj) {
		        let _this = this;
		        let inputDOM = this.$refs.inputer;
		        // 通过DOM取文件数据
		        this.file = event.currentTarget.files[0];
		        //判断文档格式是否为xlsx
		        let fileName = this.file.name;

		        let suffix = fileName.substring(fileName.lastIndexOf('.')+1);
		        if(suffix!='xlsx'){
		        	_this.$message({
	                  message: '上传失败，请检查文档是否为xlsx格式',
	                  type: 'error'
	                });
	                return;
		        }
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
		                try{
		                	this.da.map(v => {
			                    let price = v.价格
			                    _this.priceArr.push(price)
			                })
		                }catch(e){
	                		_this.$message({
			                  message: e,
			                  type: 'error'
			                });
			                return;
		                }
		            }
		            reader.readAsArrayBuffer(f);
		        }
		        if(rABS) {
		            reader.readAsArrayBuffer(f);
		        } else {
		            reader.readAsBinaryString(f);
		        }
	        	//保存年价
				_this.savePrice();
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
			//供应商选择
			providerChangeHandler(name) {
				if(name){
					let obj = this.providers.find((item)=>{//这里的userRoleList就是上面遍历的数据源 
						return item.name === name;//筛选出匹配数据 
					}); 
					this.loginName = obj.loginname;
					this.password = obj.password;
				}
			},
			handleQueryById(){
				this.isFeedBackShow = true;
				this.queryForm={

				}
			},

		},
		mounted() {
			this.getProviders();
		}
	}

	var xyfAjax = {
		 ajax: function(params) {
		  params = params || {};
		  params.cache = params.cache || false;
		  if (!params.url) {
		   throw new Error('参数不合法');
		  }
		  params.dataType = (params.dataType || 'json').toLowerCase();
		  if (params.dataType == 'jsonp') {
		   this.ajaxJSONP(params);
		  } else if (params.dataType == 'json') {
		   this.ajaxJSON(params);
		  }
		 },
		 /**
		 * 通过JSONP的方式请求
		 * @param {[type]} params [description]
		 * @return {[type]}  [description]
		 */
		 ajaxJSONP(params) {
		  params.data = params.data || {};
		  params.jsonp = params.jsonp || 'callback';
		  // 设置传递给后台的回调参数名和参数值
		  var callbackName = 'jsonp_' + (new Date()).getTime();
		  params.data[params.jsonp] = callbackName;
		  var formatedParams = this.formateParams(params.data, params.cache);
		  //创建script标签并插入到页面中
		  var head = document.getElementsByTagName('head')[0];
		  var script = document.createElement('script');
		  head.appendChild(script);
		  //创建jsonp回调函数 
		  window[callbackName] = function(json) {
		   head.removeChild(script);
		   clearTimeout(script.timer);
		   window[callbackName] = null;
		   params.success && params.success(json);
		  };
		  //发送请求 
		  script.src = (!!formatedParams ? params.url + '?' + formatedParams : params.url);
		  //为了得知此次请求是否成功，设置超时处理
		  if (params.time) {
		   script.timer = setTimeout(function() {
		    window[callbackName] = null;
		    head.removeChild(script);
		    params.error && params.error({
		     message: '超时'
		    });
		   }, params.time);
		  }
		 },
		 /**
		 * 通过JSON的方式请求
		 * @param {[type]} params [description]
		 * @return {[type]}  [description]
		 */
		 ajaxJSON(params) {
		  params.type = (params.type || 'GET').toUpperCase();
		  params.data = params.data || {};
		  var formatedParams = this.formateParams(params.data, params.cache);
		  var xhr;
		  //创建XMLHttpRequest对象
		  if (window.XMLHttpRequest) {
		   //非IE6
		   xhr = new XMLHttpRequest();
		  } else {
		   xhr = new ActiveXObject('Microsoft.XMLHTTP');
		  }
		  //异步状态发生改变，接收响应数据
		  xhr.onreadystatechange = function() {
		   if (xhr.readyState == 4 && xhr.status == 200) {
		    if (!!params.success) {
		     if (typeof xhr.responseText == 'string') {
		      params.success(JSON.parse(xhr.responseText));
		     } else {
		      params.success(xhr.responseText);
		     }
		    }
		   } else {
		    params.error && params.error(status);
		   }
		  }
		  if (params.type == 'GET') {
		   //连接服务器
		   xhr.open('GET', (!!formatedParams ? params.url + '?' + formatedParams : params.url), true);
		   //发送请求
		   xhr.send(null);
		  } else {
		   //连接服务器
		   xhr.open('POST', params.url, true);
		   xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		   //发送请求
		   xhr.send(formatedParams);
		  }
		 },
		 /**
		 * 格式化数据
		 * @param {Obj}  data 需要格式化的数据
		 * @param {Boolean} isCache 是否加入随机参数
		 * @return {String}   返回的字符串
		 */
		 formateParams: function(data, isCache) {
		  var arr = [];
		  for (var name in data) {
		   arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
		  }
		  if (isCache) {
		   arr.push('v=' + (new Date()).getTime());
		  }
		  return arr.join('&');
		 }
		}

</script>



<style scoped>
	.el-table .warning-row {
	    background: #fdf6ec;
	  }
	.el-table .success-row {
	    background: #f0f9eb;
	  }

</style>