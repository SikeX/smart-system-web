<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    switchFullscreen
    @ok="handleOk"
    @cancel="handleCancel"
    cancelText="关闭"
  >
    <a-spin :spinning="confirmLoading">
      <j-form-container :disabled="disableSubmit">
        <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
          <a-row>
            <meeting-card
              name="农村集体经济组织理事会商议"
              :file.sync="model.file1"
              :people.sync="model.people1"
              :video.sync="model.video1"
              :videoPeople.sync="model.videoPeople1"
              :disableSubmit="disableSubmit"
            />
            <meeting-card
              name="股东代表大会决议"
              :file.sync="model.file2"
              :people.sync="model.people2"
              :video.sync="model.video2"
              :videoPeople.sync="model.videoPeople2"
              :disableSubmit="disableSubmit"
            />
            <meeting-card
              name="成员大会或者成员代表大会决议"
              :file.sync="model.file3"
              :people.sync="model.people3"
              :video.sync="model.video3"
              :videoPeople.sync="model.videoPeople3"
              :disableSubmit="disableSubmit"
            />
          </a-row>
        </a-form-model>
      </j-form-container>
    </a-spin>
  </j-modal>
</template>

<script>
import { httpAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'
import { postAction, getAction } from '../../../../api/manage'
import MeetingCard from './MeetingCard'

export default {
  name: 'SmartGroupEconomyMeetingModal',
  components: {
    MeetingCard,
  },
  props: {
    mainId: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      title: '操作',
      width: 800,
      visible: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },

      confirmLoading: false,
      validatorRules: {},
      url: {
        add: '/smartGroupEconomy/smartGroupEconomy/addSmartGroupEconomyMeeting',
        edit: '/smartGroupEconomy/smartGroupEconomy/editSmartGroupEconomyMeeting',
      },
      disableSubmit: false,
    }
  },
  created() {
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    add(record) {
      this.model = Object.assign({}, { mainId: record.id })
      this.visible = true
    },
    edit(record) {
      console.log(record)
      this.model = Object.assign({}, record)
      this.visible = true
    },
    show(record) {
      this.visible = true
      getAction('/smartGroupEconomy/smartGroupEconomy/getMeetingByMainId', { mainId: record.id }).then((res) => {
        if (res.success) {
          this.model = res.result
        } else {
          this.$message.error(res.message)
        }
      })
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.$refs.form.clearValidate()
    },
    handleOk() {
      const that = this
      console.log(this.model)
      // 触发表单验证
      this.$refs.form.validate((valid) => {
        if (valid) {
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          // this.model['mainId'] = this.mainId
          // console.log(this.model)

          httpAction(httpurl, this.model, method)
            .then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            })
            .finally(() => {
              that.confirmLoading = false
              that.close()
            })
        } else {
          return false
        }
      })
    },
    handleCancel() {
      this.close()
    },
  },
}
</script>
