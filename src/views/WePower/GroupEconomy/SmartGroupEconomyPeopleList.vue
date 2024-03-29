<template>
  <a-card :bordered="false" :class="'cust-erp-sub-tab'">
    <!-- 操作按钮区域 -->
    <div class="table-operator" v-if="mainId">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <!-- <a-button type="primary" icon="download" @click="handleExportXls('集体经济组织人员')">导出</a-button> -->
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
      >
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <!-- 高级查询区域 -->
      <j-super-query
        :fieldList="superFieldList"
        ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"
      ></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
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
        :scroll="{ x: true }"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
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
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a>删除</a>
          </a-popconfirm>
        </span>
      </a-table>
    </div>

    <smartGroupEconomyPeople-modal ref="modalForm" @ok="modalFormOk" :mainId="mainId"></smartGroupEconomyPeople-modal>
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import SmartGroupEconomyPeopleModal from './modules/SmartGroupEconomyPeopleModal'

export default {
  name: 'SmartGroupEconomyPeopleList',
  mixins: [JeecgListMixin],
  components: { SmartGroupEconomyPeopleModal },
  props: {
    mainId: {
      type: String,
      default: '',
      required: false,
    },
  },
  watch: {
    mainId: {
      immediate: true,
      handler(val) {
        if (!this.mainId) {
          this.clearList()
        } else {
          this.queryParam['mainId'] = val
          this.loadData(1)
        }
      },
    },
  },
  data() {
    return {
      description: '农村集体经济组织管理页面',
      disableMixinCreated: true,
      // 表头
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '所在村镇(街道)',
          align: 'center',
          dataIndex: 'depart_dictText',
        },
        {
          title: '姓名',
          align: 'center',
          dataIndex: 'name',
        },
        {
          title: '职务',
          align: 'center',
          dataIndex: 'job',
        },
        {
          title: '任期开始时间',
          align: 'center',
          dataIndex: 'termStartDate',
          customRender: function (text) {
            return !text ? '' : text.length > 10 ? text.substr(0, 10) : text
          },
        },
        {
          title: '任期结束时间',
          align: 'center',
          dataIndex: 'termEndDate',
          customRender: function (text) {
            return !text ? '' : text.length > 10 ? text.substr(0, 10) : text
          },
        },
        {
          title: '照片',
          align: 'center',
          dataIndex: 'pic',
          scopedSlots: { customRender: 'imgSlot' },
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
        list: '/smartGroupEconomy/smartGroupEconomy/listSmartGroupEconomyPeopleByMainId',
        delete: '/smartGroupEconomy/smartGroupEconomy/deleteSmartGroupEconomyPeople',
        deleteBatch: '/smartGroupEconomy/smartGroupEconomy/deleteBatchSmartGroupEconomyPeople',
        exportXlsUrl: '/smartGroupEconomy/smartGroupEconomy/exportSmartGroupEconomyPeople',
        importUrl: '/smartGroupEconomy/smartGroupEconomy/importSmartGroupEconomyPeople',
      },
      dictOptions: {
        type: [],
      },
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl() {
      return `${window._CONFIG['domianURL']}/${this.url.importUrl}/${this.mainId}`
    },
  },
  methods: {
    clearList() {
      this.dataSource = []
      this.selectedRowKeys = []
      this.ipagination.current = 1
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
