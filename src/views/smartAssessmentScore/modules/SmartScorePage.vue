<template>
  <a-card :bordered='false'>
    <a-row :gutter='20'>
      <a-col :xs='24' :sm='24' :md='6' :lg='6' :xl='6'>
        <a-card title='考核内容目录'>
          <a-menu
            mode='inline'
            @openChange='handleChange'
            @click='handleClick'
          >
            <template v-for='item in dataSource'>
              <a-menu-item v-if="item.isKey == 1" :key="item.id + ',' + item.missionId">
                <span>{{ item.name }}</span>
              </a-menu-item>
              <sub-menu v-else :key="item.id + ',' + item.missionId" :menu-info='item' />
            </template>
          </a-menu>
        </a-card>
      </a-col>
      <a-col :xs='24' :sm='24' :md='18' :lg='18' :xl='18'>
        <a-row>
          <smart-assessment-content-form ref='modalForm1' @ok='modalFormOk' :mainId='selectedContentKeys' />
        </a-row>
        <a-row style='margin-top: 20px'>
          <SmartScoreDepartList :mission-id='mainId' :max-score="maxScore" :content-id='selectedContentKeys'></SmartScoreDepartList>
        </a-row>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>

import { getAction, deleteAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'
import { filterObj } from '@/utils/util'
import SmartAssessmentContentForm from '@views/smartAnswerInfo/modules/SmartAssessmentContentForm'
import SubMenu from '@views/smartAssessmentScore/modules/SubMenu'
import SmartScoreDepartList from '@views/smartAssessmentScore/modules/SmartScoreDepartList'
import Vue from "vue";



export default {
  name: 'SmartScorePage',
  mixins: [JeecgListMixin],
  components: {
    SmartScoreDepartList,
    SmartAssessmentContentForm,
    'sub-menu': SubMenu
  },
  props: {
    mainId: {
      type: String,
      default: '',
      required: false
    },
    // 负责评分的考核单位ID
    assDepartId: {
      type: String,
      default: '',
      required: false
    },
    // 考核组ID
    assTeamId: {
      type: String,
      default: '',
      required: false
    },
  },
  watch: {
    // 选择的 missionId
    mainId: {
      immediate: true,
      handler(val) {
        this.clearList()
        this.queryParam['missionId'] = val
        this.loadData(1)
      }
    }
  },
  data() {
    return {
      description: '考核节点表管理页面',
      disableMixinCreated: true,
      fields: { children: 'children', title: 'name', key: 'id' },
      expandedKeys: [],
      selectedKeys: [],
      selectedContentKeys: '',
      selectedAnswerAssContentKeys: '',
      // 当前考核要点的最大分值
      maxScore: 0,
      // 表头
      columns: [
        {
          title: '名称',
          align: 'left',
          dataIndex: 'name'
        },
        {
          title: '分值',
          align: 'left',
          dataIndex: 'point'
        },
        {
          title: '排序',
          align: 'left',
          sorter: true,
          dataIndex: 'sortNo'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: '/smartAssessmentContent/smartAssessmentContent/rootList',
        childList: '/smartAssessmentContent/smartAssessmentContent/childList',
        getChildListBatch: '/smartAssessmentContent/smartAssessmentContent/getChildListBatch',
        delete: '/smartAssessmentContent/smartAssessmentContent/delete',
        deleteBatch: '/smartAssessmentContent/smartAssessmentContent/deleteBatch',
        exportXlsUrl: '/smartAssessmentContent/smartAssessmentContent/exportXls',
        importExcelUrl: 'smartAssessmentContent/smartAssessmentContent/importExcel'
      },
      expandedRowKeys: [],
      hasChildrenField: 'hasChild',
      pidField: 'pid',
      dictOptions: {},
      loadParent: false,
      superFieldList: []
    }
  },
  created() {
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
    tableProps() {
      let _this = this
      return {
        // 列表项是否可选择
        rowSelection: {
          selectedRowKeys: _this.selectedRowKeys,
          onChange: (selectedRowKeys) => _this.selectedRowKeys = selectedRowKeys
        }
      }
    }
  },
  methods: {
    clearList() {
      this.selectedContentKeys = ''
      this.selectedAnswerAssContentKeys = ''
      this.dataSource = []
      this.selectedRowKeys = []
      this.expandedKeys = []
      this.expandedRowKeys = []
      this.ipagination.current = 1
    },
    showDetail(selectedKeys, e) {
      let nodeData = e.node.dataRef
      let selected = e.selected
      if (selected && nodeData.hasChild === '0') {
        this.selectedContentKeys = e.node.dataRef.id
        this.selectedAnswerAssContentKeys = e.node.dataRef.id
      }
    },
    handleClick(info) {
      let [id, assContentId] = info.key.split(',')
      this.selectedContentKeys = id
      this.selectedAnswerAssContentKeys = id
    },
    handleChange(openKeys) {
      this.expandedRowKeys = []
      openKeys.forEach(data => {
        const [id, missionId] = data.split(',')
        if (this.expandedKeys.indexOf(id) === -1) {
          this.expandedKeys.push(id)
          this.expandedRowKeys.push(id)
        }
      })
      this.loadDataByExpandedRows(this.dataSource)
    },

    loadData(arg) {
      if (arg == 1) {
        this.ipagination.current = 1
      }
      this.loading = true
      let params = this.getQueryParams()
      params.hasQuery = 'true'
      getAction(this.url.list, params).then(res => {
        if (res.success) {
          let result = res.result
          if (Number(result.total) > 0) {
            this.ipagination.total = Number(result.total)
            this.dataSource = this.getDataByResult(res.result.records)
            return this.loadDataByExpandedRows(this.dataSource)
          } else {
            this.ipagination.total = 0
            this.dataSource = []
          }
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    // 根据已展开的行查询数据（用于保存后刷新时异步加载子级的数据）
    loadDataByExpandedRows(dataList) {
      if (this.expandedRowKeys.length > 0) {
        return getAction(this.url.getChildListBatch, { parentIds: this.expandedRowKeys.join(',') }).then(res => {
          if (res.success && res.result.records.length > 0) {
            //已展开的数据批量子节点
            let records = res.result.records
            const listMap = new Map()
            for (let item of records) {
              let pid = item[this.pidField]
              if (this.expandedRowKeys.join(',').includes(pid)) {
                let mapList = listMap.get(pid)
                if (mapList == null) {
                  mapList = []
                }
                mapList.push(item)
                listMap.set(pid, mapList)
              }
            }
            let childrenMap = listMap
            let fn = (list) => {
              if (list) {
                list.forEach(data => {
                  if (this.expandedRowKeys.includes(data.id)) {
                    data.children = this.getDataByResult(childrenMap.get(data.id))
                  }
                  fn(data.children)
                })
              }
            }
            fn(dataList)
          }
        })
      } else {
        return Promise.resolve()
      }
    },
    getQueryParams(arg) {
      //获取查询条件
      let sqp = {}
      let param = {}
      if (this.superQueryParams) {
        sqp['superQueryParams'] = encodeURI(this.superQueryParams)
        sqp['superQueryMatchType'] = this.superQueryMatchType
      }
      if (arg) {
        param = Object.assign(sqp, this.isorter, this.filters)
      } else {
        param = Object.assign(sqp, this.queryParam, this.isorter, this.filters)
      }
      if (JSON.stringify(this.queryParam) === '{}' || arg) {
        param.hasQuery = 'false'
      } else {
        param.hasQuery = 'true'
      }
      param.field = this.getQueryField()
      param.pageNo = this.ipagination.current
      param.pageSize = this.ipagination.pageSize
      return filterObj(param)
    },
    getDataByResult(result) {
      if (result) {
        return result.map(item => {
          //判断是否标记了带有子节点
          if (item[this.hasChildrenField] == '1') {
            let loadChild = { id: item.id + '_loadChild', name: 'loading...', isLoading: true }
            item.children = [loadChild]
          }
          return item
        })
      }
    },
    handleExpand(expanded, record) {
      // 判断是否是展开状态
      if (expanded) {
        this.expandedRowKeys.push(record.id)
        if (record.children.length > 0 && record.children[0].isLoading === true) {
          let params = this.getQueryParams(1)//查询条件
          params[this.pidField] = record.id
          params.hasQuery = 'false'
          params.superQueryParams = ''
          getAction(this.url.childList, params).then((res) => {
            if (res.success) {
              if (res.result.records) {
                record.children = this.getDataByResult(res.result.records)
                this.dataSource = [...this.dataSource]
              } else {
                record.children = ''
                record.hasChildrenField = '0'
              }
            } else {
              this.$message.warning(res.message)
            }
          })
        }
      } else {
        let keyIndex = this.expandedRowKeys.indexOf(record.id)
        if (keyIndex >= 0) {
          this.expandedRowKeys.splice(keyIndex, 1)
        }
      }
    },
    modalFormOk(record) {
      // 加载完成题目信息
      this.maxScore = record.point
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
<style scoped>
@import '~@assets/less/common.less';
</style>