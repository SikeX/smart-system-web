<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <!-- 主表单区域 -->
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24" >
            <a-form-model-item label="名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="meetingName">
              <a-input v-model="model.meetingName" placeholder="请输入名称" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="地点" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="meetingPlace">
              <a-input v-model="model.meetingPlace" placeholder="请输入地点" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="meetingStarttime">
              <j-date placeholder="请选择时间" v-model="model.meetingStarttime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="类型" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="meetingType">
              <j-dict-select-tag type="list" v-model="model.meetingType" dictCode="meeting_type" placeholder="请选择类型" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="参会人数" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="meetingNumber">
              <a-input-number v-model="model.meetingNumber" placeholder="请输入参会人数" style="width: 100%" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="主持人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="meetingHoster">
              <select-user-by-dep v-model="model.meetingHoster" @info="getMeetingHoster "/>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="主持人姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="meetingHosterName" v-show="false">
              <a-input v-model="model.meetingHosterName" />
            </a-form-model-item>
          </a-col>

          <a-col :span="24" >
            <a-form-model-item label="记录人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="meetingRecorer">
              <select-user-by-dep v-model="model.meetingRecorer" @info="getMeetingRecorer "/>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="记录人姓名" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="meetingRecorerName" v-show="false">
              <a-input v-model="model.meetingRecorerName"/>
            </a-form-model-item>
          </a-col>

          <a-col :span="24">
            <a-form-model-item label="会议内容摘要" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="meetingAbstract">
              <a-textarea v-model="model.meetingAbstract" rows="4" placeholder="请输入会议内容摘要" />
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="备注" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="meetingRemarks">
              <a-textarea v-model="model.meetingRemarks" rows="4" placeholder="请输入备注" />
            </a-form-model-item>
          </a-col>
<!--          <a-col :span="24" >
            <a-form-model-item label="创建人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="createBy">
              <a-input v-model="model.createBy" placeholder="请输入创建人" ></a-input>
            </a-form-model-item>
          </a-col>
          <a-col :span="24" >
            <a-form-model-item label="创建时间" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="createTime">
              <j-date placeholder="请选择创建时间" v-model="model.createTime" :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </a-form-model-item>
          </a-col>-->
          <a-col :span="24" >
            <a-form-model-item label="附件" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="files">
              <j-upload v-model="model.files"></j-upload>
              <a-button v-if='!disabled' icon="camera" @click="eloamScan">高拍仪拍照</a-button>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
      <eloam-modal ref="modalForm" @ok='scanOk' biz-path='eloam'></eloam-modal>
    </j-form-container>
  <!--子表单区域-->
   <a-tabs v-model="activeKey" @change="handleChangeTabs">
      <a-tab-pane tab="三重一大参会人员表" :key="refKeys[0]" :forceRender="true">
        <j-editable-table
          :ref="refKeys[0]"
          :loading="smartTripleImportanceOneGreatnessPaccaTable.loading"
          :columns="smartTripleImportanceOneGreatnessPaccaTable.columns"
          :dataSource="smartTripleImportanceOneGreatnessPaccaTable.dataSource"
          :maxHeight="300"
          :disabled="formDisabled"
          :rowNumber="true"
          :rowSelection="true"
          :actionButton="true"/>
      </a-tab-pane>
<!--      <a-tab-pane tab="三重一大附件表" :key="refKeys[1]" :forceRender="true">
        <j-editable-table
          :ref="refKeys[1]"
          :loading="smartTripleImportanceOneGreatnessDescriptionTable.loading"
          :columns="smartTripleImportanceOneGreatnessDescriptionTable.columns"
          :dataSource="smartTripleImportanceOneGreatnessDescriptionTable.dataSource"
          :maxHeight="300"
          :disabled="formDisabled"
          :rowNumber="true"
          :rowSelection="true"
          :actionButton="true"
          :rootUrl="rootUrl"/>
      </a-tab-pane>-->
    </a-tabs>

  </a-spin>
</template>

