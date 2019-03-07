<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true">
				<el-form-item prop="providerId">
					<el-select v-model="providerId" placeholder="供货商" @change="query" clearable>
					    <el-option
					      v-for="item in providers"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="query" >查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<el-col>
			<el-table :data="statistics" highlight-current-row height="500" border style="width: 100%;">
				<el-table-column type="index" width="50">
				</el-table-column>
				<el-table-column prop="name" label="物料名称" width="300">
				</el-table-column>
				<el-table-column prop="unit" label="单位" width="80">
				</el-table-column>
				<el-table-column prop="count" label="销售数量" width="120">
				</el-table-column>
				<el-table-column label="操作" width="150">
					<template scope="scope">
						<el-button type="primary" size="small" @click="handleDetail(scope.$index, scope.row)">详情</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-col>

		<el-dialog title="查看" :visible.sync="detailVisible" :close-on-click-modal="false">
			<div id="chartColumn" style="width:100%; height:500px; margin-top:50px"></div>
		</el-dialog>

	</section>
</template>

<script>
	import util from '../../common/js/util'
	import echarts from 'echarts'
	import { getItemStatistic, getItemStatisticDetail, getProviderList} from '../../api/api';
	export default {
		data() {
			return {
				providerId: '',
				queryLoading: false,
				providers:[],
				statistics:[],
				dates:[],
				counts:[],
				detailVisible:false
			}
		},
		methods: {
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
			//查询
			query:function(){
				let para = {
					providerId: this.providerId
				};
				this.queryLoading = true;
				getItemStatistic(para).then((res) => {
					this.queryLoading = false;
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						if(res.data.data!=null){
							this.statistics = res.data.data
						}
					}
				});
			},
			handleDetail: function (index, row) {
				let para = {
					providerId: this.providerId,
					name: row.name
				};
				this.queryLoading = true;
				getItemStatisticDetail(para).then((res) => {
					this.queryLoading = false;
					let msg = res.data.message;
                	let code = res.data.code;
					if (code !== 200) {
	                  this.$message({
	                    message: msg,
	                    type: 'error'
	                  });
	                } else {
						if(res.data.data!=null){
							this.dates=[];
							this.counts=[];
							res.data.data.forEach(row=>{
								this.dates.push(row.date);
								this.counts.push(row.count);
							});
						}
						this.detailVisible = true;
						setTimeout(()=>{ this.drawColumnChart();}, 100);
					}
				});
				
			},
			drawColumnChart() {
                this.chartColumn = echarts.init(document.getElementById('chartColumn'));
                this.chartColumn.setOption({
                  color: ['#3398DB'],
                  title: { text: '柱状图' },
                  tooltip: {},
                  xAxis: {
                  	  name: '年月',
                      data: this.dates
                  },
                  yAxis: {
                  	  name: '销量'
                  },
                  series: [{
                      name: '销量',
                      type: 'bar',
                      data: this.counts,
                      itemStyle: {
							normal: {
								label: {
									show: true, //开启显示
									position: 'top', //在上方显示
									textStyle: { //数值样式
										color: 'black',
										fontSize: 16
									}
								}
							}
						}
                    }]
                });
            },
			
		},
		mounted() {
			this.getProviders();
			this.query();
		}
	}

</script>

<style scoped>

</style>