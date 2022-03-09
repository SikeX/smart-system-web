<template>
  <j-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :maskClosable="false"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    @cancel="handleCancel"
  >
    <a-row type="flex" justify="center">
      <a-col :span="22">
        <a-card style="width: 100%; margin: 1rem 0">
          <a-card-meta title="填表说明" :description="typeDesc"> </a-card-meta>
        </a-card>
      </a-col>
    </a-row>

    <smart-post-marriage-report-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit" @refreshList="refreshList"/>
  </j-modal>
</template>

<script>
import { getAction } from '../../../api/manage'
import SmartPostMarriageReportForm from './SmartPostMarriageReportForm'

export default {
  name: 'SmartPostMarriageReportModal',
  components: {
    SmartPostMarriageReportForm,
  },
  data() {
    return {
      title: '',
      preId: '',
      width: 800,
      visible: false,
      disableSubmit: false,
      typeDesc: '',
      typeName: '婚后报备',
    }
  },
  methods: {
    //刷新list
    refreshList(){
      this.$emit('refreshList')
    },

    add() {
      this.visible = true
      this.$refs.realForm.model.preId = this.preId

      console.log(this.preId + "这是婚后")

      getAction('/taskType/smartVerifyType/queryByTypeName', { typeName: this.typeName }).then((res) => {
        if (res.success) {
          this.typeDesc = res.result
        }
      })

      this.$nextTick(() => {
        this.$refs.realForm.add()
      })
    },
    edit(record) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.edit(record)
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleOk() {
      let that = this
      
       this.$confirm({
        title: '确认提交？',
        content: '提交后无法更改，请仔细核对！',
        onOk() {
          that.$refs.realForm.submitForm()
        },
        onCancel() {},
      });

      
    },
    submitCallback() {
      this.$emit('ok')
      this.visible = false
    },
    handleCancel() {
      this.close()
    },
    postAdd(record) {
      this.visible = true

      getAction('/taskType/smartVerifyType/queryByTypeName', { typeName: this.typeName }).then((res) => {
        if (res.success) {
          this.typeDesc = res.result
        }
      })
      this.$nextTick(() => {
        this.$refs.realForm.add()
        this.$refs.realForm.model.preId = record.id

        getAction('/smartPostMarriage/smartPostMarriageReport/getUserInfo', {}).then((res) => {
        if (res.success) {
          this.$refs.realForm.model.personId = res.result.id
          this.$refs.realForm.model.name = res.result.realname
          this.$refs.realForm.model.sex = res.result.sex
          this.$refs.realForm.model.job = res.result.post
          this.$refs.realForm.model.jobLevel = res.result.positionRank
          this.$refs.realForm.model.politicsStatus = res.result.politicalStatus

          let birth = res.result.birthday
          if(birth == "undefined" || birth == null || birth == ""){
            this.$refs.realForm.model.age = 0
          }else{
            this.$refs.realForm.model.age = this.$refs.realForm.$options.methods.ages(birth.slice(0, 11))
      }

        }
      })

      })
    },
  },
}
</script>

<style scoped>
</style>