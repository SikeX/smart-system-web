<template>
  <div>
    <a-card v-has="'statistic:listAll'" title='全区统计分析' :bordered='false'>
      <!-- 查询区域 -->
      <div class='table-page-search-wrapper'>
        <a-form layout='inline' @keyup.enter.native='searchQuery'>
          <a-row :gutter='24'>
            <a-col :xl='6' :lg='7' :md='8' :sm='24'>
              <a-form-item label='考核任务'>
                <j-search-select-tag
                  placeholder="全部"
                  v-model="queryParam.missionId"
                  dict="smart_assessment_mission,mission_name,id"
                  :async="true">
                </j-search-select-tag>
              </a-form-item>
            </a-col>
            <a-col :xl='6' :lg='7' :md='8' :sm='24'>
              <a-form-item label='单位'>
                <j-select-depart placeholder='全部' v-model='queryParam.depart' customReturnField='id' :multi='true'
                                 :treeOpera='true'></j-select-depart>
              </a-form-item>
            </a-col>
            <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <span style='float: left;overflow: hidden;' class='table-page-search-submitButtons'>
              <a-button type='primary' @click='searchQuery' icon='search'>查询</a-button>
              <a-button type='primary' @click='searchReset' icon='reload' style='margin-left: 8px'>重置</a-button>
              <a @click='handleToggleSearch' style='margin-left: 8px'>
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <!-- 查询区域-END -->

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

          <template slot='countDown' slot-scope='text, record'>
            <a-statistic-countdown
              format='D 天 H 时 m 分 s 秒'
              :value='record.endTime'
              valueStyle='font-size: 14px'
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
          <a @click='handleDetail(record)'>详情</a>
        </span>
        </a-table>
      </div>

      <a-row v-if='selectedMainId'>
        <a-card :bordered='false' title='单位统计信息'>
          <a-row>
            <a-col :span='6'>
              <a-statistic title='党员数' :value='dangYuanCount' />
            </a-col>
            <a-col :span='6'>
              <a-statistic title='执行第一种形态人员数' :value='firstCount' />
            </a-col>
            <a-col :span='6'>
              <a-statistic title='处分人员数' :value='chuFenRenYuanCount' />
            </a-col>
            <a-col :span='6'>
              <a-statistic title='单位重要领导是否被处分' :value='mainPeople' />
            </a-col>
          </a-row>
        </a-card>
      </a-row>

      <a-tabs v-if='selectedMainId' defaultActiveKey='1'>
        <a-tab-pane tab='上传内容' key='1'>
          <smart-answer-page :main-id='selectedMainId' :main-info='selectionRows[0]'></smart-answer-page>
        </a-tab-pane>
        <a-tab-pane tab='得分详情' key='2'>
          <ScoreDetailList :main-id='selectedMainId' :main-info='selectionRows[0]'/>
        </a-tab-pane>
        <a-tab-pane tab='单位排名详情' key='3'>
          <DepartRankList :main-id='selectionRows[0].missionId' :is-show='false'></DepartRankList>
        </a-tab-pane>
      </a-tabs>

      <smart-answer-info-modal ref='modalForm' @ok='modalFormOk'></smart-answer-info-modal>
    </a-card>

    <SmartAnswerInfoHistoryList style='margin-top: 20px'/>
  </div>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import SmartAnswerInfoModal from './modules/SmartAnswerInfoModal'
import SmartAssessmentContentModal from '@views/smartAssessmentContent/modules/SmartAssessmentContentModal'
import { getAction, putAction } from '@api/manage'
import SmartAssessmentContentForm from '@views/smartAnswerInfo/modules/SmartAssessmentContentForm'
import SmartAnswerPage from './modules/SmartAnswerPage'
import SmartAnswerInfoHistoryList from '@views/smartAnswerInfo/SmartAnswerInfoHistoryList'
import ScoreDetailList from './scoreDetail/ScoreDetailList'
import DepartRankList from '@views/smartAssessmentFinalScore/modules/DepartRankList'

