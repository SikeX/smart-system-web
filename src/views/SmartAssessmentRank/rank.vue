<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24"> </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <!-- <a-button @click='handleAdd' type='primary' icon='plus'>新增</a-button> -->
      <a-button type="primary" icon="download" @click="handleExportXls('考核表')">导出</a-button>
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
      >
        <!-- <a-button type='primary' icon='import'>导入</a-button> -->
      </a-upload>
      <!-- 高级查询区域 -->
      <j-super-query
        :fieldList="superFieldList"
        ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"
      ></j-super-query>
    </div>

    <!-- table区域-begin -->
    <div>
      <!-- <div class='ant-alert ant-alert-info' style='margin-bottom: 16px;'>
        <i class='anticon anticon-info-circle ant-alert-icon'></i> 已选择 <a
        style='font-weight: 600'>{{ selectedRowKeys.length }}</a>项
        <a style='margin-left: 24px' @click='onClearSelected'>清空</a>
      </div> -->

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        class="j-table-force-nowrap"
        :scroll="{ x: true }"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :customRow="clickThenSelect"
        @change="handleTableChange"
      >
        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无图片</span>
          <img
            v-else
            :src="getImgView(text)"
            height="25px"
            alt=""
            style="max-width: 80px; font-size: 12px; font-style: italic"
          />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="checkScore(record)">得分排名</a>
          <a-divider type="vertical" />
          <a @click="changeColumnVisible(record)">修改可见字段</a>
        </span>
      </a-table>
    </div>
    <rank-modal ref="rankModal" @ok="modalFormOk"></rank-modal>
    <column-visible-modal ref="visibleModal" @ok="modalFormOk"></column-visible-modal>
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { deleteAction, getAction, postAction, putAction } from '@/api/manage'
import RankModal from './modules/RankModal'
import ColumnVisibleModal from './modules/ColumnVisibleModal'
import '@/assets/less/TableExpand.less'

export default {
  name: 'rank',
  mixins: [JeecgListMixin],
  components: {
    RankModal,
    ColumnVisibleModal,
  },
  data() {
    return {
      description: '考核任务表管理页面',
      // 表头
      columns: [
        {
          title: '任务名称',
          align: 'center',
          dataIndex: 'missionName',
        },
        {
          title: '考核年份',
          align: 'center',
          dataIndex: 'assessmentYear',
        },
        {
          title: '考核时间',
          align: 'center',
          dataIndex: 'assessmentTime',
        },
        {
          title: '总分',
          align: 'center',
          dataIndex: 'totalPoint',
        },
        {
          title: '考核要点总数',
          align: 'center',
          dataIndex: 'keyPointsAmount',
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/smartAnswerInfo/rank/getMissionList',
        exportXlsUrl: '/smartAssessmentMission/smartAssessmentMission/exportXls',
        importExcelUrl: 'smartAssessmentMission/smartAssessmentMission/importExcel',
      },
      dictOptions: {},
      /* 分页参数 */
      ipagination: {
        current: 1,
        pageSize: 5,
        pageSizeOptions: ['5', '10', '50'],
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0,
      },
      selectedMainId: '',
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    checkScore(record) {
      this.$refs.rankModal.title = record.missionName + '得分排名'
      this.$refs.rankModal.edit(record)
    },
    changeColumnVisible(record) {
      this.$refs.visibleModal.show(record)
      this.$refs.visibleModal.title = '修改可见字段'
    },
    initDictConfig() {},
    clickThenSelect(record) {
      return {
        on: {
          click: () => {
            this.onSelectChange(record.id.split(','), [record])
          },
        },
      }
    },
    onClearSelected() {
      this.selectedRowKeys = []
      this.selectionRows = []
      this.selectedMainId = ''
    },
    onSelectChange(selectedRowKeys, selectionRows) {
      this.selectedMainId = selectedRowKeys[0]
      this.selectedRowKeys = selectedRowKeys
      this.selectionRows = selectionRows
    },
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error('请设置url.list属性!')
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1
      }
      this.onClearSelected()
      var params = this.getQueryParams() //查询条件
      this.loading = true
      getAction(this.url.list, params).then((res) => {
        if (res.success) {
          this.dataSource = res.result.records
          this.ipagination.total = res.result.total
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
        this.loading = false
      })
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'missionName', text: '任务名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'assessmentYear', text: '考核年份', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'assessmentTime', text: '考核时间' })
      fieldList.push({ type: 'int', value: 'totalPoint', text: '总分', dictCode: '' })
      fieldList.push({ type: 'string', value: 'missionStatus', text: '任务状态', dictCode: '' })
      fieldList.push({ type: 'int', value: 'keyPointsAmount', text: '考核要点总数', dictCode: '' })
      this.superFieldList = fieldList
    },
    handleReset: function (record) {
      if (!this.url.reset) {
        this.$message.error('请设置url.reset属性!')
        return
      }
      var that = this
      putAction(that.url.reset, record).then((res) => {
        if (res.success) {
          that.$message.success(res.message)
          that.loadData(1)
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    publishMission(record) {
      this.loading = true
      putAction(this.url.publish, record)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message)
            this.loadData(1)
          } else {
            this.$message.warning(res.message)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>