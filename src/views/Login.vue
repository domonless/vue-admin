<template>
  <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-position="left" label-width="0px" class="demo-ruleForm login-container">
    <h3 class="title">系统登录</h3>
    <el-form-item prop="loginName">
      <el-input type="text" v-model="ruleForm.loginName" auto-complete="off" placeholder="账号"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input type="password" v-model="ruleForm.password" auto-complete="off" placeholder="密码" @keyup.enter.native="handleSubmit"></el-input>
    </el-form-item>
    <el-checkbox v-model="checked" checked class="remember">7天免登录</el-checkbox>
    <el-form-item style="width:100%;">
      <el-button type="primary" style="width:100%;" @click.native.prevent="handleSubmit" :loading="logining">登录</el-button>
      <!--<el-button @click.native.prevent="handleReset2">重置</el-button>-->
    </el-form-item>
  </el-form>
</template>

<script>
  import { requestLogin, getRsa, login } from '../api/api';
  import qs from 'qs'
  import Cookies from 'js-cookie'
  import { LoginUsers} from '../mock/data/user';
  import { BigInteger } from 'jsbn'
  import { JSEncrypt } from 'jsencrypt'
  import hexabase from 'hexabase'
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
  const tokenEncrypt = new JSEncrypt()
  export default {
    data() {
      return {
        logining: false,
        ruleForm: {
          loginName: '',
          password: ''
        },
        rules: {
          loginName: [
            { required: true, message: '请输入账号', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
          ]
        },
        checked: true
      };
    },
    methods: {
      handleReset() {
        this.$refs.ruleForm.resetFields();
      },
      handleSubmit(ev) {
        var _this = this;
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            //获取rsa
            getRsa().then(data => {
              this.logining = true;
              //登陆
              login(qs.stringify({ 
                loginName: this.ruleForm.loginName, 
                password: getPasswordByRsa(data.data.data,this.ruleForm.password),
                m:data.data.data.m,
                p:data.data.data.p,
                cm: tokenEncrypt.getKey().n.toString(16),
                cp: parseInt(tokenEncrypt.getKey().e).toString(16)
              })).then(data => {
                this.logining = false;
                let msg = data.data.message;
                let code = data.data.code;
                if (code !== 200) {
                  this.$message({
                    message: msg,
                    type: 'error'
                  });
                } else {
                  let token = data.data.data.token
                  data.data.data.token = tokenEncrypt.decrypt(hexabase({
                      to: 'base64',
                      data: token
                    }))
                  //存入cookies
                  if(this.checked){
                    Cookies.set('user_info',data.data.data,{ expires: 7 })
                    Cookies.set('is_aread',data.data.data.isAread,{ expires: 7 })
                    Cookies.set('user_type',data.data.data.userType,{ expires: 7 })
                  }else{
                    Cookies.set('user_info',data.data.data)
                    Cookies.set('is_aread',data.data.data.isAread)
                    Cookies.set('user_type',data.data.data.userType,{ expires: 7 })
                  }
                  this.$router.push({ path: '/' });
                  location.reload();
                }
              });
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      }
    }
  }

</script>

<style lang="scss" scoped>
  .login-container {
    /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    .title {
      margin: 0px auto 40px auto;
      text-align: center;
      color: #505458;
    }
    .remember {
      margin: 0px 0px 35px 0px;
    }
  }
</style>