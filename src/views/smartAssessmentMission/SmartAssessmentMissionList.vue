<template>
  <a-card :bordered='false'>
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row :gutter='24'>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="任务名称">
              <a-input placeholder="请输入任务名称" v-model="queryParam.missionName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="考核年份">
              <a-input placeholder="请输入考核年份" v-model="queryParam.assessmentYear"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="任务状态">
              <a-select
                placeholder="全部"
                v-model:value="queryParam.missionStatus">
                <a-select-option value="未发布">未发布</a-select-option>
                <a-select-option value="已发布">已发布</a-select-option>
                <a-select-option value="发布评分结果">发布评分结果</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class='table-operator'>
      <a-button @click='handleAdd' type='primary' icon='plus'>新增</a-button>
      <a-button type='primary' icon='download' @click="handleExportXls('考核任务表')">导出</a-button>
      <a-upload name='file' :showUploadList='false' :multiple='false' :headers='tokenHeader' :action='importExcelUrl'
                @change='handleImportExcel'>
        <a-button type='primary' icon='import'>导入</a-button>
      </a-upload>
      <!-- 高级查询区域 -->
      <j-super-query :fieldList='superFieldList' ref='superQueryModal'
                     @handleSuperQuery='handleSuperQuery'></j-super-query>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class='ant-alert ant-alert-info' style='margin-bottom: 16px;'>
        <i class='anticon anticon-info-circle ant-alert-icon'></i> 已选择 <a
        style='font-weight: 600'>{{ selectedRowKeys.length }}</a>项
        <a style='margin-left: 24px' @click='onClearSelected'>清空</a>
      </div>

      <a-table
        ref='table'
        size='middle'
        bordered
        rowKey='id'
        class='j-table-force-nowrap'
        :scroll='{x:true}'
        :columns='columns'
        :dataSource='dataSource'
        :pagination='ipagination'
        :loading='loading'
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange, type:'radio'}"
        :customRow='clickThenSelect'
        @change='handleTableChange'>

        <template slot="countDown" slot-scope="text, record">
          <a-statistic-countdown
            format="D 天 H 时 m 分 s 秒"
            :value="record.assessmentTime"
            valueStyle="font-size: 14px"
          />
        </template>

        <template slot='htmlSlot' slot-scope='text'>
          <div v-html='text'></div>
        </template>
        <template slot='imgSlot' slot-scope='text'>
          <span v-if='!text' style='font-size: 12px;font-style: italic;'>无图片</span>
          <img v-else :src='getImgView(text)' height='25px' alt=''
               style='max-width:80px;font-size: 12px;font-style: italic;' />
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

        <span slot='action' slot-scope='text, record'>
          <a @click='handleEdit(record)'>编辑</a>

          <a-divider v-if='record.missionStatus === "未发布"' type='vertical' />
          <a-popconfirm v-if='record.missionStatus === "未发布"' title='确定发布吗?' @confirm='() => publishMission(record)'>
            <a>发布任务</a>
          </a-popconfirm>
          <a-divider type='vertical' />
          <a-dropdown>
            <a class='ant-dropdown-link'>更多 <a-icon type='down' /></a>
            <a-menu slot='overlay'>
              <a-menu-item v-if='record.missionStatus === "已发布"'>
                <a-popconfirm title='撤销发布将删除所有单位的记录,确定取消发布吗?' @confirm='() => handleReset(record)'>
                  <a>撤销发布</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if='record.missionStatus === "发布评分结果"'>
                <a-popconfirm title='确定取消发布评分结果吗?' @confirm='() => cancelPublishScoreResult(record)'>
                  <a>取消发布评分结果</a>
                </a-popconfirm>
              </a-menu-item>
              <a-menu-item v-if='record.missionStatus === "未发布"'>
                <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete(record.id)'>
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <a-tabs defaultActiveKey='1'>
      <a-tab-pane tab='考核任务被考核单位' key='1'>
        <SmartAssessmentDepartList :mainId='selectedMainId' :main-info='selectionRows[0]' />
      </a-tab-pane>
      <a-tab-pane tab='考核内容' key='2'>
        <SmartAssessmentContentList :mainId='selectedMainId' :main-info='selectionRows[0]' @ok='loadData(2)' />
      </a-tab-pane>
    </a-tabs>

    <smartAssessmentMission-modal ref='modalForm' @ok='modalFormOk'></smartAssessmentMission-modal>
  </a-card>
