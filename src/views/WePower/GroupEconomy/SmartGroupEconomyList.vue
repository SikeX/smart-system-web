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
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <!-- <a-button type="primary" icon="download" @click="handleExportXls('农村集体经济组织')">导出</a-button> -->
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
      >
        <!-- <a-button type="primary" icon="import">导入</a-button> -->
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
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a
        >项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

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
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange, type: 'radio' }"
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
          <a @click="handleDetail(record)">详情</a>
          <a-divider type="vertical" />
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a v-if="record.meetingStatus === '0'" @click="addMeeting(record)">添加会议信息</a>
          <a v-else @click="showMeeting(record)">查看会议信息</a>
        </span>
      </a-table>
      <smart-group-economy-meeting-modal ref="meetingModal" @ok="modalFormOk"></smart-group-economy-meeting-modal>
    </div>

    <a-tabs defaultActiveKey="1">
      <a-tab-pane tab="集体经济组织人员" key="1">
        <SmartGroupEconomyPeopleList :mainId="selectedMainId" />
      </a-tab-pane>
    </a-tabs>

    <smartGroupEconomy-modal ref="modalForm" @ok="modalFormOk"></smartGroupEconomy-modal>
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import SmartGroupEconomyModal from './modules/SmartGroupEconomyModal'
import { getAction } from '@/api/manage'
import SmartGroupEconomyPeopleList from './SmartGroupEconomyPeopleList'
import SmartGroupEconomyMeetingList from './SmartGroupEconomyMeetingList'
import { initDictOptions, filterMultiDictText } from '@/components/dict/JDictSelectUtil'
import '@/assets/less/TableExpand.less'
import SmartGroupEconomyMeetingModal from './modules/SmartGroupEconomyMeetingModal'

export default {
  name: 'SmartGroupEconomyList',
  mixins: [JeecgListMixin],
  components: {
    SmartGroupEconomyPeopleList,
    SmartGroupEconomyMeetingList,
    SmartGroupEconomyModal,
    SmartGroupEconomyMeetingModal,
  },
  data() {
    return {
      description: '农村集体经济组织管理页面',
      // 表头
      columns: [
        {
          title: '农村集体经济组织类型',
          align: 'center',
          dataIndex: 'type_dictText',
        },
        {
          title: '农村集体经济组织名称',
          align: 'center',
          dataIndex: 'name',
        },
        {
          title: '授权额度',
          align: 'center',
          dataIndex: 'credit',
        },
        {
          title: '账户名称',
          align: 'center',
          dataIndex: 'accountName',
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
      status: {},
      url: {
        list: '/smartGroupEconomy/smartGroupEconomy/listAdmin',
        delete: '/smartGroupEconomy/smartGroupEconomy/delete',
        deleteBatch: '/smartGroupEconomy/smartGroupEconomy/deleteBatch',
        exportXlsUrl: '/smartGroupEconomy/smartGroupEconomy/exportXls',
        importExcelUrl: 'smartGroupEconomy/smartGroupEconomy/importExcel',
      },
      dictOptions: {
        type: [],
      },
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
    addMeeting(record) {
      this.$refs.meetingModal.add(record)
      this.$refs.meetingModal.title = '添加会议信息'
      this.$refs.meetingModal.disableSubmit = false
    },
    showMeeting(record) {
      this.$refs.meetingModal.show(record)
      this.$refs.meetingModal.title = '查看会议信息'
      this.$refs.meetingModal.disableSubmit = true
    },
    initDictConfig() {
      initDictOptions('group_economy_type').then((res) => {
        if (res.success) {
          this.$set(this.dictOptions, 'type', res.result)
        }
      })
    },
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
      fieldList.push({ type: 'string', value: 'type', text: '农村集体经济组织类型', dictCode: 'group_economy_type' })
      fieldList.push({ type: 'string', value: 'name', text: '农村集体经济组织名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'credit', text: '授权额度', dictCode: '' })
      fieldList.push({ type: 'string', value: 'accountName', text: '账户名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'account', text: '账号', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>