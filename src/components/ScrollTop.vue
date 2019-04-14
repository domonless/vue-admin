<template>
  <transition name="el-fade-in">
    <div v-if="toTopShow" class="toTop" @click="backTop">
        <a>回到顶部</a>
    </div>
  </transition>
</template>

<script>
	export default {
		data() {
			return {
				toTopShow:false,
				scrollTop:0,
			}
		},
		methods: {
			//返回顶部
			backTop(){
				let timer = null;
			      let _this = this;
			      cancelAnimationFrame(timer);
			      timer = requestAnimationFrame(function fn() {
			        if (_this.scrollTop > 5000) {
			          _this.scrollTop -= 1000;
			          document.getElementsByClassName("content-container")[0].scrollTop =
			            _this.scrollTop;
			          timer = requestAnimationFrame(fn);
			        } else if (_this.scrollTop > 1000 && _this.scrollTop <= 5000) {
			          _this.scrollTop -= 500;
			          document.getElementsByClassName("content-container")[0].scrollTop =
			            _this.scrollTop;
			          timer = requestAnimationFrame(fn);
			        } else if (_this.scrollTop > 200 && _this.scrollTop <= 1000) {
			          _this.scrollTop -= 100;
			          document.getElementsByClassName("content-container")[0].scrollTop =
			            _this.scrollTop;
			          timer = requestAnimationFrame(fn);
			        } else if (_this.scrollTop > 50 && _this.scrollTop <= 200) {
			          _this.scrollTop -= 10;
			          document.getElementsByClassName("content-container")[0].scrollTop =
			            _this.scrollTop;
			          timer = requestAnimationFrame(fn);
			        } else if (_this.scrollTop > 0 && _this.scrollTop <= 50) {
			          _this.scrollTop -= 5;
			          document.getElementsByClassName("content-container")[0].scrollTop =
			            _this.scrollTop;
			          timer = requestAnimationFrame(fn);
			        } else {
			          cancelAnimationFrame(timer);
			          _this.toTopShow = false;
			        }
			      });
            },
            handleScroll() {
			    let dom =document.getElementsByClassName('content-container')[0];
			    if(dom){
					this.scrollTop = dom.scrollTop;
				    if (this.scrollTop > 300) {
				        this.toTopShow = true;
				    }else {
				        this.toTopShow = false;
				    }
			    }
			    
			},
		},
		mounted() {
			window.addEventListener('scroll', this.handleScroll, true);
		},
		destroyed: function () {
	        window.removeEventListener('scroll', this.handleScroll);   //  离开页面清除（移除）滚轮滚动事件
	    }
	}

</script>

<style scoped>
  .toTop {
  	position: fixed;
    right: 10px;
    bottom: 40px;
    background: #FFF;
    width: 36px;
    text-align: center;
    border-radius: 2px;
    line-height: 1.25;
    z-index: 1000;
    opacity: .6;
  }
  .toTop:hover {
  	opacity:1;
  }
  .toTop a{
  	cursor: pointer;
  	padding: 10px;
    border: 1px solid #DDD;
    display: block;
    color: #999;
    text-decoration: none;
  }
  .toTop a:hover{
    color: #800;
  }
</style>
