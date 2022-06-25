<template>
  <a-card :bordered='false'>
    <a-row :gutter='20'>
      <a-col :xs='24' :sm='24' :md='6' :lg='6' :xl='6'>
        <a-card title='考核内容目录'>
<!--          <a-tree-->
<!--            :treeData='dataSource'-->
<!--            :replaceFields='fields'-->
<!--            :defaultExpandAll='true'-->
<!--            :expandedKeys.sync='expandedKeys'-->
<!--            @select='showDetail'-->
<!--            @expand='handleExpand'-->
<!--            style='max-height: 500px;overflow-y: auto;'-->
<!--          >-->
<!--          </a-tree>-->
          <a-menu
            mode='inline'
            @openChange='handleChange'
            @click='handleClick'
          >
            <template v-for='item in dataSource'>
              <a-menu-item v-if="item.isKey === 1" :key="item.id + ',' + item.assContentId">
                <div v-if='item.uploadCount'>
                  <a-icon type='check-square' theme='twoTone' />
                  <span>{{ item.assContentId_dictText }}</span>
                  <el-badge :value="item.uploadCount" :max="99" type="primary"/>
                </div>
                <div v-else>
                  <a-icon type="edit" theme="twoTone" />
                  <span>{{ item.assContentId_dictText }}</span>
                  <el-badge :value="item.uploadCount" :max="99" />
                </div>

              </a-menu-item>
              <sub-menu v-else :key="item.id + ',' + item.assContentId" :menu-info='item' />
            </template>
            <!--      <a-sub-menu v-for='(record, index) in dataSource'-->
            <!--                  :key='record.assContentId'-->
            <!--                  :title='record.assContentId_dictText'-->
            <!--      >-->
            <!--        <a-sub-menu v-if='record.hasChild'-->
            <!--                    v-for='(firstChild, index1) in record.children'-->
            <!--                    :key='firstChild.assContentId'-->
            <!--                    :title='firstChild.assContentId_dictText'-->
            <!--        >-->
            <!--          <a-menu-item v-if='firstChild.hasChild'-->
            <!--                       v-for='(secondChild, index2) in firstChild.children'-->
            <!--                       :title='secondChild.assContentId_dictText'-->
            <!--          >-->
            <!--          </a-menu-item>-->
            <!--        </a-sub-menu>-->
            <!--      </a-sub-menu>-->
          </a-menu>
        </a-card>
      </a-col>
      <a-col :xs='24' :sm='24' :md='18' :lg='18' :xl='18'>
        <a-row>
          <smart-assessment-content-form ref='modalForm1' :mainId='selectedContentKeys' />
        </a-row>
        <a-row style='margin-top: 20px'>
          <SmartAnswerFileList :mainId='selectedAnswerAssContentKeys' :disabled='disableSubmit' @ok='loadData()'/>
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
import SmartAnswerFileList from '@views/smartAnswerAssContent/SmartAnswerFileList'
import SubMenu from '@views/smartAnswerInfo/modules/SubMenu'


