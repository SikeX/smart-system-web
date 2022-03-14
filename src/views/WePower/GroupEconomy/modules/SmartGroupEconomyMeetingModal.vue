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
      <!-- TODO 表单禁用有问题 -->
      <j-form-container :disabled="disableSubmit">
        <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
          <a-row>
            <a-card title="农村集体经济组织理事会商议" style="width: 100%">
              <a-col :span="24">
                <a-form-model-item label="会议材料" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="file1">
                  <j-upload v-model="model.file1"></j-upload>
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="参会人员" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="people1">
                  <j-multi-select-tag
                    type="list_multi"
                    v-model="model.people1"
                    dictCode="smart_group_economy_people,name,id"
                    placeholder="请选择参会人员"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="会议照片" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="video1">
                  <j-image-upload isMultiple v-model="model.video1"></j-image-upload>
                </a-form-model-item>
              </a-col>
            </a-card>
            <a-card title="股东代表大会决议" style="width: 100%">
              <a-col :span="24">
                <a-form-model-item label="会议材料" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="file2">
                  <j-upload v-model="model.file2"></j-upload>
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="参会人员" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="people2">
                  <j-multi-select-tag
                    type="list_multi"
                    v-model="model.people2"
                    dictCode="smart_group_economy_people,name,id"
                    placeholder="请选择参会人员"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="会议照片" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="video2">
                  <j-image-upload isMultiple v-model="model.video2"></j-image-upload>
                </a-form-model-item>
              </a-col>
            </a-card>
            <a-card title="成员大会或者成员代表大会决议" style="width: 100%">
              <a-col :span="24">
                <a-form-model-item label="会议材料" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="file3">
                  <j-upload v-model="model.file3"></j-upload>
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="参会人员" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="people3">
                  <j-multi-select-tag
                    type="list_multi"
                    v-model="model.people3"
                    dictCode="smart_group_economy_people,name,id"
                    placeholder="请选择参会人员"
                  />
                </a-form-model-item>
              </a-col>
              <a-col :span="24">
                <a-form-model-item label="会议照片" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="video3">
                  <j-image-upload isMultiple v-model="model.video3"></j-image-upload>
                </a-form-model-item>
              </a-col>
            </a-card>
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

export default {
  name: 'SmartGroupEconomyMeetingModal',
  components: {},
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
          this.model['mainId'] = this.mainId
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