export default {
  name: 'SmartAssessmentStatistic',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    DepartRankList,
    ScoreDetailList,
    SmartAnswerInfoHistoryList,
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
        // {
        //   title: '任务状态',
        //   align: 'center',
        //   dataIndex: 'missionStatus'
        // },
        {
          title: '截止时间',
          align: 'center',
          dataIndex: 'endTime'
        },
        {
          title: '完成要点个数',
          align: 'center',
          dataIndex: 'finishedKeyPointAmount'
        },
        {
          title: '总分',
          align: 'center',
          dataIndex: 'totalPoints'
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
        list: '/smartAnswerInfo/smartAnswerInfo/listAll',
        delete: '/smartAnswerInfo/smartAnswerInfo/delete',
        sign: '/smartAnswerInfo/smartAnswerInfo/sign',
        deleteBatch: '/smartAnswerInfo/smartAnswerInfo/deleteBatch',
        exportXlsUrl: '/smartAnswerInfo/smartAnswerInfo/exportXls',
        importExcelUrl: 'smartAnswerInfo/smartAnswerInfo/importExcel'

      },
      dictOptions: {},
      selectedMainId: '',
      selectionRows: [],
      superFieldList: [],

      dangYuanCount: 0,
      firstCount: 0,
      chuFenRenYuanCount: 0,
      mainPeople: '否',
      selectedDepartName: ''
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
    loadCountData() {
      // 党员
      params = {
        departId: this.selectionRows[0].depart
      }
      this.loading = true
      getAction('/sys/user/countByPoliticalStatus', params).then((res) => {
        if (res.success) {
          let result = res.result
          this.dangYuanCount = result.count
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
      })

      // 第一形态人
      let params = {
        departId: this.selectionRows[0].depart
      }
      this.loading = true
      getAction('/SmartFirstFormPeople/smartFirstFormPeople/countByDepartId', params).then((res) => {
        if (res.success) {
          let result = res.result
          this.firstCount = result.count
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
      })

      // 处分人员
      params = {
        departId: this.selectionRows[0].depart
      }
      this.loading = true
      getAction('/SmartPunishPeople/smartPunishPeople/countByDepartId', params).then((res) => {
        if (res.success) {
          let result = res.result
          this.chuFenRenYuanCount = result.count
          this.mainPeople = result.mainPeopleCount > 0 ? '是' : '否'
        }
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
      })

      this.loading = false
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
      this.selectedDepartName = selectionRows[0].depart_dictText
      this.loadCountData()
      console.log(selectionRows)
    },
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({
        type: 'string',
        value: 'missionId',
        text: '考核任务',
        dictCode: 'smart_assessment_mission,mission_name,id'
      })
      fieldList.push({ type: 'sel_depart', value: 'depart', text: '单位' })
      fieldList.push({ type: 'string', value: 'missionStatus', text: '任务状态', dictCode: '' })
      fieldList.push({ type: 'date', value: 'endTime', text: '任务状态', dictCode: '' })
      fieldList.push({ type: 'int', value: 'finishedPoint', text: '完成要点个数', dictCode: '' })
      fieldList.push({ type: 'double', value: 'completionDegree', text: '完成度', dictCode: '' })
      fieldList.push({ type: 'int', value: 'totalPoints', text: '总分', dictCode: '' })
      fieldList.push({ type: 'int', value: 'ranking', text: '排名', dictCode: '' })
      this.superFieldList = fieldList
    },
    signMission(record) {
      // 签收任务，并生成答题要点记录
      this.loading = true
      putAction(this.url.sign, record).then((res) => {
        if (res.success) {
          this.$message.success(res.message)
          this.onClearSelected()
          this.loadData(1)
        } else {
          this.$message.warning(res.message)
        }
      }).finally(() => {
        this.loading = false
      })
    },
    startMission(record) {

    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>