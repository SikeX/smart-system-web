<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div v-if="roleId.indexOf('1465163864583323650') == -1" class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="审核状态">
              <a-select v-model="queryParam.verifyStatus" placeholder="请选择审核状态">
                <a-select-option value="0">不通过</a-select-option>
                <a-select-option value="1">通过</a-select-option>
                <a-select-option value="2">待审核</a-select-option>
                <a-select-option value="3">免审</a-select-option>
                <a-select-option value="4">待提交</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="单位">
              <j-select-depart
                placeholder="请选择单位"
                v-model="queryParam.departId"
                customReturnField="id"
                :multi="false"
                :treeOpera="true"
              ></j-select-depart>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="日期查询">
              <j-date placeholder="请选择日期" v-model="queryParam.supervisionTime"></j-date>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="审核状态">
              <a-select v-model="queryParam.verifyStatus" placeholder="请选择审核状态">
                <a-select-option value="0">不通过</a-select-option>
                <a-select-option value="1">通过</a-select-option>
                <a-select-option value="2">待审核</a-select-option>
                <a-select-option value="3">免审</a-select-option>
                <a-select-option value="4">待提交</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('八项规定监督检查表')">导出</a-button>
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
        class="j-table-force-nowrap"
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
          <a-popconfirm title="确定提交吗，提交后不可再修改?" @confirm="() => submitVerify(record)">
            <a v-if="record.verifyStatus === '4'">提交审核</a>
          </a-popconfirm>
          <a-divider v-if="record.verifyStatus === '4'" type="vertical" />
          <a v-show="record.verifyStatus === '3' || record.verifyStatus === '4'" @click="handleEdit(record)">编辑</a>
          <a-divider v-show="record.verifyStatus === '3' || record.verifyStatus === '4'" type="vertical" />
          <a @click="handleDetail(record)">详情</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a v-show="record.verifyStatus == '3' || record.verifyStatus === '4'">删除</a>
          </a-popconfirm>
        </span>

        <span slot="verify" slot-scope="text">
          <a-tag v-if="text == '0'" color="#f14c4c">不通过</a-tag>
          <a-tag v-if="text == '1'" color="#10bc79">通过</a-tag>
          <a-tag v-if="text == '2'" color="#29b8db">待审核</a-tag>
          <a-tag v-if="text == '3'" color="green">免审</a-tag>
          <a-tag v-if="text == '4'" color="gray">待提交</a-tag>
        </span>
      </a-table>
    </div>

    <smart-supervision-modal ref="modalForm" @ok="modalFormOk" />
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import SmartSupervisionModal from './modules/SmartSupervisionModal'
import '@/assets/less/TableExpand.less'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'SmartSupervisionList',
  mixins: [JeecgListMixin],
  components: {
    SmartSupervisionModal,
  },
  data() {
    return {
      description: '八项规定监督检查表管理页面',
      roleId: [],
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
          title: '审核状态',
          align: 'center',
          dataIndex: 'verifyStatus',
          scopedSlots: { customRender: 'verify' },
        },
        {
          title: '创建人',
          align: 'center',
          dataIndex: 'createBy_dictText',
        },
        {
          title: '创建日期',
          align: 'center',
          dataIndex: 'createTime',
        },
        {
          title: '标题',
          align: 'center',
          dataIndex: 'title',
        },
        {
          title: '监督检查时间',
          align: 'center',
          dataIndex: 'supervisionTime',
          customRender: function (text) {
            return !text ? '' : text.length > 10 ? text.substr(0, 10) : text
          },
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
        list: '/smartSupervision/smartSupervision/list',
        delete: '/smartSupervision/smartSupervision/delete',
        deleteBatch: '/smartSupervision/smartSupervision/deleteBatch',
        exportXlsUrl: '/smartSupervision/smartSupervision/exportXls',
        importExcelUrl: 'smartSupervision/smartSupervision/importExcel',
        verify: '/smartSupervision/smartSupervision/submitVerify',
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created() {
    this.roleId = this.userInfo().roleId
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    ...mapGetters(['userInfo']),
    initDictConfig() {},
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'createBy', text: '创建人', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'createTime', text: '创建日期' })
      fieldList.push({ type: 'string', value: 'departId', text: '部门ID', dictCode: '' })
      fieldList.push({ type: 'string', value: 'title', text: '标题', dictCode: '' })
      fieldList.push({ type: 'Text', value: 'content', text: '正文', dictCode: '' })
      fieldList.push({ type: 'date', value: 'supervisionTime', text: '监督检查时间' })
      fieldList.push({ type: 'string', value: 'creatorNo', text: '创建人员工号', dictCode: '' })
      fieldList.push({ type: 'string', value: 'sysOrgCode', text: '所属部门', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>