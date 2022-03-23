<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="问卷" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="surveyId">
              <j-dict-select-tag
                v-model="model.surveyId"
                dictCode="smart_paper,paper_name,id"
                :async="true" disabled>
              </j-dict-select-tag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="走访人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="visiterId">
              <j-dict-select-tag
                v-model="model.visiterId"
                dictCode="sys_user,realname,id"
                :async="true" disabled>
              </j-dict-select-tag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="被走访人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="intervieweeId">
              <j-dict-select-tag
                v-model="model.intervieweeId"
                dictCode="sys_user,realname,id"
                :async="true" disabled>
              </j-dict-select-tag>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="地点" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="place">
              <a-input v-model="model.place" placeholder="请输入地点"  ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="主要问题" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="question">
              <a-textarea v-model="model.question" rows="4" placeholder="请输入主要问题" />
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
  import { FormTypes,getRefPromise,VALIDATE_NO_PASSED } from '@/utils/JEditableTableUtil'
  import { JEditableTableModelMixin } from '@/mixins/JEditableTableModelMixin'

  export default {
    name: 'SmartTripeoQuestionForm',
    mixins: [JEditableTableModelMixin],
    components: {
    },
    props: {
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      },
      info:{
        type:Object,
        required: true
      }
    },
    data () {
      return {
        model:{
          visiterId:"",
          intervieweeId:"",
          surveyId:"",
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
          place:[
            {required:true,message:"请输入地点！"}
          ],
          question:[
            {required:true,message:"请输入主要问题！"}
          ],
        },
        url: {
          add: "/SmartTripeoQuestion/smartTripeoQuestion/add",
          edit: "/SmartTripeoQuestion/smartTripeoQuestion/edit",
          queryById: "/SmartTripeoQuestion/smartTripeoQuestion/queryById"
        }
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
    },
    created () {
     this.getInfo();
       //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    methods: {
      getInfo(){
        this.model.visiterId = this.info.visiterId
        this.model.intervieweeId = this.info.intervieweeId
        this.model.surveyId = this.info.surveyId
      },
      add () {
        this.edit(this.modelDefault);
      },
      edit (record) {
        this.model = Object.assign({}, record);
        this.visible = true;
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