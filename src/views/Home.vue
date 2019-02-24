<template>
	<el-row class="container">
		<el-col :span="24" class="header">
			<el-col :span="10" class="logo" :class="collapsed?'logo-collapse-width':'logo-width'">
				{{collapsed?'':sysName}}
			</el-col>
			<el-col :span="10">
				<div class="tools" @click.prevent="collapse">
					<i class="fa fa-align-justify"></i>
				</div>
			</el-col>
			<el-col :span="4" class="userinfo">
				<el-dropdown trigger="hover">
					<!-- <span class="el-dropdown-link userinfo-inner"><img :src="this.sysUserAvatar" /> {{sysUserName}}</span> -->
					<span class="el-dropdown-link userinfo-inner">欢迎您，{{sysUserName}}</span>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item @click.native="modPwdVisible=true">修改密码</el-dropdown-item>
						<el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</el-col>
		</el-col>
		<el-col :span="24" class="main">
			<aside :class="collapsed?'menu-collapsed':'menu-expanded'">
				<!--导航菜单-->
				<el-menu :default-active="$route.path" class="el-menu-vertical-demo" @open="handleopen" @close="handleclose" @select="handleselect"
					 unique-opened router v-show="!collapsed">
					<template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
						<el-submenu :index="index+''" v-if="!item.leaf">
							<template slot="title"><i :class="item.iconCls"></i>{{item.name}}</template>
							<el-menu-item v-for="child in item.children" :index="child.path" :key="child.path" v-if="!child.hidden">{{child.name}}</el-menu-item>
						</el-submenu>
						<el-menu-item v-if="item.leaf&&item.children.length>0" :index="item.children[0].path"><i :class="item.iconCls"></i>{{item.children[0].name}}</el-menu-item>
					</template>
				</el-menu>
				<!--导航菜单-折叠后-->
				<ul class="el-menu el-menu-vertical-demo collapsed" v-show="collapsed" ref="menuCollapsed">
					<li v-for="(item,index) in $router.options.routes" v-if="!item.hidden" class="el-submenu item">
						<template v-if="!item.leaf">
							<div class="el-submenu__title" style="padding-left: 20px;" @mouseover="showMenu(index,true)" @mouseout="showMenu(index,false)"><i :class="item.iconCls"></i></div>
							<ul class="el-menu submenu" :class="'submenu-hook-'+index" @mouseover="showMenu(index,true)" @mouseout="showMenu(index,false)"> 
								<li v-for="child in item.children" v-if="!child.hidden" :key="child.path" class="el-menu-item" style="padding-left: 40px;" :class="$route.path==child.path?'is-active':''" @click="$router.push(child.path)">{{child.name}}</li>
							</ul>
						</template>
						<template v-else>
							<li class="el-submenu">
								<div class="el-submenu__title el-menu-item" style="padding-left: 20px;height: 56px;line-height: 56px;padding: 0 20px;" :class="$route.path==item.children[0].path?'is-active':''" @click="$router.push(item.children[0].path)"><i :class="item.iconCls"></i></div>
							</li>
						</template>
					</li>
				</ul>
			</aside>
			<section class="content-container">
				<div class="grid-content bg-purple-light">
					<el-col :span="24" class="breadcrumb-container">
						<strong class="title">{{$route.name}}</strong>
						<el-breadcrumb separator="/" class="breadcrumb-inner">
							<el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
								{{ item.name }}
							</el-breadcrumb-item>
						</el-breadcrumb>
					</el-col>
					<el-col :span="24" class="content-wrapper">
						<transition name="fade" mode="out-in">
							<router-view></router-view>
						</transition>
					</el-col>
				</div>
			</section>
		</el-col>
		<el-dialog title="修改密码" :visible.sync="modPwdVisible" :close-on-click-modal="false">
			<el-form :model="modPwdForm" label-width="80px" :rules="modPwdFormRules" ref="modPwdForm">
				<el-form-item label="原密码" prop="oldPwd">
					<el-input type="password" v-model="modPwdForm.oldPwd"></el-input>
				</el-form-item>
				<el-form-item label="新密码" prop="newPwd">
					<el-input type="password" v-model="modPwdForm.newPwd"></el-input>
				</el-form-item>
				<el-form-item label="确认密码" prop="rePwd">
					<el-input type="password" v-model="modPwdForm.rePwd"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="modPwdVisible = false">取消</el-button>
				<el-button type="primary" @click.native="modPwdSubmit" :loading="modPwdLoading">提交</el-button>
			</div>
		</el-dialog>
	</el-row>
</template>

