<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel"
    cancelText="关闭">
    <smart-score-file-list :main-id='answerAssContentId'></smart-score-file-list>
    <smart-score-info-form ref="realForm" @ok="submitCallback" :main-id='answerAssContentId' :disabled="disableSubmit"></smart-score-info-form>
  </j-modal>
</template>

<script>

  import SmartScoreInfoForm from './SmartScoreInfoForm'
  import { getAction } from '@api/manage'
  import SmartScoreFileList from '@views/smartAssessmentScore/modules/SmartScoreFileList'
  export default {
    name: 'SmartScoreInfoModal',
    components: {
      SmartScoreFileList,
      SmartScoreInfoForm
    },
    data () {
      return {
        title:'',
        answerAssContentId: '',
        width:800,
        visible: false,
        disableSubmit: false
      }
    },
    methods: {
      add () {
        this.visible=true
        this.$nextTick(()=>{
          this.$refs.realForm.add();
        })
      },
      edit (contentId, mainId) {
        this.visible=true
        this.$nextTick(()=>{
          this.$refs.realForm.edit();
        })

        let params = {
          assContentId: contentId,
          mainId: mainId
        }

        getAction('/smartAnswerAssContent/smartAnswerAssContent/list', params).then((res) => {
          if (res.success) {
            let result = res.result
            if(Number(result.total)>0){
              this.answerAssContentId = res.result.records[0].id
            }else{
              this.record = ''
            }
          }
          if(res.code===510){
            this.$message.warning(res.message)
          }
        })
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        this.$refs.realForm.submitForm();
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