<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="type">
              <j-dict-select-tag
                type="list"
                v-model="model.type"
                dictCode="publicity_category"
                placeholder="请选择类型"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="村镇(街道)" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="location">
              <select-village-street-depart v-model="model.location" />
              <!-- <j-select-depart v-model="model.location" multi /> -->
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="标题" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="title">
              <a-input v-model="model.title" placeholder="请输入标题"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="附件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="file">
              <j-upload v-model="model.file" :multiple="false"></j-upload>
              <a-button icon="camera" @click="eloamScan">高拍仪拍照</a-button>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
      <eloam-modal ref="modalForm" @ok="scanOk" biz-path="before"></eloam-modal>
    </j-form-container>
  </a-spin>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'
import EloamModal from '@views/eloam/modules/EloamModal'
import SelectVillageStreetDepart from '@/components/common/SelectVillageStreetDepart.vue'

export default {
  name: 'SmartPublicityPartyForm',
  components: {
    EloamModal,
    SelectVillageStreetDepart,
  },
  props: {
    // 表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
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
      validatorRules: {
        type: [{ required: true, message: '请选择类型' }],
        location: [{ required: true, message: '请选择村镇(街道)' }],
        title: [{ required: true, message: '请输入标题' }],
      },
      url: {
        add: '/smartPublicityParty/smartPublicityParty/add',
        edit: '/smartPublicityParty/smartPublicityParty/edit',
        queryById: '/smartPublicityParty/smartPublicityParty/queryById',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    // 备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    add() {
      this.edit(this.modelDefault)
    },
    eloamScan() {
      this.$refs.modalForm.open()
    },
    scanOk(url) {
      let image = url
      if (image) {
        let arr = []
        // 考虑如果存在已经上传的文件，则拼接起来，没有则直接添加
        if (this.model.file) {
          arr.push(this.model.file)
        }
        arr.push(image)
        // 更新表单中文件url字段, files 为字段名称
        this.$set(this.model, 'file', arr.join())
      }
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.visible = true
    },
    submitForm() {
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
            })
        }
      })
    },
  },
}
</script>
