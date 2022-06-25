<template>
  <a-card :bordered='false' title="本单位历史考核任务">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
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
      <!-- 高级查询区域 -->
      <j-super-query :fieldList='superFieldList' ref='superQueryModal'
                     @handleSuperQuery='handleSuperQuery'></j-super-query>
    </div>

    <!-- table区域-begin -->
    <div>
      <a-table
        ref='table'
        size='middle'
        :scroll='{x:true}'
        bordered
        rowKey='id'
        :columns='columns'
        :dataSource='dataSource'
        :pagination='ipagination'
        :loading='loading'
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange, type:'radio'}"
        :customRow='clickThenSelect'
        class='j-table-force-nowrap'
        @change='handleTableChange'>

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
          <a @click='handleDetail(record)'>详情</a>
          <a-divider type='vertical' />
          <a-dropdown>
            <a class='ant-dropdown-link'>更多 <a-icon type='down' /></a>
            <a-menu slot='overlay'>
              <a-menu-item>
                <a @click='updateCompletionDegree(record)'>更新完成度</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <a-tabs v-if='selectedMainId' defaultActiveKey='1'>
      <a-tab-pane tab='上传内容' key='1'>
        <smart-answer-page :main-id='selectedMainId' :main-info='selectionRows[0]'></smart-answer-page>
      </a-tab-pane>
      <a-tab-pane v-if='selectionRows[0].isShowScore == 1' tab='得分详情' key='2'>
        <ScoreDetailList :main-id='selectedMainId' :main-info='selectionRows[0]'/>
      </a-tab-pane>
    </a-tabs>

    <smart-answer-info-modal ref='modalForm' @ok='modalFormOk'></smart-answer-info-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import SmartAnswerInfoModal from './modules/SmartAnswerInfoModal'
import SmartAssessmentContentModal from '@views/smartAssessmentContent/modules/SmartAssessmentContentModal'
import { getAction, putAction } from '@api/manage'
import SmartAssessmentContentForm from '@views/smartAnswerInfo/modules/SmartAssessmentContentForm'
import SmartAnswerPage from "./modules/SmartAnswerPage";
import ScoreDetailList from '@views/smartAssessmentStatistic/scoreDetail/ScoreDetailList'

export default {
  name: 'SmartAnswerInfoHistoryList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    ScoreDetailList,
    SmartAnswerPage,
    SmartAssessmentContentForm,
    SmartAssessmentContentModal,
    SmartAnswerInfoModal
  },
  data() {
    return {
      description: '答题信息表管理页面',
      // 表头
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function(t, r, index) {
            return parseInt(index) + 1
          }
        },
        {
          title: '考核任务',
          align: 'center',
          dataIndex: 'missionId_dictText'
        },
        {
          title: '单位',
          align: 'center',
          dataIndex: 'depart_dictText'
        },
        {
          title: '任务状态',
          align: 'center',
          dataIndex: 'missionStatus'
        },
        {
          title:'截止时间',
          align:"center",
          dataIndex: 'endTime'
        },
        {
          title: '完成要点个数',
          align: 'center',
          dataIndex: 'finishedKeyPointAmount'
        },
        {
          title: '总要点个数',
          align: 'center',
          dataIndex: 'totalKeyPointAmount'
        },
        {
          title: '完成度',
          align: 'center',
          dataIndex: 'completionDegree',
          customRender: function(t, r, index) {
            return t*100 + ' %'
          }
        },
        {
          title: '总分',
          align: 'center',
          dataIndex: 'totalPoints'
        },
        {
          title: '排名',
          align: 'center',
          dataIndex: 'ranking'
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
        list: '/smartAssessmentMission/smartAssessmentMission/historyList',
        delete: '/smartAnswerInfo/smartAnswerInfo/delete',
        updateCompletionDegree: '/smartAnswerInfo/smartAnswerInfo/updateCompletionDegree',
        sign: '/smartAnswerInfo/smartAnswerInfo/sign',
        deleteBatch: '/smartAnswerInfo/smartAnswerInfo/deleteBatch',
        exportXlsUrl: '/smartAnswerInfo/smartAnswerInfo/exportXls',
        importExcelUrl: 'smartAnswerInfo/smartAnswerInfo/importExcel'

      },
      dictOptions: {},
      selectedMainId: '',
      selectionRows: [],
      superFieldList: [],

      /* 排序参数 */
      isorter:{
        column: '',
        order: '',
      },
    }
  },
  created() {
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl: function() {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    }
  },
  methods: {
    initDictConfig() {
    },
    searchQuery() {
      this.queryParam.hasQuery = true
      this.loadData(1);
    },
    handleSuperQuery(params, matchType) {
      //高级查询方法
      if(!params){
        this.superQueryParams=''
        this.superQueryFlag = false
      }else{
        this.superQueryFlag = true
        this.queryParam.hasQuery = true
        this.superQueryParams=JSON.stringify(params)
        this.superQueryMatchType = matchType
      }
      this.loadData(1)
    },
    loadData(arg) {
      if(!this.url.list){
        this.$message.error("请设置url.list属性!")
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1;
      }
      var params = this.getQueryParams();//查询条件
      this.loading = true;
      getAction(this.url.list, params).then((res) => {
        if (res.success) {
          //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          this.dataSource = res.result.records||res.result;
          if(res.result.total)
          {
            this.ipagination.total = res.result.total;
          }else{
            this.ipagination.total = 0;
          }
          //update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
        }else{
          this.dataSource = []
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.loading = false
      })
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
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'missionName', text: '任务名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'assessmentYear', text: '考核年份', dictCode: '' })
      fieldList.push({ type: 'datetime', value: 'assessmentTime', text: '考核时间' })
      fieldList.push({ type: 'int', value: 'keyPointsAmount', text: '考核要点总数', dictCode: '' })
      this.superFieldList = fieldList
    },
    signMission(record) {
      // 签收任务，并生成答题要点记录
      this.loading = true
      putAction(this.url.sign, record).then((res) => {
        if (res.success) {
          this.$message.success(res.message);
          this.onClearSelected()
          this.loadData(1)
        }else{
          this.$message.warning(res.message);
        }
      }).finally(() => {
        this.loading = false;
      })
    },
    updateCompletionDegree(record) {
      // 签收任务，并生成答题要点记录
      this.loading = true
      putAction(this.url.updateCompletionDegree, record).then((res) => {
        if (res.success) {
          this.$message.success(res.message);
          this.onClearSelected()
          this.loadData(1)
        }else{
          this.$message.warning(res.message);
        }
      }).finally(() => {
        this.loading = false;
      })
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>