<template>
  <a-card :bordered='false'>
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row :gutter='24'>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div v-if='mainId' class='table-operator'>
      <a-button  v-if='mainInfo.missionStatus === isShowText' @click='handleAddLevel1' type='primary' icon='plus'>新增考核内容</a-button>
      <a-button  v-if='mainInfo.missionStatus === isShowText' @click='handleAddLevel2' type='primary' icon='plus'>新增考核指标</a-button>
      <a-button  v-if='mainInfo.missionStatus === isShowText' @click='handleAddLevel3' type='primary' icon='plus'>新增考核要点</a-button>
      <a-popconfirm title='确定校正吗?' @confirm='checkPoint' placement='topLeft'>
        <a-button type='primary' icon='tool'>校正分数</a-button>
      </a-popconfirm>
      <a-button type='primary' icon='download' @click="handleExportXls('考核节点表')">导出</a-button>
      <a-upload v-if='mainInfo.missionStatus === isShowText' name='file' :showUploadList='false' :multiple='false' :headers='tokenHeader' :action='importExcelUrl'
                @change='handleImportExcel'>
        <a-button type='primary' icon='import'>导入</a-button>
      </a-upload>
      <!-- 高级查询区域 -->
      <j-super-query :fieldList='superFieldList' ref='superQueryModal'
                     @handleSuperQuery='handleSuperQuery'></j-super-query>
    </div>

    <!-- table区域-begin -->
    <div>
      <a-table
        ref='table'
        size='middle'
        rowKey='id'
        class='j-table-force-nowrap'
        :scroll='{x:true}'
        :columns='columns'
        :dataSource='dataSource'
        :pagination='ipagination'
        :loading='loading'
        :expandedRowKeys='expandedRowKeys'
        @change='handleTableChange'
        @expand='handleExpand'>

        <template slot='nameSlot' slot-scope='text, record'>
          <span v-if='record.isKey === 0 || record == null'>{{ text }}</span>
          <a-badge v-else>
            <a-tooltip>
              <template slot='title'>
                此为考核要点
              </template>
              <span> {{ text }} <a-icon slot='count' type='star' theme='twoTone'/></span>
            </a-tooltip>
          </a-badge>
        </template>

        <template slot='imgSlot' slot-scope='text'>
          <span v-if='!text' style='font-size: 12px;font-style: italic;'>无图片</span>
          <img v-else :src='getImgView(text)' height='25px' alt=''
               style='max-width:80px;font-size: 12px;font-style: italic;'/>
        </template>
        <template slot='fileSlot' slot-scope='text'>
          <span v-if='!text' style='font-size: 12px;font-style: italic;'>无文件</span>
          <a-button
            v-else
            :ghost='true'
            type='primary'
            icon='download'
            size='small'
            @click='downloadFile(text)'>
            下载
          </a-button>
        </template>

        <span v-if='mainId && mainInfo.missionStatus === isShowText' slot='action' slot-scope='text, record'>
          <a @click='handleEdit(record)'>编辑</a>
          <a-divider type='vertical'/>
          <a @click='handleDetail(record)'>详情</a>
          <a-divider type='vertical'/>
          <a-dropdown>
            <a class='ant-dropdown-link'>更多 <a-icon type='down'/></a>
            <a-menu slot='overlay'>
              <a-menu-item v-if='record.isKey === 0'>
                <a @click='handleAddChild(record)'>添加下级</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title='确定删除吗?' @confirm='() => handleDeleteNode(record.id)' placement='topLeft'>
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
        <span v-else slot='action' slot-scope='text, record'>
          <a @click='handleDetail(record)'>详情</a>
        </span>

      </a-table>
    </div>

    <smartAssessmentContent-modal ref='modalForm' @ok='modalFormOk' :mainId='mainId'></smartAssessmentContent-modal>
  </a-card>
</template>

<script>

import {getAction, deleteAction, putAction} from '@/api/manage'
import {JeecgListMixin} from '@/mixins/JeecgListMixin'
import SmartAssessmentContentModal from './modules/SmartAssessmentContentModal'
import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
import {filterObj} from '@/utils/util'

