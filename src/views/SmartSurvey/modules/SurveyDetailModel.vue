<template>
  <j-modal
    :title="title"
    :width="1000"
    :visible="visible"
    :maskClosable="false"
    switchFullscreen
    :fullscreen = "true"
    @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    @cancel="handleCancel"
  >
    <survey-by-id-list ref="realList" @ok="submitCallback" :disabled="disableSubmit" />
  </j-modal>
</template>

<script>
import { getAction } from '../../../api/manage'
import SurveyByIdList from './SurveyByIdList.vue'
export default {
  name: 'SurveyDetailModel',
  components: { SurveyByIdList },
  data() {
    return {
      title: '',
      width: 800,
      visible: false,
      disableSubmit: false,
      anntId: ''
    }
  },
  methods: {
    add() {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add()
      })
    },
    edit(surveyId,paperName) {
      this.visible = true
      console.log(surveyId)
      this.title = paperName+'参与人问卷详情'
      // this.title = "【" + record.titile + "】"
      // this.anntId = record.id
      this.$nextTick(() => {
        this.$refs.realList.edit(surveyId,paperName)
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    /*    handleOk() {
          this.$refs.realForm.handleOk()
        },*/
    handleOk() {
      this.close()
    },
    submitCallback() {
      this.$emit('ok')
      this.visible = false
    },
    handleCancel() {
      this.close()
    },
    handleBatchDownload(record) {
      this.$refs.realList.handleBatchDownload(record)
    },
    remindAll(anntId, type) {
      getAction('/sys/sysAnnouncementSend/remindAll',{anntId: anntId, type:type}).then((res) => {
        if(res.success) {
          this.$message.success(res.message)
        }
      })
    }
  },
}
</script>

<style scoped>
</style>