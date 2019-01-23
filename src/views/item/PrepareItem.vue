<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="物料名称" @input="getPrepareItems" clearable></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="export2Excel" >导出</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="items" highlight-current-row v-loading="listLoading" style="width: 100%;">
			<el-table-column type="index" width="50">
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
			<!-- <el-table-column prop="bidPrice" label="最新进价" width="80">
			</el-table-column> -->
			<el-table-column prop="count" label="数量" width="80">
			</el-table-column>
			<el-table-column label="操作" width="300">
				<template scope="scope">
					<el-button size="small" @click="handleRelated(scope.$index, scope.row)">相关订单</el-button>
				</template>
			</el-table-column>
		</el-table>

	</section>
</template>

<script>
	import util from '../../common/js/util'
	import { getPrepareItemList, getOrderList } from '../../api/api';
	export default {
		data() {
			return {
				filters: {
					name: ''
				},
				items: [],
				listLoading: false,
			}
		},
		methods: {
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
			//获取物料倩价列表
			getPrepareItems() {
				let para = {
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
						this.items = res.data.data
	                }
				});
			},
    		//物料相关订单
    		handleRelated: function (index, row) {
    			let para = {
                    cdSn:row.cdSn
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
						this.$router.push({path: '/order/list', query: {relatedResponse: res}});
					}
				});
    		},
    		export2Excel() {
			　require.ensure([], () => {
			　　　const { export_json_to_excel } = require('../../excel/Export2Excel');
			　　　const tHeader = ['名称','品牌','规格','单位','数量','价格','订单编号','请购人'];
			　　　// 上面设置Excel的表格第一行的标题
			　　　const filterVal = ['name','brand','form','unit','count','price','cdSn',''];
			　　　// 上面的index、phone_Num、school_Name是tableData里对象的属性
			　　　const list = this.items;  //把data里的tableData存到list
			　　　const data = this.formatJson(filterVal, list);
			　　　export_json_to_excel(tHeader, data, '未送物料清单');
			　　})
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

