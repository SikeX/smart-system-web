<template>
  <a-card :bordered='false'>
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
          <a-divider v-if='record.missionStatus === "未签收"' type='vertical' />
          <a v-if='record.missionStatus === "未签收"' @click='signMission(record)'>签收</a>
        </span>

      </a-table>
    </div>

    <div>
      <a-row v-if='selectedMainId'>
        <a-empty
          v-if='selectionRows[0].missionStatus === "未签收"'
          image='https://gw.alipayobjects.com/mdn/miniapp_social/afts/img/A*pevERLJC9v0AAAAAAAAAAABjAQAAAQ/original'
          :image-style="{
            height: '60px',
          }"
        >
          <span slot='description'> 请签收任务后查看 </span>
          <a-button type='primary' @click='signMission(selectionRows[0])'>
            签收
          </a-button>
        </a-empty>
        <smart-answer-page v-else :main-id='selectedMainId' :main-info='selectionRows[0]'></smart-answer-page>
      </a-row>
    </div>

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
import SmartAnswerPage from '@views/smartAnswerInfo/modules/SmartAnswerPage'

export default {
  name: 'SmartAnswerInfoList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
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
          dataIndex: 'finishedPoint'
        },
        {
          title: '完成度',
          align: 'center',
          dataIndex: 'completionDegree'
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
        list: '/smartAnswerInfo/smartAnswerInfo/list',
        delete: '/smartAnswerInfo/smartAnswerInfo/delete',
        sign: '/smartAnswerInfo/smartAnswerInfo/sign',
        deleteBatch: '/smartAnswerInfo/smartAnswerInfo/deleteBatch',
        exportXlsUrl: '/smartAnswerInfo/smartAnswerInfo/exportXls',
        importExcelUrl: 'smartAnswerInfo/smartAnswerInfo/importExcel'

      },
      dictOptions: {},
      selectedMainId: '',
      selectionRows: [],
      superFieldList: []
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
    startMission(record) {

    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>