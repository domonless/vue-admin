<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true">
				<el-form-item prop="providerId">
					<el-select v-model="providerId" placeholder="供货商" clearable >
					    <el-option
					      v-for="item in providers"
					      :key="item.id"
					      :label="item.name"
					      :value="item.id">
					    </el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="选择日期范围">
					<el-date-picker
				      v-model="dates"
				      type="daterange"
				      align="left"
				      unlink-panels
				      range-separator="至"
				      start-placeholder="开始日期"
				      end-placeholder="结束日期"
				      :picker-options="pickerOptions">
				    </el-date-picker>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="query" >查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<el-col>
			<el-table :data="statistics" show-summary highlight-current-row height="500" border style="width: 100%;">
				<el-table-column prop="demander" label="需求公司" width="400">
				</el-table-column>
				<el-table-column prop="provider" label="供应商" width="400">
				</el-table-column>
				<el-table-column prop="orderSum" label="订单总金额" width="150">
				</el-table-column>
				<el-table-column prop="orderCount" label="订单总数" width="100">
				</el-table-column>
			</el-table>
		</el-col>

		<el-col>
			<div id="chartPie" style="width:50%; height:400px; margin-top:50px"></div>
		</el-col>
		毛利：{{gross}}元

	</section>
</template>

<script>
	import util from '../../common/js/util'
	import echarts from 'echarts'
	import { getStatistic, getProviderList} from '../../api/api';
	export default {
		data() {
			return {
				providerId: '',
				dates: '',
				queryLoading: false,

				providers:[],
				totalSum:0,
				bidSum:0,
				feeSum:0,
				gross:0,
				statistics:[],

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
			query:function(){
				if (this.dates!='') {
					let start = util.formatDate.format(this.dates[0],"yyyy-MM-dd 00:00:00");
					let end = util.formatDate.format(this.dates[1],"yyyy-MM-dd 23:59:59");
					let para = {
						providerId: this.providerId,
						startTime: start,
						endTime: end,
					};
					this.queryLoading = true;
					getStatistic(para).then((res) => {
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
								this.totalSum = res.data.data.totalSum
								this.bidSum = res.data.data.bidSum
								this.feeSum = res.data.data.feeSum
								this.gross = util.formatNumber(this.totalSum - this.bidSum - this.feeSum)
								this.statistics = res.data.data.statistics
							}else{
								this.totalSum = 0
								this.bidSum = 0
								this.feeSum = 0
								this.gross = 0
								this.statistics = []
							}
							this.drawPieChart();
						}
					});
				}else{
					this.$message({
			          showClose: true,
			          message: '请选择查询时段'
			        });
				}
			},
			drawPieChart() {
                this.chartPie = echarts.init(document.getElementById('chartPie'));
                this.chartPie.setOption({
                    title: {
                        text: '收支汇总',
                        subtext: '如图所示',
                        x: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left',
                        data: ['订单总金额', '进货开销', '运费开销']
                    },
                    series: [
                        {
                            name: '',
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '60%'],
                            data: [
                                { value: this.totalSum, name: '订单总金额' },
                                { value: this.bidSum, name: '进货开销' },
                                { value: this.feeSum, name: '运费开销' }
                            ],
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                });
            },
			
		},
		mounted() {
			this.drawPieChart();
			this.getProviders();
		}
	}

</script>

<style scoped>

</style>