<script>

  import { getAction } from '@/api/manage'
  import { FormTypes,getRefPromise,VALIDATE_NO_PASSED } from '@/utils/JEditableTableUtil'
  import { JEditableTableModelMixin } from '@/mixins/JEditableTableModelMixin'
  import { validateDuplicateValue } from '@/utils/util'
  import SelectUserByDep from '@/components/jeecgbiz/modal/SelectUserByDep'
  import EloamModal from '@views/eloam/modules/EloamModal'

  export default {
    name: 'SmartTripleImportanceOneGreatnessForm',
    mixins: [JEditableTableModelMixin],
    components: {SelectUserByDep,EloamModal
    },
    data() {
      return {
        rootUrl:"/smartTripleImportanceOneGreatness/smartTripleImportanceOneGreatness",
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
          meetingPeople:'',
          meetingPeopleName:'',
          meetingHoster:'',
          meetingHosterName:'',
          meetingRecorer:'',
          meetingRecorerName:''

        },
        confirmLoading: false,
        // 新增时子表默认添加几行空数据
        addDefaultRowNum: 1,
        validatorRules: {
           meetingStarttime: [
              { required: true, message: '请输入时间!'},
           ],
           meetingType: [
              { required: true, message: '请输入类型!'},
           ],
           meetingNumber: [
              { required: true, message: '请输入参会人数!'},
           ],
           createTime: [
              { required: true, message: '请输入创建时间!'},
           ],
        },
        refKeys: ['smartTripleImportanceOneGreatnessPacca'],
        tableKeys:['smartTripleImportanceOneGreatnessPacca'],
        activeKey: 'smartTripleImportanceOneGreatnessPacca',
        // 三重一大参会人员表
        smartTripleImportanceOneGreatnessPaccaTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '参会人员',
              key: 'meetingPeopleName',
              type: FormTypes.sel_user,
              store:'realname',
              text:'realname',
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
          ]
        },
        /*// 三重一大附件表
        smartTripleImportanceOneGreatnessDescriptionTable: {
          loading: false,
          dataSource: [],
          columns: [
            {
              title: '附件说明',
              key: 'attachmentDescription',
              type: FormTypes.input,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
            {
              title: '附件说明路径',
              key: 'descriptionPath',
              type: FormTypes.file,
              token:true,
              responseName:"message",
              width:"200px",
              placeholder: '请选择文件',
              defaultValue:'',
            },
            {
              title: '上传时间',
              key: 'uploadTime',
              type: FormTypes.datetime,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
              validateRules: [{ required: true, message: '${title}不能为空' }],
            },
            {
              title: '下载次数',
              key: 'downloadTimes',
              type: FormTypes.inputNumber,
              disabled:true,
              width:"200px",
              placeholder: '请输入${title}',
              defaultValue:'',
            },
          ]
        },*/
        url: {
          add: "/smartTripleImportanceOneGreatness/smartTripleImportanceOneGreatness/add",
          edit: "/smartTripleImportanceOneGreatness/smartTripleImportanceOneGreatness/edit",
          queryById: "/smartTripleImportanceOneGreatness/smartTripleImportanceOneGreatness/queryById",
          smartTripleImportanceOneGreatnessPacca: {
            list: '/smartTripleImportanceOneGreatness/smartTripleImportanceOneGreatness/querySmartTripleImportanceOneGreatnessPaccaByMainId'
          },
          /*smartTripleImportanceOneGreatnessDescription: {
            list: '/smartTripleImportanceOneGreatness/smartTripleImportanceOneGreatness/querySmartTripleImportanceOneGreatnessDescriptionByMainId'
          },*/
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
      //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model))
    },
    methods: {
      addBefore(){
        this.smartTripleImportanceOneGreatnessPaccaTable.dataSource=[]

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
          console.log(this.model)
          let params = { id: this.model.id }
          getAction(this.url.queryById,params).then(res=>{
              if(res.success){
                this.model=res.result
              }
            }

          )
          this.requestSubTableData(this.url.smartTripleImportanceOneGreatnessPacca.list, params, this.smartTripleImportanceOneGreatnessPaccaTable)

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
          smartTripleImportanceOneGreatnessPaccaList: allValues.tablesValue[0].values,

        }
      },
      validateError(msg){
        this.$message.error(msg)
      },
      /*getMeetingPeople(back){
        let that=this
        console.log(back)
        that.model.meetingPeople=back[0].id
        that.model.meetingPeopleName=back[0].realname
      },*/
      getMeetingHoster(back){
        let that=this
        console.log(back)
        that.model.meetingHoster=back[0].id
        that.model.meetingHosterName=back[0].realname
      },
      getMeetingRecorer(back){
        let that=this
        console.log(back)
        that.model.meetingRecorer=back[0].id
        that.model.meetingRecorerName=back[0].realname
      },
      eloamScan() {
        this.$refs.modalForm.open()
      },
      scanOk(url) {
        let image = url
        if (image) {
          let arr = []
          // 考虑如果存在已经上传的文件，则拼接起来，没有则直接添加
          if (this.model.files) {
            arr.push(this.model.files)
          }
          arr.push(image)
          // 更新表单中文件url字段, files 为字段名称
          this.$set(this.model, 'files', arr.join())
        }
      },

    }
  }
</script>

<style scoped>
</style>