export default {
  name: 'SmartAssessmentContentList',
  mixins: [JeecgListMixin],
  components: {
    SmartAssessmentContentModal
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
    mainId: {
      immediate: true,
      handler(val) {
        if (!this.mainId) {
          this.clearList()
        } else {
          this.queryParam['missionId'] = val
          this.loadData(1)
        }
      }
    },
  },
  data() {
    return {
      description: '考核节点表管理页面',
      disableMixinCreated: true,
      isShowText: '未发布',
      // 表头
      columns: [
        {
          title: '名称',
          align: 'left',
          dataIndex: 'name',
          scopedSlots: {customRender: 'nameSlot'}
        },
        {
          title: '分值',
          align: 'left',
          dataIndex: 'point'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          fixed: "right",
          width: 147,
          scopedSlots: {customRender: 'action'},
        }
      ],
      url: {
        list: '/smartAssessmentContent/smartAssessmentContent/rootList',
        childList: '/smartAssessmentContent/smartAssessmentContent/childList',
        checkPoint: '/smartAssessmentContent/smartAssessmentContent/checkPoint',
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
      this.dataSource = []
      this.selectedRowKeys = []
      this.ipagination.current = 1
    },
    handleAddLevel1: function () {
      this.$refs.modalForm.title = "新增考核内容";
      this.$refs.modalForm.curLevel = 1;
      let obj = {}
      obj['isKey'] = 0
      this.$refs.modalForm.add(obj)
      this.$refs.modalForm.disableSubmit = false;
    },
    handleAddLevel2: function () {
      this.$refs.modalForm.title = "新增考核指标";
      this.$refs.modalForm.curLevel = 2;
      let obj = {}
      obj['isKey'] = 0
      this.$refs.modalForm.add(obj)
      this.$refs.modalForm.disableSubmit = false;
    },
    handleAddLevel3: function () {
      this.$refs.modalForm.title = "新增考核要点";
      this.$refs.modalForm.curLevel = 3;
      let obj = {}
      obj['isKey'] = 1
      this.$refs.modalForm.add(obj)
      this.$refs.modalForm.disableSubmit = false;
    },
    handleEdit: function (record) {
      if (record['isKey'] == 1) {
        this.$refs.modalForm.curLevel = 3;
      } else if (record['pid'] == 0) {
        this.$refs.modalForm.curLevel = 1
      } else {
        this.$refs.modalForm.curLevel = 2
      }
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = "编辑";
      this.$refs.modalForm.disableSubmit = false;
    },
    handleDetail:function(record){
      // console.log(record)
      if (record['isKey'] == 1) {
        this.$refs.modalForm.curLevel = 3;
      } else if (record['pid'] == 0) {
        this.$refs.modalForm.curLevel = 1
      } else {
        this.$refs.modalForm.curLevel = 2
      }
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title="详情";
      this.$refs.modalForm.disableSubmit = true;
    },
    checkPoint() {
      this.loading = true
      getAction(this.url.checkPoint, {missionId: this.mainId}).then(res => {
        if (res.success) {
          this.$message.success(res.message)
          this.loadData(1)
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.loading = false
      })
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
        return getAction(this.url.getChildListBatch, {parentIds: this.expandedRowKeys.join(',')}).then(res => {
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
                    fn(data.children)
                  }
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
            let loadChild = {id: item.id + '_loadChild', name: 'loading...', isLoading: true}
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
    handleAddChild(record) {
      this.loadParent = true
      let obj = {}
      obj[this.pidField] = record['id']
      if (record['pid'] == 0) {
        obj['isKey'] = 0
        this.$refs.modalForm.curLevel = 2
      } else {
        this.$refs.modalForm.curLevel = 3
        obj['isKey'] = 1
      }
      this.$refs.modalForm.add(obj)
    },
    handleDeleteNode(id) {
      if (!this.url.delete) {
        this.$message.error('请设置url.delete属性!')
        return
      }
      var that = this
      let params = {
        id: id,
        mainId: that.mainId,
      }
      deleteAction(that.url.delete, params).then((res) => {
        if (res.success) {
          that.loadData(1)
          that.$emit("ok");
          that.onClearSelected()
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    batchDel() {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning('请选择一条记录！')
        return false
      } else {
        let ids = ''
        let that = this
        that.selectedRowKeys.forEach(function (val) {
          ids += val + ','
        })
        that.$confirm({
          title: '确认删除',
          content: '是否删除选中数据?',
          onOk: function () {
            that.handleDeleteNode(ids)
            that.onClearSelected()
          }
        })
      }
    },
    modalFormOk(update) {
      // 新增/修改 成功时，重载列表
      console.log(update)
      this.loadData();
      if (update) {
        this.$emit("ok");
      }
      //清空列表选中
      this.onClearSelected()
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({type: 'string', value: 'pid', text: '父级节点', dictCode: ''})
      fieldList.push({type: 'string', value: 'name', text: '名称', dictCode: ''})
      fieldList.push({type: 'int', value: 'point', text: '分值', dictCode: ''})
      fieldList.push({type: 'Text', value: 'instructions', text: '填报说明', dictCode: ''})
      fieldList.push({type: 'sel_user', value: 'assDepartUser', text: '考核单位评分人员'})
      fieldList.push({
        type: 'sel_search',
        value: 'assTeam',
        text: '考核组',
        dictTable: 'smart_assessment_team',
        dictText: 'team_name',
        dictCode: 'id'
      })
      fieldList.push({type: 'switch', value: 'isKey', text: '是否考核要点', dictCode: 'yn'})
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>