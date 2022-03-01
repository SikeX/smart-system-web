<template>
  <j-modal
    :title='title'
    :width='width'
    :visible='visible'
    :confirmLoading='confirmLoading'
    switchFullscreen
    @ok='handleOk'
    @cancel='handleCancel'
    cancelText='关闭'>
    <a-spin :spinning='confirmLoading'>
      <a-form-model ref='form' :model='model' :rules='validatorRules'>
        <a-form-model-item label='父级节点' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='pid'>
          <j-tree-select
            ref='treeSelect'
            placeholder='请选择父级节点'
            v-model='model.pid'
            dict='smart_assessment_content,name,id'
            pidField='pid'
            pidValue='0'
            hasChildField='has_child'
            :condition='condition'
          >
          </j-tree-select>
        </a-form-model-item>
        <a-form-model-item label='名称' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='name'>
          <a-input v-model='model.name' placeholder='请输入名称'></a-input>
        </a-form-model-item>
        <a-form-model-item v-if='model.isKey === 1' label='填报说明' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='instructions'>
          <a-textarea v-model='model.instructions' rows='4' placeholder='请输入填报说明' />
        </a-form-model-item>
        <a-form-model-item v-if='model.isKey === 1' label='分值' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='point'>
          <a-input-number v-model='model.point' placeholder='请输入分值' style='width: 100%' />
        </a-form-model-item>
        <a-form-model-item v-if='model.isKey === 1' label='评分考核单位' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='assDepartUser'>
<!--          <j-select-user-by-dep v-model='model.assDepartUser' />-->
          <a-select
            placeholder="请选择"
            showSearch
            v-model="model.assDepart"
            :filterOption="filterOption"
            allowClear>
            <a-spin v-if="loading" slot="notFoundContent" size="small"/>
            <a-select-option v-for="d in departOptions" :key="d.value" :value="d.value">{{ d.text }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item v-if='model.isKey === 1' label='评分考核组' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='assTeam'>
          <j-search-select-tag v-model='model.assTeam' dict='smart_assessment_teamwheredel_flag=0,team_name,id' />
        </a-form-model-item>
        <a-form-model-item label='是否考核要点' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='isKey'>
          <j-switch v-model='model.isKey' :options='[1, 0]'></j-switch>
        </a-form-model-item>

      </a-form-model>
    </a-spin>
  </j-modal>
</template>

<script>

import { getAction, httpAction } from '@/api/manage'
import { validateDuplicateValue } from '@/utils/util'

export default {
  name: 'SmartAssessmentContentModal',
  components: {},
  props: {
    mainId: {
      type: String,
      default: '',
      required: false
    }
  },
  watch: {
    mainId: {
      immediate: true,
      handler(val) {
        let params = {
          mission_id: val,
          is_key: 0
        }
        this.condition = JSON.stringify(params)
      }
    }
  },
  data() {
    return {
      condition: '',
      title: '操作',
      width: 800,
      visible: false,
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      },

      confirmLoading: false,
      validatorRules: {
        name: [
          { required: true, message: '请输入考核名称!'},
        ],
        instructions: [
          { required: true, message: '请输入考核要点填报说明!'},
        ],
        point: [
          { required: true, message: '请输入考核要点分值!'},
        ],
        assDepartUser: [
          { required: true, message: '请选择负责该要点评分的考核单位评分人员!'},
        ],
        assTeam: [
          { required: true, message: '请选择负责该要点评分的考核组!'},
        ],
      },
      url: {
        add: '/smartAssessmentContent/smartAssessmentContent/add',
        edit: '/smartAssessmentContent/smartAssessmentContent/edit'
      },
      expandedRowKeys: [],
      pidField: 'pid',

      lastPoint: 0,

      loading: false,
      departOptions: [],

    }
  },
  created() {
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
    this.loadDepartDict()
  },
  methods: {
    loadDepartDict(){
      this.departOptions = []
      this.loading=true
      getAction('/smartAssessmentDepartment/smartAssessmentDepartment/dict').then(res=>{
        if(res.success){
          this.departOptions = res.result
        }else{
          this.$message.warning(res.message)
        }

      }).finally(res =>{
        this.loading=false
      })
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    add(obj) {
      this.modelDefault.pid = ''
      this.edit(Object.assign(this.modelDefault, obj))
    },
    edit(record) {
      this.lastPoint = record.point
      this.model = Object.assign({}, record)
      this.visible = true
    },
    close() {
      this.$emit('close')
      this.visible = false
      this.$refs.form.clearValidate()
    },
    handleOk() {
      const that = this
      // 触发表单验证
      this.$refs.form.validate(valid => {
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
          this.model['missionId'] = this.mainId
          if (this.model.id && this.model.id === this.model[this.pidField]) {
            that.$message.warning('父级节点不能选择自己')
            that.confirmLoading = false
            return
          }
          httpAction(httpurl, this.model, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              // 如果分数没有改变,则不需要更新
              let update = false
              if (that.lastPoint != that.model.point) {
                console.log(that.lastPoint)
                console.log(that.model.point)
                update = true
              }
              that.$emit('ok', update)
            } else {
              that.$message.warning(res.message)
            }
          }).finally(() => {
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
    submitSuccess(formData, flag) {
      if (!formData.id) {
        let treeData = this.$refs.treeSelect.getCurrTreeData()
        this.expandedRowKeys = []
        this.getExpandKeysByPid(formData[this.pidField], treeData, treeData)
        this.$emit('ok', formData, this.expandedRowKeys.reverse())
      } else {
        this.$emit('ok', formData, flag)
      }
    },
    getExpandKeysByPid(pid, arr, all) {
      if (pid && arr && arr.length > 0) {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].key == pid) {
            this.expandedRowKeys.push(arr[i].key)
            this.getExpandKeysByPid(arr[i]['parentId'], all, all)
          } else {
            this.getExpandKeysByPid(pid, arr[i].children, all)
          }
        }
      }
    }


  }
}
</script>