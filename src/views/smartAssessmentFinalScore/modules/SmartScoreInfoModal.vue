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
    <smart-answer-ass-score-list :main-id="answerAssContentId"></smart-answer-ass-score-list>
  </j-modal>
</template>

<script>

  import { getAction } from '@api/manage'
  import SmartScoreFileList from './SmartScoreFileList'
  import SmartAnswerAssScoreList from "./SmartAnswerAssScoreList";
  export default {
    name: 'SmartScoreInfoModal',
    components: {
      SmartAnswerAssScoreList,
      SmartScoreFileList
    },
    props: {
      maxScore: {
        type: Number,
        default: 0,
        required: false
      },
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
      edit (answerAssContentId) {
        this.visible=true
        this.answerAssContentId = answerAssContentId
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        // this.$refs.realForm.submitForm();
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