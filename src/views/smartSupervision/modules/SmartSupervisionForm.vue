<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <!-- 主表单区域 -->
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="标题" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="title">
              <a-input v-model="model.title" placeholder="请输入标题"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="正文" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="content">
              <j-editor v-show="!formDisabled" v-model="model.content" />
              <div v-html="model.content" v-show="formDisabled" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item
              label="监督检查时间"
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              prop="supervisionTime"
            >
              <j-date placeholder="请选择监督检查时间" v-model="model.supervisionTime" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <!-- <a-col :span="24" >
            <a-form-model-item label="创建人员工号" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="creatorNo">
              <a-input v-model="model.creatorNo" placeholder="请输入创建人员工号" ></a-input>
            </a-form-model-item>
          </a-col> -->
          <a-col :span="24">
            <a-form-model-item label="附件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="file">
              <j-upload v-model="model.file"></j-upload>
              <!-- <vue-core-image-upload
                :class="['btn', 'btn-primary']"
                :crop="false"
                @imageuploaded="imageuploaded"
                :data="data"
                :max-file-size="5242880"
                url="your server url"
              >
              </vue-core-image-upload> -->
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
import VueCoreImageUpload from 'vue-core-image-upload'

export default {
  name: 'SmartSupervisionForm',
  components: {
    EloamModal,
    VueCoreImageUpload,
  },
  data() {
    return {
      rootUrl: '/smartSupervision/smartSupervision',
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      labelCol2: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol2: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
      model: {},
      confirmLoading: false,
      // 新增时子表默认添加几行空数据
      addDefaultRowNum: 1,
      validatorRules: {
        title: [{ required: true, message: '请输入标题!' }],
        supervisionTime: [{ required: true, message: '请输入监督检查时间!' }],
        creatorNo: [{ required: true, message: '请输入创建人员工号!' }],
      },
      refKeys: ['smartSupervisionAnnex'],
      tableKeys: ['smartSupervisionAnnex'],
      activeKey: 'smartSupervisionAnnex',
      // 8项规定监督检查附件表

      url: {
        add: '/smartSupervision/smartSupervision/add',
        edit: '/smartSupervision/smartSupervision/edit',
        queryById: '/smartSupervision/smartSupervision/queryById',
      },
    }
  },
  props: {
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {},
  methods: {
    imageuploaded(res) {
      if (res.errcode == 0) {
        this.src = 'http://img1.vued.vanthink.cn/vued751d13a9cb5376b89cb6719e86f591f3.png'
      }
    },
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.visible = true
      this.editAfter()
    },
    /** 调用完edit()方法之后会自动调用此方法 */
    editAfter() {
      this.$nextTick(() => {})
      // 加载子表数据
      if (this.model.id) {
        console.log(this.model)
        let params = { id: this.model.id }
        getAction(this.url.queryById, params).then((res) => {
          if (res.success) {
            this.model = res.result
          }
        })
      }
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
    /** 整理成formData */
    classifyIntoFormData(allValues) {
      let main = Object.assign(this.model, allValues.formValue)
      return {
        ...main, // 展开
        smartCreateAdviceAnnexList: allValues.tablesValue[0].values,
      }
    },
    validateError(msg) {
      this.$message.error(msg)
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
        // 更新表单中文件url字段, file 为字段名称
        this.$set(this.model, 'file', arr.join())
      }
    },
  },
}
</script>

<style scoped>
</style>