<template>
  <div>
    <!-- 发布考试弹框 -->
    <j-modal
      :title="title"
      :width="width"
      :visible="visible"
      switchFullscreen
      @ok="handleOk"
      :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
      @cancel="handleCancel"
      cancelText="关闭">
    <a-spin :spinning="confirmLoading">
        <j-form-container :disabled="formDisabled">
          <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
            <a-row>

              <a-col :span="24">
                <a-form-model-item label="调查问卷开始时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="examStarttime">
                  <j-date placeholder="请选择调查问卷开始时间"  v-model="model.examStarttime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
                </a-form-model-item>
              </a-col>

              <a-col :span="24">
                <a-form-model-item label="调查问卷结束时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="examEndtime">
                  <j-date placeholder="请选择调查问卷结束时间"  v-model="model.examEndtime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
                </a-form-model-item>
              </a-col>
              <!--         <a-col :span="12">选中的用户(v-model):{{ model.personId }}</a-col>&ndash;&gt;-->

            </a-row>
           <!-- <a-form-model-item
              :wrapperCol="{ span: 24 }"
              style="text-align: center"
            >
              <a-button @click="submitForm()" type="primary">发布</a-button>

            </a-form-model-item>-->
          </a-form-model>

        </j-form-container>
    </a-spin>
    </j-modal>
  </div>
</template>

<script>
import { validateDuplicateValue } from '@/utils/util'
import { httpAction,putAction, postAction,getAction } from '@/api/manage'

export default {
  name: "UpdateSurveyTime",
  props: {
    disabled: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  data() {
    return {
      title:'修改调查问卷时间',
      width:800,
      visible: false,
      disableSubmit: false,
      model: {
        users: []
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      surveyId: '',
      confirmLoading: false,
      validatorRules: {
        examStarttime: [
          { required: true, message: '请输入开始时间!' },
          {validator: this.validateStartTime, trigger: 'change'}
        ],
        examEndtime: [
          { required: true, message: '请输入结束时间!' },
          {validator: this.validateEndTime, trigger: 'change'}
        ],
      },

    };
  },
  methods: {
    validateStartTime(rule, value, callback){
      let nowDate = new Date().getTime() - 60000;
      let startTime = this.model.examStarttime;
      let startDate = new Date(
        Date.parse(startTime.replace(/-/g, "/"))
      ).getTime();
      console.log(new Date())
      console.log( new Date(
        Date.parse(startTime.replace(/-/g, "/"))
      ))
      if ( startDate < nowDate ) {
          callback("开始时间小于当前时间!")
      }else {
        callback()
      }
    },
    validateEndTime(rule, value, callback){
      let startTime = this.model.examStarttime;
      let deadline = this.model.examEndtime;
      let deadlineDate = new Date(
        Date.parse(deadline.replace(/-/g, "/"))
      ).getTime();

      let startDate = new Date(
        Date.parse(startTime.replace(/-/g, "/"))
      ).getTime();
      if (startDate > deadlineDate ) {

        callback("开始时间大于结束时间!")
      }else {
        callback()
      }
    },
   /* time(){
      //判断调查问卷时间
      let nowDate = new Date().getTime();
      let startTime = this.model.examStarttime;
      let deadline = this.model.examEndtime;
      console.log('deadline',deadline);
      let startDate = new Date(
        Date.parse(startTime.replace(/-/g, "/"))
      ).getTime();
      console.log(new Date())
      console.log( new Date(
        Date.parse(startTime.replace(/-/g, "/"))
      ))
      console.log(startDate,nowDate)
      console.log(startDate-nowDate)
      let deadlineDate = new Date(
        Date.parse(deadline.replace(/-/g, "/"))
      ).getTime();
      //调查问卷时间至少大于当前时间，并且开始时间小于结束时间
      if ( startDate < nowDate ) {
        //开始时间小于当前时间
        this.$elmessage({
          type:"error",
          message:"开始时间小于当前时间!"
        })
        return false
        //console.log('开始时间小于结束时间');
      } else if ( startDate > deadlineDate ) {
        this.$elmessage({
          type:"error",
          message:"开始时间大于结束时间!"
        })
        return false
      }else {
        return true
      }
    },*/
    UpdateSurveyTime(surveyId){
      this.visible = true;
      this.surveyId= surveyId
    },
    submitForm() {
      const that = this;
      // 触发表单验证
      this.$refs.form.validate(valid => {
        if (valid) {
            that.confirmLoading = true;
            let surveyId = that.surveyId;
            let url = "/SmartPaper/smartMyExam/UpdateSurveyTime/" + surveyId;
            putAction(url, this.model).then((res) => {
              if (res.success) {
                this.visible = false;
                this.$elmessage({
                  type: "success",
                  message: "修改成功！",
                  duration: 1000
                })
                that.$emit('ok');
              } else {
                this.$elmessage({
                  type: "error",
                  message: "修改失败！",
                  duration: 1000,
                })
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.model = {}
            })
          }
      })
    },
    close () {
      this.$emit('close');
      this.visible = false;
      this.model = {}
    },
    handleOk () {
      this.submitForm();
    },
    submitCallback(){
      this.$emit('ok');
      this.visible = false;
    },
    handleCancel () {
      this.close()
    }

  }
}
</script>