</template>

<script>

import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import SmartAssessmentMissionModal from './modules/SmartAssessmentMissionModal'
import { deleteAction, getAction, postAction, putAction } from '@/api/manage'
import SmartAssessmentDepartList from './SmartAssessmentDepartList'
import SmartAssessmentContentList from '@views/smartAssessmentContent/SmartAssessmentContentList'
import '@/assets/less/TableExpand.less'

export default {
  name: 'SmartAssessmentMissionList',
  mixins: [JeecgListMixin],
  components: {
    SmartAssessmentDepartList,
    SmartAssessmentContentList,
    SmartAssessmentMissionModal
  },
  data() {
    return {
      description: '考核任务表管理页面',
      // 表头
      columns: [
        {
          title: '#',
          dataIndex: '',
          key:'rowIndex',
          width:60,
          align:"center",
          customRender:function (t,r,index) {
            return parseInt(index)+1;
          }
        },
        {
          title: '任务名称',
          align: 'center',
          dataIndex: 'missionName'
        },
        {
          title: '考核年份',
          align: 'center',
          dataIndex: 'assessmentYear'
        },
        {
          title: '截止时间',
          align: 'center',
          dataIndex: 'assessmentTime'
        },
        {
          title: '距离截止时间倒计时',
          align: 'center',
          dataIndex: 'endTime',
          scopedSlots: { customRender: 'countDown' }
        },
        {
          title: '总分',
          align: 'center',
          dataIndex: 'totalPoint'
        },
        {
          title: '任务状态',
          align: 'center',
          dataIndex: 'missionStatus'
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
        list: '/smartAssessmentMission/smartAssessmentMission/list',
        reset: '/smartAssessmentMission/smartAssessmentMission/reset',
        recallScoreResult: '/smartAssessmentMission/smartAssessmentMission/recallScoreResult',
        delete: '/smartAssessmentMission/smartAssessmentMission/delete',
        publish: '/smartAssessmentMission/smartAssessmentMission/publish',
        deleteBatch: '/smartAssessmentMission/smartAssessmentMission/deleteBatch',
        exportXlsUrl: '/smartAssessmentMission/smartAssessmentMission/exportXls',
        importExcelUrl: 'smartAssessmentMission/smartAssessmentMission/importExcel'
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
        total: 0
      },
      selectedMainId: '',
      superFieldList: []
    }
  },
  created() {
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl: function() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    initDictConfig() {
    },
    clickThenSelect(record) {
      return {
        on: {
          click: () => {
            this.onSelectChange(record.id.split(','), [record])
          }
        }
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
      } else if (arg === 2) {
        console.log('刷新分数!')
      } else {
        this.onClearSelected()
      }
      var params = this.getQueryParams()//查询条件
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
      if(!this.url.reset){
        this.$message.error("请设置url.reset属性!")
        return
      }
      this.loading = true
      var that = this;
      putAction(that.url.reset, record).then((res) => {
        if (res.success) {
          that.$message.success(res.message);
          that.loadData(1);
        } else {
          that.$message.warning(res.message);
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    publishMission(record) {
      this.loading = true
      putAction(this.url.publish, record).then((res) => {
        if (res.success) {
          this.$message.success(res.message);
          this.loadData(1)
        }else{
          this.$message.warning(res.message);
        }
      }).finally(() => {
        this.loading = false;
      })
    },
    cancelPublishScoreResult(record) {
      this.loading = true
      putAction(this.url.recallScoreResult, record).then((res) => {
        if (res.success) {
          this.$message.success(res.message);
          this.loadData(1)
        }else{
          this.$message.warning(res.message);
        }
      }).finally(() => {
        this.loading = false;
      })
    },
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less'
</style>