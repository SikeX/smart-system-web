<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-form-item label="标题">
              <a-input placeholder="请输入标题" v-model="queryParam.titile"></a-input>
            </a-form-item>
          </a-col>
          <!--<a-col :span="6">
            <a-form-item label="内容">
              <a-input placeholder="请输入内容" v-model="queryParam.msgContent"></a-input>
            </a-form-item>
          </a-col>-->

          <a-col :span="8">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <!-- <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button> -->
      <a-button type="primary" icon="download" @click="handleExportXls('系统通告')">导出</a-button>
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
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel">
            <a-icon type="delete" />
            删除
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down" />
        </a-button>
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
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
      >
        <span slot="action" slot-scope="text, record">
          <a v-if="record.sendStatus == 0" @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" v-if="record.sendStatus == 0" />
              <a-menu-item v-if="record.sendStatus != 1">
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if="record.sendStatus == 0">
                <a-popconfirm title="确定发布吗?" @confirm="() => releaseData(record.id)">
                  <a>发布</a>
                </a-popconfirm>
              </a-menu-item>
              <!-- <a v-if="record.sendStatus == 1">
                <a-popconfirm title="确定撤销吗?" @confirm="() => reovkeData(record.id)">
                  <a>撤销</a>
                </a-popconfirm>
              </a> -->
              <a>
                <a @click="handleDetail(record)">查看</a>
              </a>
              <a-divider type="vertical" />
              <a @click="checkDetail(record)">详情</a>
        </span>
      </a-table>
    </div>
    <!-- table区域-end -->

    <!-- 表单区域 -->
    <task-detail-modal ref="detailListModal" @ok="detailListModalOk"></task-detail-modal>
    <!-- 查看详情 -->
    <j-modal
      class="detail-modal"
      title="查看详情"
      :visible.sync="detailModal.visible"
      :top="50"
      :width="600"
      switchFullscreen
      :footer="null"
    >
      <iframe v-if="detailModal.url" class="detail-iframe" :src="detailModal.url" />
    </j-modal>
  </a-card>
</template>

