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
					<el-button type="primary" v-if="isLogin" @click.native.prevent="query()">查询</el-button>
					<el-button type="warning" v-if="isLogin" @click.native.prevent="logout">退出登录</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="bids" v-if="isLogin" highlight-current-row style="width: 100%;">
			<el-table-column type="index" label="序号" width="60">
			</el-table-column>
			<el-table-column prop="status_desc" label="状态" width="70">
			</el-table-column>
			<el-table-column prop="bid_header_number" label="投标编号" width="150">
			</el-table-column>
			<el-table-column prop="title" label="询价单标题" show-overflow-tooltip width="200">
			</el-table-column>
			<el-table-column prop="price_category_desc" label="价格类型" width="80">
			</el-table-column>
			<el-table-column prop="round" label="轮次" width="60">
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<!-- <el-button size="small" type="primary" @click="queryImportDetails(scope.$index, scope.row)" icon="el-icon-search"></el-button> -->
					<el-button size="small" @click="handlePriceImport(scope.$index, scope.row)">价格导入</el-button>
					<el-input id="upload" type="file" size="mini" @change="importFromExcel(this)" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style="display:none;"></el-input>
				</template>
			</el-table-column>
		</el-table>

		<!--查看界面-->
		<el-dialog title="报价详情" :visible.sync="itemsVisible" :close-on-click-modal="false">
			<!-- {{paticipatedCompany}} -->
			<el-table :data="items" highlight-current-row v-loading="listLoading" style="width: 100%;">
			    <el-table-column  type="index" width="45">
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
				<el-table-column prop="tax_type_desc" label="税率" width="80">
				</el-table-column>
				<el-table-column prop="unit_price" label="含税单价" width="80">
				</el-table-column>
			</el-table>
		</el-dialog>

		<!--价格导入界面-->
		<el-dialog title="价格导入" :visible.sync="isAnnualPriceImportShow" :close-on-click-modal="false" width="30%">
			<div style="margin-top:20px">
				<font color="red"><b>请按照模版进行填写，文件后缀为.xlsx&nbsp;&nbsp;&nbsp;&nbsp;</b></font>
				<a href="https://bapi.kyb66.com/xlsx/itemTemplate/年价导入
				.xlsx" target="_blank" style="font-size:18px;color:#CD6839;">下载模版</a>
				&nbsp;
				<el-button @click.native="uploadClick" style="font-size:18px;color:green">立即上传</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import util from '../../common/js/util'

	import { getProviderList} from '../../api/api';
	export default {
		data() {
			return {
				listLoading:false,
				//是否已登录
				isLogin:false,
				//登录名
				loginName:'',
				//登录密码
				password:'',

				//投标单
				bids:[],

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
				//报价物料id
				itemIds:[],

				//根链接
				rootUrl: process.env.NODE_ENV === 'development' ? '/zc/' : 'http://bgy.kyb66.com/zc/',

				//年价导入
				isAnnualPriceImportShow:false,
				//批量导入数据
				importForm: {
				},

			}
		},
		methods: {
			//登录
			login:function(){
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
						user_password:this.password,
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
								that.query();
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
			//查询投标
			query:function(){
				let that = this;
				that.bids = [];
				xyfAjax.ajax({
					url:that.rootUrl + 'autocrud/bid.BID5120.bid_entrustment_query/query?pagesize=19&pagenum=1&_fetchall=true&_autocount=true',
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
										that.bids = record;
									}else{
										that.bids.push(record);
									}
								}else{
									that.bids = [];
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
				let bidHeaderId = row.bid_header_id;
				//展示的物料
				that.items = [];
				//line_item_id
				that.itemIds = [];
				//参与报价供应商查询
				// this.queryRelated(rfxHeaderId);
				//先查询出相关的物料数组
				that.queryDetailByHeaderId(bidHeaderId,true);
				
				//获取相关的物料
		        for(let i=bidHeaderId-100;i<bidHeaderId+100;i++){
		        	that.queryDetailByHeaderId(i);
				}

				setTimeout(function(){ 
					that.listLoading=false;
				}, 1500);

			},
			//查询详情
			queryDetailByHeaderId:function(headerId, flag){
				let that = this;
				that.detailResult = [];
				xyfAjax.ajax({
					url:that.rootUrl + 'autocrud/bid.BID7070.bid_bidding_docm_lines/query?bid_header_id='+headerId+'&pagesize=8&pagenum=1&_fetchall=false&_autocount=false',
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
										////遍历出line_item_id
										that.detailResult.forEach(r => {
							            	that.itemIds.push(r.line_item_id);
								        });
									}else{
										//如果只有一条数据，返回的是对象，需判断是不是数组
										if(record instanceof Array){
											that.itemIds.forEach(i => {
												let obj = record.find((item)=>{
													return item.line_item_id === i;//筛选出匹配数据 
												}); 
												if(obj){
													that.items.push(obj);
												}
											});
										}else{
											that.itemIds.forEach(i => {
												if(record.line_item_id === i){
													that.items.push(record);
												}
											});
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
					url:that.rootUrl + 'autocrud/bid.BID5130.bid_bidding_docm_lines/query?bid_header_id='+that.importForm.bid_header_id+'&pagesize=10&pagenum=1&_fetchall=true&_autocount=true',
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
										that.paticipatedCompany += (r.vendor_desc+'。');
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
				//查询报价物料数据列表
				that.queryImportDetails();
				//将价格加入
				setTimeout(function(){ 
					that.items.forEach((item, index) => {
						item.unit_price = that.priceArr[index];
					});
					let params = {};
					let parameter = {};
					parameter.entrustment_header_id = that.importForm.entrustment_header_id;
					parameter.entrustment_header_number = that.importForm.entrustment_header_number;
					parameter.entrustment_type_id = that.importForm.entrustment_type_id;
					parameter.application_date = '2019-08-21';

					parameter.bid_header_id = that.importForm.bid_header_id;
					parameter.bid_header_number = that.importForm.bid_header_number;
					parameter.bidder_company_id = that.importForm.bidder_company_id;
					
					parameter.tax_included_flag = "Y";
					parameter.items = that.items;
					params.parameter = parameter;
					//发送保存请求
					xyfAjax.ajax({
						url:that.rootUrl + 'modules/bid/BID5130/bid_bidding_docm_save.svc',
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
									that.$message({
										message: "导入成功",
										type: 'success'
									});
								}
							}
						}
					})
				}, 3000);
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

</style>