<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="评分单位" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="departId">
              <j-select-depart v-model="model.departId" v-decorator="['departId', validatorRules.departId]" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" v-if="model.departId">
            <a-form-model-item label="评分人员" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="departUser">
              <my-select-user-by-dep v-model="model.departUser" :multi="false" :depart-id="model.departId" store="id" text="realname"/>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="负责单位" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="responsibleDepart">
              <j-select-depart v-model="model.responsibleDepart" :multi="true" :treeOpera="true"  />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="负责单位数量" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="responsibleAmount">
              <a-input-number v-model="model.responsibleAmount" placeholder="请输入负责单位数量" style="width: 100%" disabled/>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="创建日期" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="createTime">
              <j-date placeholder="请选择创建日期"  v-model="model.createTime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" disabled/>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import { validateDuplicateValue } from '@/utils/util'
  import { duplicateCheck } from '@/api/api'
  import MySelectUserByDep from "@views/smartAssessmentMission/modules/MySelectUserByDep";

  export default {
    name: 'SmartAssessmentDepartmentForm',
    components: {
      MySelectUserByDep
    },
    props: {
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    data () {
      return {
        model:{
         },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
        confirmLoading: false,
        validatorRules: {
          departId: [
            { required: true, message: '请选择要参与评分的单位!'},
            {validator: this.validateDepartId}
          ],
          departUser: [
            { required: true, message: '请选择负责该要点评分的考核单位评分人员!'},
          ],
          responsibleDepart: [
            { required: true, message: '请选择负责的单位!'},
          ],
        },
        url: {
          add: "/smartAssessmentDepartment/smartAssessmentDepartment/add",
          edit: "/smartAssessmentDepartment/smartAssessmentDepartment/edit",
          queryById: "/smartAssessmentDepartment/smartAssessmentDepartment/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
    },
    created () {
       //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    methods: {
      add () {
        this.edit(this.modelDefault);
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.visible = true;
      },
      validateDepartId(rule, value, callback){
        if(value){
          var params = {
            tableName: "smart_assessment_department",
            fieldName: "depart_id",
            fieldVal: value,
            dataId: this.model.id,
          };
          getAction("/sys/duplicate/checkWithDelFlag",params).then((res)=>{
            if(res.success){
              callback();
            }else{
              callback(res.message);
            }
          });
        }
      },
      validateResponsibleDepart(rule, value, callback){
        if(value){
          var params = {
            departIds: this.model.responsibleDepart,
            dataId: this.model.id
          };
          getAction("/smartAssessmentDepartment/smartAssessmentDepartment/duplicateCheck",params).then((res)=>{
            if(res.success){
              callback();
            }else{
              callback(res.message);
            }
          });
        }
      },
      submitForm () {
        const that = this;
        // 触发表单验证
        this.$refs.form.validate(valid => {
          if (valid) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            this.model.responsibleAmount = this.model.responsibleDepart.split(",").length
            httpAction(httpurl,this.model,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }

        })
      },
    }
  }
</script>