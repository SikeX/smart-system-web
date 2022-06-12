<template>
  <a-modal
    :title="title"
    :width="modalWidth"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <a-form :form="form" ref='form'>
        <a-form-item label="手机" :labelCol="{span: 5}" :wrapperCol="{span: 19}">
          <a-row :gutter="16">
            <a-col class="gutter-row" :span="20">
              <a-input autocomplete="false" placeholder="请输入手机号"
                       v-decorator="[ 'phone', validatorRules.phone]">
                <a-icon slot="prefix" type="phone" :style="{ color: 'rgba(0,0,0,.25)'}"/>
              </a-input>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item label="验证码" :labelCol="{span: 5}" :wrapperCol="{span: 19}">
          <a-row :gutter="16">
            <a-col class="gutter-row" :span="12">
              <a-input type="text" placeholder="手机短信验证码" v-decorator="[ 'captcha', validatorRules.captcha]">
                <a-icon slot="prefix" type="code" :style="{ color: 'rgba(0,0,0,.25)'}"/>
              </a-input>
            </a-col>
            <a-col class="gutter-row" :span="8">
              <a-button
                tabindex="-1"
                size="default"
                :disabled="state.smsSendBtn"
                @click.stop.prevent="getCaptcha"
                v-text="!state.smsSendBtn && '获取验证码' || (state.time+' s')"></a-button>
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { postAction, putAction } from '@/api/manage'
import { duplicateCheck } from '@api/api'
import { mapGetters } from 'vuex'

export default {
  name: "userPhone",
  props: ['userList'],
  data() {
    return {
      title:"修改手机号码",
      modalWidth:800,
      visible: false,
      confirmLoading: false,
      loading: false,
      // accountName: this.userList.username,
      captcha: "",
      state: {
        time: 60,
        smsSendBtn: false,
      },
      confirmDirty:false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      validatorRules: {
        phone:{
          rules: [{ required: true, message: '请输入手机号码!' },
            { validator: this.validatePhone }],
        },
        captcha:{
          rules: [{ required: true, message: '请输入短信验证码!' }],
        }
        },
      form:this.$form.createForm(this),
      username:"",
      url: "sys/user/updatePhone",
    }
  },
  methods: {
    show(uname){
      if(!uname){
        this.$message.warning("当前系统无登录用户!");
        return
      }else{
        this.username = uname
        this.form.resetFields();
        this.visible = true;
      }
    },
    handleCancel () {
      this.close()
    },
    close () {
      this.$emit('close');
      this.visible = false;
      this.disableSubmit = false;
      this.selectedRole = [];
    },
    handleOk () {
      const that = this;
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true;
          let params = Object.assign({username:this.username},values)
          // console.log("修改手机提交数据",params)
          putAction(this.url,params).then((res)=>{
            if(res.success){
              //console.log(res)
              that.$message.success(res.message);
              that.close();
            }else{
              that.$message.warning(res.message);
            }
          }).finally(() => {
            that.confirmLoading = false;
          })
        }
      })
    },
    handleConfirmBlur  (e) {
      const value = e.target.value
      this.confirmDirty = this.confirmDirty || !!value
    },
    getCaptcha(e) {
      e.preventDefault();
      const that = this
      that.form.validateFields(['phone'], (err,values)=>{
        if(!err){
          that.state.smsSendBtn = true;
          let interval = window.setInterval(() => {
            if (that.state.time-- <= 0) {
              that.state.time = 60;
              that.state.smsSendBtn = false;
              window.clearInterval(interval);
            }
          }, 1000);
          const hide = that.$message.loading('验证码发送中..', 0);
          let smsParams = {
            mobile: that.form.getFieldValue('phone'),
            smsmode: "1"
          };
          postAction("/sys/getVerifyCode", smsParams).then(res => {
            if (!res.success) {
              setTimeout(hide, 1);
              that.cmsFailed(res.message);
            }
            setTimeout(hide, 500);
          })
        }else{
          that.cmsFailed(err);
        }
      })
    },
    cmsFailed(err) {
      this.$notification['error']({
        message: "验证错误",
        description: err,
        duration: 4,
      });
    },
    ...mapGetters(['username', 'nickname', 'avatar', 'userInfo']),
    validatePhone(rule, value, callback){
      if(!value){
        callback()
      }else{
        if(new RegExp(/^1[3|4|5|7|8|9][0-9]\d{8}$/).test(value)){
          let userId = this.userInfo().userId
          console.log("username")
          var params = {
            tableName: 'sys_user',
            fieldName: 'phone',
            fieldVal: value,
            dataId: userId
          };
          duplicateCheck(params).then((res) => {
            if (res.success) {
              //console.log(res)
              callback()
            } else {
              callback("手机号已存在!")
            }
          })
        }else{
          callback("请输入正确格式的手机号码!");
        }
      }
    },
  }

}
</script>

<style lang="less" scoped>
.stepFormText {
  margin-bottom: 24px;
}

.ant-form-item-label,
.ant-form-item-control {
  line-height: 22px;
}

.getCaptcha {
  display: block;
  width: 100%;
  height: 40px;
}
</style>