<script>
import TaskDetailModal from './module/TaskDetailModal.vue'
import SysAnnouncementModal from '@/views/system/modules/SysAnnouncementModal'
import { doReleaseData, doReovkeData } from '@/api/api'
import { getAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { ACCESS_TOKEN } from '@/store/mutation-types'

export default {
  name: 'SysAnnouncementList',
  mixins: [JeecgListMixin],
  components: {
    SysAnnouncementModal,
    TaskDetailModal
  },
  data() {
    return {
      description: '系统通告表管理页面',
      upurl: window._CONFIG['domianURL'] + '/sys/common/static/',
      // 查询条件
      queryParam: {},
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
          title: '任务标题',
          align: 'center',
          dataIndex: 'titile',
        },
        // {
        //   title: '消息类型',
        //   align: 'center',
        //   dataIndex: 'msgCategory',
        //   customRender: function (text) {
        //     if (text == '1') {
        //       return '通知公告'
        //     } else if (text == '2') {
        //       return '廉政提醒'
        //     } else if (text == '3') {
        //       return '任务下发'
        //     } else {
        //       return text
        //     }
        //   },
        // },
        /*{
            title: '开始时间',
            align: "center",
            dataIndex: 'startTime'
          },
          {
            title: '结束时间',
            align: "center",
            dataIndex: 'endTime'
          },*/
        // {
        //   title: '发布人',
        //   align: 'center',
        //   dataIndex: 'sender',
        // },
        // {
        //   title: '发布部门',
        //   align: 'center',
        //   dataIndex: 'senderDepart',
        // },
        {
          title: '优先级',
          align: 'center',
          dataIndex: 'priority',
          customRender: function (text) {
            if (text == 'L') {
              return '低'
            } else if (text == 'M') {
              return '中'
            } else if (text == 'H') {
              return '高'
            } else {
              return text
            }
          },
        },
        {
          title: '通告对象',
          align: 'center',
          dataIndex: 'msgType',
          customRender: function (text) {
            if (text == 'USER') {
              return '指定用户'
            } else if (text == 'DEPART') {
              return '部门'
            } else if (text == 'ALL') {
              return '全体用户'
            } else {
              return text
            }
          },
        },
        {
          title: '发布状态',
          align: 'center',
          dataIndex: 'sendStatus',
          customRender: function (text) {
            if (text == 0) {
              return '未发布'
            } else if (text == 1) {
              return '已发布'
            } else if (text == 2) {
              return '已撤销'
            } else {
              return text
            }
          },
        },
        {
          title: '已读',
          align: 'center',
          dataIndex: 'readCount',
        },
        {
          title: '发送人数',
          align: 'center',
          dataIndex: 'sendCount',
        },
        {
          title: '发布时间',
          align: 'center',
          dataIndex: 'sendTime',
        },
        {
          title: '撤销时间',
          align: 'center',
          dataIndex: 'cancelTime',
        },
        // {
        //   title: '附件',
        //   align: 'center',
        //   dataIndex: 'fileList',
        //   ellipsis: true,
        //   customRender: function (text) {
        //     console.log(text)
        //     if (text) {
        //       const fileList = text.split(',')
        //       console.log(fileList)
        //       for(let i of fileList){
        //         const url = window._CONFIG['domianURL'] + '/sys/common/static/' + i
        //         return <a href='url'>{i}</a>
        //       }
              
        //     }
        //   }
        // },
        /*{
                title: '删除状态（0，正常，1已删除）',
                align:"center",
                dataIndex: 'delFlag'
              },*/
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          scopedSlots: { customRender: 'action' },
        },
      ],
      detailModal: { visible: false, url: '' },
      url: {
        list: '/sys/annountCement/taskList',
        delete: '/sys/annountCement/delete',
        deleteBatch: '/sys/annountCement/deleteBatch',
        releaseDataUrl: '/sys/annountCement/doReleaseData',
        reovkeDataUrl: 'sys/annountCement/doReovkeData',
        exportXlsUrl: 'sys/annountCement/exportXls',
        importExcelUrl: 'sys/annountCement/importExcel',
      },
    }
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    //执行发布操作
    releaseData: function (id) {
      console.log(id)
      var that = this
      doReleaseData({ id: id }).then((res) => {
        if (res.success) {
          that.$message.success(res.message)
          that.loadData(1)
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    //执行撤销操作
    reovkeData: function (id) {
      var that = this
      doReovkeData({ id: id }).then((res) => {
        if (res.success) {
          that.$message.success(res.message)
          that.loadData(1)
          this.syncHeadNotic(id)
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    checkDetail (record) {
      console.log(record)
      this.$refs.detailListModal.edit(record)
      this.$refs.taskDetailModal.title = record.titile + '统计详情'
    },
    syncHeadNotic(anntId) {
      getAction('sys/annountCement/syncNotic', { anntId: anntId })
    },
    handleDetail: function (record) {
      const domain = window._CONFIG['domianURL']
      const token = this.$ls.get(ACCESS_TOKEN)
      this.detailModal.url = `${domain}/sys/annountCement/show/${record.id}?token=${token}`
      this.detailModal.visible = true
    },
  },
}
</script>
<style scoped lang="less">
@import '~@assets/less/common.less';

/** 查看详情弹窗的样式 */
.detail-modal {
  .detail-iframe {
    border: 0;
    width: 100%;
    height: 88vh;
    min-height: 600px;
  }

  &.fullscreen .detail-iframe {
    height: 100%;
  }
}

.detail-modal /deep/ .ant-modal {
  top: 30px;

  .ant-modal-body {
    font-size: 0;
    padding: 0;
  }
}

.detail-modal.fullscreen /deep/ .ant-modal {
  top: 0;
}
</style>