export default {
  name: 'SmartAnswerPage',
  mixins: [JeecgListMixin],
  components: {
    SmartAnswerFileList,
    SmartAssessmentContentForm,
    'sub-menu': SubMenu
  },
  props: {
    mainId: {
      type: String,
      default: '',
      required: false
    },
    mainInfo: {
      type: Object,
      default: Object,
      required: false
    }
  },
  watch: {
    // 答题信息表ID
    mainId: {
      immediate: true,
      handler(val) {
        this.clearList()
        this.queryParam['mainId'] = val
        this.loadData(1)
      }
    }
  },
  data() {
    return {
      description: '考核节点表管理页面',
      disableMixinCreated: true,
      fields: { children: 'children', title: 'assContentId_dictText', key: 'assContentId' },
      expandedKeys: [],
      selectedKeys: [],
      selectedContentKeys: '',
      selectedAnswerAssContentKeys: '',
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
        list: '/smartAnswerAssContent/smartAnswerAssContent/list',
        rootList: '/smartAnswerAssContent/smartAnswerAssContent/rootList',
        childList: '/smartAnswerAssContent/smartAnswerAssContent/childList',
        getChildListBatch: '/smartAnswerAssContent/smartAnswerAssContent/getChildListBatch',
        getChildListBatchWithMainId: '/smartAnswerAssContent/smartAnswerAssContent/getChildListBatchWithMainId',
        delete: '/smartAnswerAssContent/smartAnswerAssContent/delete',
        deleteBatch: '/smartAnswerAssContent/smartAnswerAssContent/deleteBatch',
        exportXlsUrl: '/smartAnswerAssContent/smartAnswerAssContent/exportXls',
        importExcelUrl: 'smartAnswerAssContent/smartAnswerAssContent/importExcel'
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
    },
    disableSubmit() {
      let dateDiff = new Date(this.mainInfo.endTime).getTime() - new Date().getTime()
      return this.mainInfo['missionStatus'] == '发布评分结果' || dateDiff <= 0;
    }
  },
  methods: {
    clearList() {
      this.selectedContentKeys = ''
      this.selectedAnswerAssContentKeys = ''
      this.dataSource = []
      this.selectedRowKeys = []
      this.expandedKeys = []
      this.ipagination.current = 1
    },
    showDetail(selectedKeys, e) {
      let nodeData = e.node.dataRef
      let selected = e.selected
      if (selected && nodeData.hasChild === '0') {
        this.selectedContentKeys = e.node.dataRef.assContentId
        this.selectedAnswerAssContentKeys = e.node.dataRef.id
      }
    },
    loadData(arg) {
      if (arg == 1) {
        this.ipagination.current = 1
      }
      this.expandedRowKeys = this.expandedKeys
      this.loading = true
      let params = this.getQueryParams()
      params.hasQuery = 'false'
      getAction(this.url.rootList, params).then(res => {
        if (res.success) {
          let result = res.result
          if (Number(result.total) > 0) {
            this.dataSource = this.getDataByResult(res.result.records)
            // this.expandTree(res.result.records)
            return this.loadDataByExpandedRows(this.dataSource)
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
    expandTree(records) {
      for (let i = 0; i < records.length; i++) {
        let record = records[i]
        if (record.hasChild) {
          this.expandedKeys.push(record.id)
          let params = this.getQueryParams()
          params.pid = record.id
          params.hasQuery = 'false'
          getAction(this.url.childList, params).then((res) => {
            if (res.success) {
              if (res.result.records) {
                record.children = this.getDataByResult(res.result.records)
                this.dataSource = [...this.dataSource]
                this.expandTree(res.result.records)
              } else {
                record.children = ''
                record.hasChildrenField = '0'
              }
            } else {
              this.$message.warning(res.message)
            }
          })
        }
      }
    },
    // 根据已展开的行查询数据（用于保存后刷新时异步加载子级的数据）
    loadDataByExpandedRows(dataList) {
      if (this.expandedRowKeys.length > 0) {
        let params = {
          parentIds: this.expandedRowKeys.join(','),
          mainId: this.mainId
        }
        return getAction(this.url.getChildListBatchWithMainId, params).then(res => {
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
                  if (this.expandedRowKeys.includes(data.assContentId)) {
                    data.children = this.getDataByResult(childrenMap.get(data.assContentId))
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
    searchReset() {
      //重置
      this.expandedRowKeys = []
      this.queryParam = {}
      this.loadData(1)
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
    handleClick(info) {
      let [id, assContentId] = info.key.split(',')
      this.selectedContentKeys = assContentId
      this.selectedAnswerAssContentKeys = id
    },
    handleChange(openKeys) {
      this.expandedRowKeys = []
      openKeys.forEach(data => {
        const [id, assContentId] = data.split(',')
        if (this.expandedKeys.indexOf(assContentId) === -1) {
          this.expandedKeys.push(assContentId)
          this.expandedRowKeys.push(assContentId)
        }
      })
      this.loadDataByExpandedRows(this.dataSource)
    },
    handleExpand(expandedKeys, info) {
      let expanded = info.expanded
      let record = info.node.dataRef
      // 判断是否是展开状态
      if (expanded) {
        this.expandedRowKeys.push(record.assContentId)
        if (record.children.length > 0 && record.children[0].isLoading === true) {
          let params = this.getQueryParams(1)//查询条件
          params[this.pidField] = record.assContentId
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
        let keyIndex = this.expandedRowKeys.indexOf(record.assContentId)
        if (keyIndex >= 0) {
          this.expandedRowKeys.splice(keyIndex, 1)
        }
      }
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'pid', text: '父级节点', dictCode: '' })
      fieldList.push({ type: 'string', value: 'hasChild', text: '是否有子节点', dictCode: '' })
      fieldList.push({ type: 'string', value: 'assContentId', text: '考核内容节点', dictCode: '' })
      fieldList.push({ type: 'int', value: 'contentStatus', text: '要点状态', dictCode: '' })
      fieldList.push({ type: 'int', value: 'uploadCount', text: '要点上传附件数目', dictCode: '' })
      fieldList.push({ type: 'double', value: 'lowestScore', text: '最低得分', dictCode: '' })
      fieldList.push({ type: 'double', value: 'highestScore', text: '最高得分', dictCode: '' })
      fieldList.push({ type: 'double', value: 'averageScore', text: '平均得分', dictCode: '' })
      fieldList.push({ type: 'double', value: 'finalScore', text: '最终得分', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>