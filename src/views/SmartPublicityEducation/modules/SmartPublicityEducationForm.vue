<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <!-- 主表单区域 -->
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24" >
            <a-form-model-item label="村庄" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="village">
              <a-input v-model="model.village" placeholder="请输入村庄" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="标题" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="title">
              <a-input v-model="model.title" placeholder="请输入标题" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="地点" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="address">
              <a-input v-model="model.address" placeholder="请输入地点" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="time">
              <j-date placeholder="请选择时间" v-model="model.time" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="附件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="files">
              <a-button icon="camera" v-on:click="imgClick()">手机拍照</a-button>
              <a-button icon="camera" @click="eloamScan">高拍仪拍照</a-button>
              <input
                style="float: left; display: none"
                type="file"
                id="uploadFile"
                accept="image/*"
                capture="camera"
                v-on:change="readLocalFile()"
              />
              <j-upload v-model="model.files" :biz-path="bizPath"  ></j-upload>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
      <!-- 子表单区域 -->
    <a-tabs v-model="activeKey" @change="handleChangeTabs">
      <a-tab-pane tab="宣传教育参会人员" :key="refKeys[0]" :forceRender="true">
        <j-editable-table
          :ref="refKeys[0]"
          :loading="smartPublicityEducationPeopleTable.loading"
          :columns="smartPublicityEducationPeopleTable.columns"
          :dataSource="smartPublicityEducationPeopleTable.dataSource"
          :maxHeight="300"
          :disabled="formDisabled"
          :rowNumber="true"
          :rowSelection="true"
          :actionButton="true"/>
      </a-tab-pane>
    </a-tabs>
    <eloam-modal ref="modalForm" @ok='scanOk'></eloam-modal>
  </a-spin>
</template>

<script>

import { getAction, postAction, uploadFile } from '@/api/manage'
  import { FormTypes,getRefPromise,VALIDATE_NO_PASSED } from '@/utils/JEditableTableUtil'
  import { JEditableTableModelMixin } from '@/mixins/JEditableTableModelMixin'
  import { validateDuplicateValue } from '@/utils/util'
import EloamModal from '@views/eloam/modules/EloamModal'

  export default {
    name: 'SmartPublicityEducationForm',
    mixins: [JEditableTableModelMixin],
    components: {
      EloamModal
    },
    data() {
      return {
        bizPath: 'edu',
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
        model:{
        },
        // 新增时子表默认添加几行空数据
        addDefaultRowNum: 1,
        validatorRules: {
           village: [
              { required: true, message: '请输入村庄!'},
           ],
           title: [
              { required: true, message: '请输入标题!'},
           ],
           address: [
              { required: true, message: '请输入地点!'},
           ],
           time: [
              { required: true, message: '请输入时间!'},
           ],
        },
        refKeys: ['smartPublicityEducationPeople', ],
        tableKeys:['smartPublicityEducationPeople', ],
        activeKey: 'smartPublicityEducationPeople',
        // 宣传教育参会人员
        smartPublicityEducationPeopleTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '参会人员姓名',
              key: 'name',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
          ]
        },
        url: {
          add: "/smartPublicityEducation/smartPublicityEducation/add",
          edit: "/smartPublicityEducation/smartPublicityEducation/edit",
          queryById: "/smartPublicityEducation/smartPublicityEducation/queryById",
          smartPublicityEducationPeople: {
            list: '/smartPublicityEducation/smartPublicityEducation/querySmartPublicityEducationPeopleByMainId'
          },
        }
      }
    },
    props: {
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    computed: {
      formDisabled(){
        return this.disabled
      },
    },
    created () {
    },
    methods: {
      eloamScan() {
        this.$refs.modalForm.open()
      },
      scanOk(url) {
        let image = url
        if (image) {
          let arr = []
          if (this.model.files) {
            arr.push(this.model.files)
          }
          arr.push(image)
          // 更新表单中文件url字段, files 为字段名称
          this.$set(this.model, 'files', arr.join())
        }
      },
      addBefore(){
        this.smartPublicityEducationPeopleTable.dataSource=[]
      },
      getAllTable() {
        let values = this.tableKeys.map(key => getRefPromise(this, key))
        return Promise.all(values)
      },
      /** 调用完edit()方法之后会自动调用此方法 */
      editAfter() {
        this.$nextTick(() => {
        })
        // 加载子表数据
        if (this.model.id) {
          let params = { id: this.model.id }
          this.requestSubTableData(this.url.smartPublicityEducationPeople.list, params, this.smartPublicityEducationPeopleTable)
        }
      },
      //校验所有一对一子表表单
      validateSubForm(allValues){
          return new Promise((resolve,reject)=>{
            Promise.all([
            ]).then(() => {
              resolve(allValues)
            }).catch(e => {
              if (e.error === VALIDATE_NO_PASSED) {
                // 如果有未通过表单验证的子表，就自动跳转到它所在的tab
                this.activeKey = e.index == null ? this.activeKey : this.refKeys[e.index]
              } else {
                console.error(e)
              }
            })
          })
      },
      /** 整理成formData */
      classifyIntoFormData(allValues) {
        let main = Object.assign(this.model, allValues.formValue)
        return {
          ...main, // 展开
          smartPublicityEducationPeopleList: allValues.tablesValue[0].values,
        }
      },
      validateError(msg){
        this.$message.error(msg)
      },

      //图片click
      imgClick: function () {
        document.getElementById('uploadFile').click()
      },
      //点击选中图片
      readLocalFile: function () {
        var localFile = document.getElementById('uploadFile').files[0]
        console.log(localFile.name)
        this.getBase64(localFile).then((res) => {
          console.log('----------------' + res + '-----------')
          let formData = new FormData()
          formData.append('biz', this.bizPath)
          formData.append('file', this.dataURLtoFileFun(res, localFile.name))
          uploadFile(formData).then((res) => {
            console.log(res)
            if (res.success) {
              let arr = []
              if (this.model.files) {
                arr.push(this.model.files)
              }
              arr.push(res.message)
              // 更新上传文件列表
              this.$set(this.model, 'files', arr.join())
            }
          })
        })
      },
      dataURLtoFileFun(dataurl, filename) {
        // 将base64转换为文件，dataurl为base64字符串，filename为文件名（必须带后缀名，如.jpg,.png）
        const arr = dataurl.split(',')
        const mime = arr[0].match(/:(.*?);/)[1]
        const bstr = atob(arr[1])
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return new File([u8arr], filename, { type: mime })
      },
      getBase64(file) {
        return new Promise(function (resolve, reject) {
          let reader = new FileReader()
          let imgResult = ''
          reader.readAsDataURL(file)
          reader.onload = function () {
            imgResult = reader.result
          }
          reader.onerror = function (error) {
            reject(error)
          }
          reader.onloadend = function () {
            resolve(imgResult)
          }
        })
      },
    }
  }
</script>

<style scoped>
</style>