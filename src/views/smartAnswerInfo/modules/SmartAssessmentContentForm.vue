<template>
  <a-card v-if='mainId' title='题目信息' :bordered='true'>
    <a-spin :spinning='loading'>
      <a-form-model ref='form' :model='model'>
        <a-descriptions layout='horizontal'>
          <a-descriptions-item label='名称' :span='3'>
            {{ model.name }}
          </a-descriptions-item>
          <a-descriptions-item label='填报说明' :span='3'>
            {{ model.instructions }}
          </a-descriptions-item>
          <a-descriptions-item label='分值' :span='3'>
            {{ model.point }}
          </a-descriptions-item>
        </a-descriptions>
      </a-form-model>
    </a-spin>
  </a-card>
</template>

<script>

import { getAction, deleteAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { filterObj } from '@/utils/util'

export default {
  name: 'SmartAssessmentContentForm',
  mixins: [JeecgListMixin],
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
        if (!this.mainId) {
          this.clearList()
        } else {
          this.loadData(1)
        }
      }
    }
  },
  data() {
    return {
      description: '考核要点具体信息页面',
      disableMixinCreated: true,
      model: {},
      url: {
        list: '/smartAssessmentContent/smartAssessmentContent/list'
      },
      superFieldList: []
    }
  },
  created() {
    this.getSuperFieldList()
  },
  methods: {
    clearList() {
      this.model = {}
    },
    loadData(arg) {
      if (arg == 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      getAction(this.url.list, { id: this.mainId }).then(res => {
        if (res.success) {
          let result = res.result
          if (Number(result.total) > 0) {
            this.dataSource = res.result.records
            this.model = this.dataSource[0]
            this.$emit('ok', this.model)
          } else {
            this.dataSource = []
          }
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'pid', text: '父级节点', dictCode: '' })
      fieldList.push({ type: 'string', value: 'name', text: '名称', dictCode: '' })
      fieldList.push({ type: 'int', value: 'point', text: '分值', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'instructions', text: '填报说明', dictCode: '' })
      fieldList.push({ type: 'sel_user', value: 'assDepartUser', text: '考核单位评分人员' })
      fieldList.push({
        type: 'sel_search',
        value: 'assTeam',
        text: '考核组',
        dictTable: 'smart_assessment_team',
        dictText: 'team_name',
        dictCode: 'id'
      })
      fieldList.push({ type: 'double', value: 'sortNo', text: '排序', dictCode: '' })
      fieldList.push({ type: 'switch', value: 'isKey', text: '是否考核要点' })
      this.superFieldList = fieldList
    }
  }
}
</script>