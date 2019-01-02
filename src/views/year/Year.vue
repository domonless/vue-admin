<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-button>生成</el-button>
		</el-col>
	</section>
</template>

<script>
	import util from '../../common/js/util'
	import axios from 'axios'

	export default {
		data() {
			return {
				json:''
			}
		},
		methods: {
			clickHandler: function(){
				let para = {
					
				};
				axios.post('http://srm.countrygarden.com.cn/autocrud/bid.BID5130.bid_bidding_docm_lines/query?bid_header_id=150390&pagesize=1000&pagenum=2&_fetchall=false&_autocount=true', { params: para });
			}

		},
		mounted() {
		}
	}

</script>

<style scoped>

</style>