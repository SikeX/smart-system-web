<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="teamName">
              <a-input v-model="model.teamName" placeholder="请输入名称" v-decorator="['teamName', validatorRules.teamName]" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="考核年度" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="assessmentYear">
              <a-input-number v-model="model.assessmentYear" placeholder="请输入考核年度" :min="0" style="width: 100%"></a-input-number>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="组长" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="teamLeader">
              <j-select-user-by-dep v-model="model.teamLeader" :multi="false" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="副组长" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="deputyTeamLeader">
              <j-select-user-by-dep v-model="model.deputyTeamLeader" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="成员" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="members">
              <j-select-user-by-dep v-model="model.members" store="id" text="realname" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="负责单位" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="departs">
              <j-select-depart v-model="model.departs" :multi="true" :treeOpera="true" v-decorator="['departs', validatorRules.departs]" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="负责单位数量" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="departAmount">
              <a-input-number v-model="model.departAmount" placeholder="请输入负责单位数量" style="width: 100%" disabled/>
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

  export default {
    name: 'SmartAssessmentTeamForm',
    components: {
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
          teamName: [
            { required: true, message: '请输入考核组名称!'},
            {validator: this.validateTeamName}
          ],
          assessmentYear: [
            { required: true, message: '请输入考核年度!'},
          ],
          teamLeader: [
            { required: true, message: '请选择组长!'},
          ],
          deputyTeamLeader: [
            { required: true, message: '请选择副组长!'},
          ],
          members: [
            { required: true, message: '请选择成员!'},
          ],
          departs: [
            { required: true, message: '请选择负责的单位!'},
            {validator: this.validateDeparts}
          ],
        },
        url: {
          add: "/smartAssessmentTeam/smartAssessmentTeam/add",
          edit: "/smartAssessmentTeam/smartAssessmentTeam/edit",
          queryById: "/smartAssessmentTeam/smartAssessmentTeam/queryById"
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
      validateTeamName(rule, value, callback){
        if(value){
          var params = {
            tableName: "smart_assessment_team",
            fieldName: "team_name",
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
      validateDeparts(rule, value, callback){
        if(value){
          var params = {
            departIds: this.model.departs,
            assessmentYear: this.model.assessmentYear,
            dataId: this.model.id
          };
          getAction("/smartAssessmentTeam/smartAssessmentTeam/duplicateCheck",params).then((res)=>{
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