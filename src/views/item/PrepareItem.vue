<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="物料名称" @input="getPrepareItems" clearable></el-input>
				</el-form-item>
				<el-form-item prop="status">
					<el-select v-model="filters.status" placeholder="是否已进货" @change="getPrepareItems" clearable>
					    <el-option
					      v-for="item in status"
					      :key="item.value"
					      :label="item.label"
					      :value="item.value">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="getPrepareItems">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="warning" @click="export2Excel">导出</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="items" highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column prop="rownum" label="序号" width="60">
			</el-table-column>
			<el-table-column prop="cdSn" label="订单号" width="150" sortable>
			</el-table-column>
			<el-table-column prop="demander" label="需求公司" width="300" sortable>
			</el-table-column>
			<el-table-column prop="name" label="物料名称" width="100">
			</el-table-column>
			<el-table-column prop="brand" label="品牌" width="70">
			</el-table-column>
			<el-table-column prop="form" label="规格" width="200">
			</el-table-column>
			<el-table-column prop="unit" label="单位" width="80">
			</el-table-column>
			<el-table-column prop="price" label="价格" width="80">
			</el-table-column>
			<el-table-column prop="count" label="数量" width="80">
			</el-table-column>
			<el-table-column prop="bidPrice" v-if="isAdmin" label="最新进价" width="80">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button size="small" @click="handleRelated(scope.$index, scope.row)">相关订单</el-button>
					<el-button size="small" v-if="scope.row.status===1" type="warning" @click="handleBuy(scope.$index, scope.row)">进货</el-button>
					<el-button size="small" v-if="scope.row.status===2" type="success">待发货</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-pagination layout="total, sizes, prev, pager, next" @size-change="handleSizeChange" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--进货界面-->
		<el-dialog title="进货" :visible.sync="buyFormVisible" :close-on-click-modal="false">
			<el-form :model="buyForm" label-width="80px" ref="buyForm" :inline="true">
				<el-form-item label="订单编号" prop="cdSn">
					<el-input v-model="buyForm.cdSn" disabled></el-input>
				</el-form-item>
				<el-table :data="buyItems" highlight-current-row v-loading="listLoading" style="width: 100%;" >
					<el-table-column type="index" width="50">
					</el-table-column>
					<el-table-column prop="itemNumber" label="编号" width="65">
					</el-table-column>
					<el-table-column prop="name" label="物料名称" width="100">
					</el-table-column>
					<el-table-column prop="brand" label="品牌" width="70">
					</el-table-column>
					<el-table-column prop="form" label="规格" width="150">
					</el-table-column>
					<el-table-column prop="unit" label="单位" width="65">
					</el-table-column>
					<el-table-column prop="price" label="单价" width="70">
					</el-table-column>
					<el-table-column prop="count" label="数量" width="70">
					</el-table-column>
					<el-table-column prop="bidPrice" label="进价" width="100">
						<template scope="scope">
							<el-input type="number" size="mini" min="1" :maxlength="10" :key="scope.row.id" @input="handleBidPriceChange(scope.$index, scope.row, $event)"></el-input>
						</template>
					</el-table-column>
				</el-table>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="buyFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="buySubmit" :loading="buyLoading">提交</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	import util from '../../common/js/util'
	import Cookies from 'js-cookie'
	import { getPrepareItemList, getOrderList, editOrderDetail } from '../../api/api';
	export default {
		data() {
			return {
				isAdmin: Cookies.get('user_type')==1,
				filters: {
					name: '',
					status:''
				},
				total: 0,
				page: 1,
				pageSize: 20,
				item: {},
				items: [],
				buyItems: [],
				listLoading: false,

				//进货界面
				buyFormVisible: false,//发货界面是否显示
				buyLoading: false,
				//进货界面数据
				buyForm: {},

				//发票状态
				status:[
					{
						value:1,
						label:'未进货'
					},
					{
						value:2,
						label:'待发货'
					}
				],
			}
		},
		methods: {
		    //页数变化处理
			handleCurrentChange(val) {
				this.page = val;
				this.getPrepareItems();
			},
			//页大小变化处理
			handleSizeChange(val){
				this.pageSize = val;
				this.getPrepareItems();
			},
			//获取物料列表
			getPrepareItems() {
				let para = {
					page:this.page,
                    size:this.pageSize,
                    status:this.filters.status,
					name:this.filters.name
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
						this.items = res.data.data.list
	                    this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
	                    this.total = res.data.data.total
	                }
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
						this.$router.push({name: '采购订单列表', params: {relatedResponse: res}});
					}
				});
    		},
    		//显示进货界面
			handleBuy: function (index, row){
				this.buyItems=[];
				this.item = row;
				this.buyItems.push(row);
				this.buyForm.id=row.orderId;
				this.buyForm.cdSn=row.cdSn;
				this.buyForm.status = 2;
				this.buyFormVisible = true;
			},
			//进货提交处理
			buySubmit: function () {
				this.$confirm('确认提交吗？', '提示', {}).then(() => {
					this.buyLoading = true;
					this.orderItemList=[];
					this.orderItemList.push(this.item);
					this.buyForm.orderItemList=this.orderItemList;
					editOrderDetail(this.buyForm).then((res) => {
						this.buyLoading = false;
						this.buyFormVisible = false;
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
							this.$refs['buyForm'].resetFields();
						}
					});
				});
			},
			//处理进价
			handleBidPriceChange: function(index, row, e){
				row.bidPrice = Number(e);
			},
    		export2Excel() {
    			let exportItems=[];
    			let para = {
    				status:this.filters.status,
					name:this.filters.name
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
						exportItems = res.data.data.list
						require.ensure([], () => {
					　　　const { export_json_to_excel } = require('../../excel/Export2Excel');
					　　　const tHeader = ['名称','品牌','规格','单位','数量','价格','订单编号','请购人'];
					　　　// 上面设置Excel的表格第一行的标题
					　　　const filterVal = ['name','brand','form','unit','count','price','cdSn',''];
					　　　// 上面的index、phone_Num、school_Name是tableData里对象的属性
					　　　const list = exportItems;  //把data里的tableData存到list
					　　　const data = this.formatJson(filterVal, list);
					　　　export_json_to_excel(tHeader, data, '待进货物料清单');
					　})
	                }
				});
			},
		　　formatJson(filterVal, jsonData) {
		     return jsonData.map(v => filterVal.map(j => v[j]))
		   }
		},
		mounted() {
			this.getPrepareItems();
		}
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

