<template>
  <a-card title='问题填报' :bordered='false'>
    <a-button slot='extra' type='primary' @click='handleOk'>
      提交
    </a-button>
    <smart-tripeo-question-form ref='realForm' @ok='submitCallback' :info="info"></smart-tripeo-question-form>
    <template slot='actions' class='ant-card-actions'>
      <a-button type='primary' @click='handleOk'>
        提交
      </a-button>
    </template>
  </a-card>
</template>

<script>
import SmartTripeoQuestionForm from '@views/SmartTripeoQuestion/modules/SmartTripeoQuestionForm'

export default {
  name: 'AddSmartTripeoQuestion',
  components: {
    SmartTripeoQuestionForm,
  },
  data() {
    return {
      info:{
        visiterId:"",
        intervieweeId:"",
        surveyId:"",
      },
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },
      pathUrl:"",
    }
  },
  created() {
    console.log(this.$route.query)
    let info = this.$route.query
    this.info.visiterId = info.visiterId
    this.info.intervieweeId = info.intervieweeId
    this.info.surveyId = info.surveyId
  },
  beforeRouteEnter(to, from, next) {
    next(vm=>{          //  这里的vm指的就是vue实例，可以用来当做this使用
      console.log(to)
      console.log(from)
      vm.pathUrl = from.name;
    })
  },

  methods: {
    handleOk () {
      this.$refs.realForm.submitForm();
    },
    submitCallback(){
      this.$emit('ok');
      if(this.pathUrl === "myTriPrePlusSurvey"){
        // this.$router.push({
        //   name: "SmartTriSurveyList",
        // });
        window.location.href="about:blank";
        window.close();
        window.opener.location.reload();
      }else if(this.pathUrl === "myTriPrePlusGov"){
        // this.$router.push({
        //   name: "SmartTriGovList",
        // });
        window.location.href="about:blank";
        window.close();
        window.opener.location.reload();
      } else {
        window.location.href="/webview/survey"
      }

    },
    add () {
      this.visible=true
      this.$nextTick(()=>{
        this.$refs.realForm.add();
      })
    },
    edit (record) {
      this.visible=true
      this.$nextTick(()=>{
        this.$refs.realForm.edit(record);
      })
    },
  }
}
</script>

<style scoped>

</style>