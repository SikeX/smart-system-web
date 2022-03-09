<template>
  <div>
  <a-card title="查询" :body-style="{padding: '32px 32px'}" :bordered="true">
    <a-form @submit="search" :form="form"  ref="form">

    <a-form-item label="姓名"
                       :labelCol="{ span: 4 }"
                       :wrapperCol="{ span: 14 }"  >
      <a-input  placeholder="请输入姓名"
               v-decorator="['realname',validatorRules.realname]"
               name="realname"/>
    </a-form-item>
    <a-form-item label="身份证号"
                       :labelCol="{ span: 4 }"
                       :wrapperCol="{ span: 14 }" >
      <a-input placeholder="请输入身份证号"
               v-decorator="['idcard',validatorRules.idcard]"
               name="idcard"/>
    </a-form-item>
    <a-form-item :wrapperCol="{ span: 24 }" style="text-align: center">
      <a-button htmlType="submit" type="primary" >查询</a-button>
    </a-form-item>

    </a-form>
  </a-card>
  <faithless-people-list ref="list"></faithless-people-list>
  </div>
</template>
<script>
import signMd5Utils from '../../utils/encryption/signMd5Utils'
import axios from 'axios'
import { httpAction, getAction } from '@/api/manage'
import AFormItem from 'ant-design-vue/lib/form/FormItem'
import FaithlessPeopleList from './FaithlessPeopleList'

export default {
  components: { AFormItem ,FaithlessPeopleList},
  data() {
    return {
      form: this.$form.createForm(this),
      validatorRules: {
        realname: {//name与v-decorator中属性对应
          rules: [{ required: true, message: '请输入姓名'},
            { pattern: /^([\u4e00-\u9fa5]){2,13}$/, message: '请输入2-13位的中文姓名!'},//此处配置正则表达式
          ]
        },
        idcard: {//name与v-decorator中属性对应
        rules: [{ required: true, message: '请输入身份证号'},{validator: this.validateIdCard}]
        },
      },
      url: {
        search: "/faithless/search",
      }
    };
  },
  computed: {
  },

  methods:{
    search(e){
      let that = this
      e.preventDefault()
      that.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
          let httpurl = '';
          let method = '';
          httpurl+=that.url.search;
          method = 'post';
          httpAction(httpurl,values,method).then((res)=>{
            console.log(res)
            if(res.success){
              console.log(res.result.total)
              if(res.result.total === 0){
                that.$message.success("暂无相关信息！"); //无失信记录
              }else{
                that.$message.success("查询成功");  //有失信记录，渲染表格
              }
              this.$refs.list.loadData(res)
            }else{
              if(res.code === 400){           //code：400，输入信息有误
                that.$message.warning(res.message);
              }
              that.$message.warning("error!");
            }
          })
        }
      })
    }
  },
  validateIdCard(rule, value, callback){
    if(!value){
      callback()
    }else{
      var checkCode = function (value) {
        var p = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
        var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
        var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
        var code = value.substring(17);
        if(p.test(value)) {
          var sum = 0;
          for(var i=0;i<17;i++) {
            sum += value[i]*factor[i];
          }
          if(parity[sum % 11] == code.toUpperCase()) {
            return true;
          }
        }
        return false;
      }
      var checkDate = function (value) {
        var pattern = /^(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)$/;
        if(pattern.test(value)) {
          var year = value.substring(0, 4);
          var month = value.substring(4, 6);
          var date = value.substring(6, 8);
          var date2 = new Date(year+"-"+month+"-"+date);
          if(date2 && date2.getMonth() == (parseInt(month) - 1)) {
            return true;
          }
        }
        return false;
      }
      var checkProv = function (value) {
        var pattern = /^[1-9][0-9]/;
        var provs = {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江 ",31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北 ",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏 ",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门"};
        if(pattern.test(value)) {
          if(provs[value]) {
            return true;
          }
        }
        return false;
      }
      var checkID = function (value) {
        if(checkCode(value)) {
          var date = value.substring(6,14);
          if(checkDate(date)) {
            if(checkProv(value.substring(0,2))) {
              return true;
            }
          }
        }
        return false;
      }
      if(checkID(value)){
        console.log("validate")
        var params = {
          tableName: 'sys_user',
          fieldName: 'idnumber',
          fieldVal: value,
          dataId: this.userId
        };
        duplicateCheck(params).then((res) => {
          if (res.success) {
            //console.log(res)
            callback()
          } else {
            callback("身份证号已存在!")
          }
        })
      }else{
        callback("请输入正确的身份证号!");
      }
    }
  },
};
</script>
