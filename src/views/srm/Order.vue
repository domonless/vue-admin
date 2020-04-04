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
				</el-form-item>
				<el-form-item>
					<el-input v-model="filters.cdSn" v-if="isLogin" placeholder="订单号" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-if="isLogin" @click.native.prevent="query()">查询</el-button>
					<el-button type="warning" v-if="isLogin" @click.native.prevent="logout">退出登录</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="rfxs" v-if="isLogin" highlight-current-row style="width: 100%;" v-loading="importLoading" element-loading-text = "查询中，请勿操作">
			<el-table-column type="index" label="序号" width="70">
			</el-table-column>
			<el-table-column prop="srm_status_desc" label="状态" width="70">
			</el-table-column>
			<el-table-column prop="display_po_number" label="订单号" width="150">
			</el-table-column>
			<el-table-column prop="release_date_desc" label="发布日期" width="150">
			</el-table-column>
			<el-table-column prop="company_title" label="业务实体" show-overflow-tooltip width="300">
			</el-table-column>
			<el-table-column prop="ship_to_location_name" label="送货地址" show-overflow-tooltip width="300">
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<el-button size="small" type="primary" @click="queryDetail(scope.$index, scope.row)" icon="el-icon-search"></el-button>
					<el-button size="small" @click="handlePriceImport(scope.$index, scope.row)">数据导入</el-button>
					<el-input id="upload" type="file" size="mini" @change="importFromExcel(this)" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style="display:none;"></el-input>
				</template>
			</el-table-column>
		</el-table>

		<!--查看界面-->
		<el-dialog title="订单详情" :visible.sync="itemsVisible" :close-on-click-modal="false">
			<el-table :data="items" highlight-current-row v-loading="listLoading" style="width: 100%;">
				<el-table-column prop="line_num" label="#" width="70">
				</el-table-column>
				<el-table-column prop="item_description" show-overflow-tooltip label="物料名称" width="300">
				</el-table-column>
				<el-table-column prop="line_desc" show-overflow-tooltip label="采购方备注" width="350">
				</el-table-column>
				<el-table-column prop="unit_meas_lookup_code" label="单位" width="70">
				</el-table-column>
				<el-table-column prop="quantity" label="数量" width="80">
				</el-table-column>
				<el-table-column prop="original_unit_price" label="含税单价" width="80">
				</el-table-column>
			</el-table>
		</el-dialog>

		<!--价格导入界面-->
		<el-dialog title="数据导入" :visible.sync="isAnnualPriceImportShow" :close-on-click-modal="false" width="30%">
			<div>
				<font color="red"><b>请按照模版进行填写，文件后缀为.xlsx&nbsp;&nbsp;&nbsp;&nbsp;</b></font>
				<a href="https://bapi.kyb66.com/xlsx/itemTemplate/订单数据导入
				.xlsx" target="_blank" style="font-size:18px;color:#CD6839;">下载模版</a>
				&nbsp;
				<el-button @click.native="uploadClick" style="font-size:18px;color:green">立即上传</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import util from '../../common/js/util'
	import Cookies from 'js-cookie'
	import md5 from 'js-md5';

	import { getProviderList } from '../../api/api';
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

				//根链接
				rootUrl: process.env.NODE_ENV === 'development' ? '/zc/' : 'http://bgy.kyb66.com/zc/',

				//订单导入
				isAnnualPriceImportShow:false,
				//批量导入数据
				importForm: {
				},
				importItems:[],

				filters:{
					cdSn:''
				},

			}
		},
		methods: {
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
			
			//订单确认查询
			query:function(){
				let that = this;
				that.importLoading = true;
				that.rfxs = [];
				xyfAjax.ajax({
					url:that.rootUrl + 'autocrud/pur.PUR3010.pur_purchase_order_confirm/query?pagesize=20&pagenum=1&_fetchall=false&_autocount=true',
					type:'post', //or post
					dataType:'json', //or jsonp
					data:{
						display_po_number:that.filters.cdSn
					},
					success: function(data){
						that.importLoading = false;
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
				this.queryDetailsById(row.pur_header_id);
			},

			//查询报价详情
			queryDetailsById:function(id){
				let that = this;
				that.items = [];
				xyfAjax.ajax({
					url:that.rootUrl + 'autocrud/pur.PUR3010.pur_purchase_order_detail/query?pur_header_id=' + id + '&pagesize=10&pagenum=1&_fetchall=true&_autocount=true',
					type:'post', //or post
					dataType:'json', //or jsonp
					data:{
					},
					success: function(data){
						that.listLoading = false;
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
											that.items.push(item);
										})
									}else{
										that.items.push(record);
									}
								}
							}
						}
					}
				})
			},
			
			//保存
			savePrice:function(){
				let that = this;
				that.importLoading = true;
				//查询报价物料数据列表
				that.queryDetailsById(that.importForm.pur_header_id);
				//将价格加入
				setTimeout(function(){ 
					that.importItems.forEach((item, index) => {
						that.items[index].quotation_number = item.quotation_number;
						that.items[index].quotation_line_number = item.quotation_line_number;
						that.items[index].quotation_page = item.quotation_page;
						that.items[index].no_price_flag = item.no_price_flag;
						that.items[index].original_unit_price = item.price;
					});
					let params = {};
					let parameter = {};
					parameter.pur_header_id = that.importForm.pur_header_id;
					parameter.lines_data = that.items;
					params.parameter = parameter;
					//发送保存请求
					xyfAjax.ajax({
						url:that.rootUrl + 'modules/pur/PUR3010/pur_purchase_order_save_po_detail.svc',
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
				}, 5000);
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
		        _this.importItems = [];
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
		                		let newItem = {};
			                    newItem.quotation_number = v.报价单单号
			                    newItem.quotation_line_number = v.报价单行号
			                    newItem.quotation_page = v.报价单页码
			                    newItem.no_price_flag = v.无定价信息
			                    newItem.price = v.单价
			                    _this.importItems.push(newItem)
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
	.el-table .warning-row {
	    background: #fdf6ec;
	  }
	.el-table .success-row {
	    background: #f0f9eb;
	  }

</style>