<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-form-model-item label="所属村镇" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="location">
              <select-village-depart v-model="model.location" @change="changeVillage" />
              <!-- <j-select-depart v-model="model.location" multi /> -->
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="人员选择" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="people">
              <j-search-select-tag type="list" v-model="model.people" :dict="peopleDict" placeholder="请选择人员选择" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="人员类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="peopleType">
              <j-dict-select-tag
                type="list"
                v-model="model.peopleType"
                dictCode="lead_people_type"
                placeholder="请选择人员类型"
              />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="职务" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="job">
              <j-dict-select-tag type="list" v-model="model.job" dictCode="lead_job" placeholder="请选择职务" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="照片" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="picture">
              <j-image-upload isMultiple v-model="model.picture"></j-image-upload>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="职能" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="title">
              <a-input v-model="model.title" placeholder="请输入职能"></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="文件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="file">
              <j-upload v-model="model.file"></j-upload>
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
import SelectVillageDepart from '@/components/common/SelectVillageDepart.vue'
// import SelectVillageDepart from '../../../../components/common/SelectVillageDepart.vue'

export default {
  name: 'SmartVillageLeadForm',
  components: {
    EloamModal,
    SelectVillageDepart,
  },
  props: {
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  data() {
    return {
      model: {},
      peopleDict: '',
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
        people: [{ required: true, message: '请输入人员选择!' }],
        peopleType: [{ required: true, message: '请输入人员类型!' }],
        job: [{ required: true, message: '请输入职务!' }],
        location: [{ required: true, message: '请输入所属村!' }],
        picture: [{ required: true, message: '请上传照片!' }],
      },
      url: {
        add: '/smartVillageLead/smartVillageLead/add',
        edit: '/smartVillageLead/smartVillageLead/edit',
        queryById: '/smartVillageLead/smartVillageLead/queryById',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
  },
  created() {
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    changeVillage(val) {
      this.peopleDict = `sys_user,realname,idnumber,depart_id='${val}' and (home_role='1' or home_role='2')`
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
    add() {
      this.edit(this.modelDefault)
    },
    edit(record) {
      this.model = Object.assign({}, record)
      this.peopleDict = `sys_user,realname,idnumber,depart_id='${record.location}' and (home_role='1' or home_role='2')`
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