<script>
	import { getRsa, editPassword } from '../api/api';
	import Cookies from 'js-cookie'
	import { BigInteger } from 'jsbn'
	import { JSEncrypt } from 'jsencrypt'
	import hexabase from 'hexabase'
	//加密密码
	const getPasswordByRsa = (rsa, password) => {
	  const passEncrypt = new JSEncrypt()
	  passEncrypt.setKey({
	    n: new BigInteger(rsa.m, 16),
	    e: parseInt(rsa.p, 16)
	  })
	  return hexabase({
	    to: 'hex',
	    data: passEncrypt.encrypt(password)
	  })
	}

	export default {
		data() {
			var validatePass = (rule, value, callback) => {
	           if (value === "") {
	            callback(new Error("请再次输入密码"));
	          } else if (value !== this.modPwdForm.newPwd) {
	           callback(new Error("两次输入密码不一致!"));
	            } else {
	            callback();
	          }
	        };
			return {
				sysName:'后台管理系统',
				collapsed:false,
				sysUserName: '',
				form: {
					name: '',
					region: '',
					date1: '',
					date2: '',
					delivery: false,
					type: [],
					resource: '',
					desc: ''
				},

				modPwdVisible: false,
				modPwdForm: {},
				modPwdLoading: false,
				modPwdFormRules: {
					oldPwd: [
						{ required: true, message: '请输入原密码', trigger: 'blur' }
					],
					newPwd: [
						{ required: true, message: '请输入新密码', trigger: 'blur' }
					],
					rePwd: [
						{ required: true, validator: validatePass, trigger: 'blur' }
					]
				},
			}
		},
		methods: {
			onSubmit() {
				console.log('submit!');
			},
			handleopen() {
				//console.log('handleopen');
			},
			handleclose() {
				//console.log('handleclose');
			},
			handleselect: function (a, b) {
			},
			//退出登录
			logout: function () {
				var _this = this;
				this.$confirm('确认退出吗?', '提示', {
					//type: 'warning'
				}).then(() => {
					Cookies.remove('user_info')
					_this.$router.push('/login');
				}).catch(() => {

				});


			},
			//折叠导航栏
			collapse:function(){
				// this.collapsed=!this.collapsed;
			},
			showMenu(i,status){
				this.$refs.menuCollapsed.getElementsByClassName('submenu-hook-'+i)[0].style.display=status?'block':'none';
			},
			//修改密码提交
			modPwdSubmit: function () {
				this.$refs.modPwdForm.validate((valid) => {
					if (valid) {
			            //获取rsa
			            getRsa().then(data => {
			              this.modPwdLoading = true;
			              //登陆
			              editPassword({ 
			                oldPwd: getPasswordByRsa(data.data.data,this.modPwdForm.oldPwd),
			                newPwd: getPasswordByRsa(data.data.data,this.modPwdForm.newPwd),
			                m:data.data.data.m,
			                p:data.data.data.p,
			              }).then(data => {
			              	
			                this.modPwdLoading = false;
			                let msg = data.data.message;
			                let code = data.data.code;
			                if (code !== 200) {
			                  this.$message({
			                    message: msg,
			                    type: 'error'
			                  });
			                } else {
			                	this.modPwdVisible = false;
								this.$message({
									message: '修改成功',
									type: 'success'
								});
								this.$refs['modPwdForm'].resetFields();
							}
			              });
			            });
			          } else {
			            console.log('error submit!!');
			            return false;
			          }
				});
			},
		},
		mounted() {
			let cookie = Cookies.get('user_info');
			if(cookie){
				cookie = JSON.parse(cookie);
				this.sysUserName = cookie.name || '';
			}
		}
	}

</script>

<style scoped lang="scss">
	@import '~scss_vars';
	
	.container {
		position: absolute;
		top: 0px;
		bottom: 0px;
		width: 100%;
		.header {
			height: 60px;
			line-height: 60px;
			background: $color-primary;
			color:#fff;
			.userinfo {
				text-align: right;
				padding-right: 35px;
				float: right;
				.userinfo-inner {
					cursor: pointer;
					color:#fff;
					img {
						width: 40px;
						height: 40px;
						border-radius: 20px;
						margin: 10px 0px 10px 10px;
						float: right;
					}
				}
			}
			.logo {
				//width:230px;
				height:60px;
				font-size: 22px;
				padding-left:20px;
				padding-right:20px;
				border-color: rgba(238,241,146,0.3);
				border-right-width: 1px;
				border-right-style: solid;
				img {
					width: 40px;
					float: left;
					margin: 10px 10px 10px 18px;
				}
				.txt {
					color:#fff;
				}
			}
			.logo-width{
				width:200px;
			}
			.logo-collapse-width{
				width:60px
			}
			.tools{
				padding: 0px 23px;
				width:14px;
				height: 60px;
				line-height: 60px;
				cursor: pointer;
			}
		}
		.main {
			display: flex;
			// background: #324057;
			position: absolute;
			top: 60px;
			bottom: 0px;
			overflow: hidden;
			aside {
				flex:0 0 200px;
				width: 200px;
				// position: absolute;
				// top: 0px;
				// bottom: 0px;
				.el-menu{
					height: 100%;
				}
				.collapsed{
					width:60px;
					.item{
						position: relative;
					}
					.submenu{
						position:absolute;
						top:0px;
						left:60px;
						z-index:99999;
						height:auto;
						display:none;
					}

				}
			}
			.menu-collapsed{
				flex:0 0 60px;
				width: 60px;
			}
			.menu-expanded{
				flex:0 0 200px;
				width: 200px;
			}
			.content-container {
				// background: #f1f2f7;
				flex:1;
				// position: absolute;
				// right: 0px;
				// top: 0px;
				// bottom: 0px;
				// left: 230px;
				overflow-y: scroll;
				padding: 20px;
				.breadcrumb-container {
					//margin-bottom: 15px;
					.title {
						width: 200px;
						float: left;
						color: #475669;
					}
					.breadcrumb-inner {
						float: right;
					}
				}
				.content-wrapper {
					background-color: #fff;
					box-sizing: border-box;
				}
			}
		}
	}
</style>