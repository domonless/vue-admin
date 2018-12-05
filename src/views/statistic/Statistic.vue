<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-date-picker type="datetime" placeholder="选择日期" v-model="editForm.startTime" value-format="yyyy-MM-dd" format="yyyy-MM-dd"></el-date-picker>
				<el-date-picker type="datetime" placeholder="选择日期" v-model="editForm.startTime" value-format="yyyy-MM-dd" format="yyyy-MM-dd"></el-date-picker>
				<el-form-item>
					<el-button type="primary" v-on:click="getProviders" >查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="warning" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>
	</section>
</template>

<script>
	import util from '../../common/js/util'
	import qs from 'qs'
	import { getProviderList, addProvider, editProvider } from '../../api/api';
	export default {
		data() {
			return {
				filters: {
					startTime: '',
					endTime: ''
				},
				queryLoading: false,
			}
		},
		methods: {
			
			//获取请购人列表
			getProviders() {
				let para = {
					page:this.page,
                    size:20,
                    name:this.filters.name	
				};
				this.listLoading = true;
				getProviderList(para).then((res) => {
					this.providers = res.data.data.list
                    this.page = res.data.data.pageNum == 0 ? res.data.data.pageNum +1 : res.data.data.pageNum
                    this.total = res.data.data.total
					this.listLoading = false;
				});
			},
		},
		mounted() {
			this.getProviders();
		}
	}

</script>

<style scoped>

</style>