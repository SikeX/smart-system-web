<template>
  <a-card :title='description' v-if='contentId' :bordered='false'>
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
          <a @click='handleMark(record)'>评分</a>
        </span>

      </a-table>
    </div>

    <smart-score-info-modal  ref='modalForm' :max-score="maxScore" @ok='modalFormOk'></smart-score-info-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import SmartAssessmentContentModal from '@views/smartAssessmentContent/modules/SmartAssessmentContentModal'
import { getAction, putAction } from '@api/manage'
import SmartAssessmentContentForm from '@views/smartAnswerInfo/modules/SmartAssessmentContentForm'
import SmartAnswerPage from '@views/smartAnswerInfo/modules/SmartAnswerPage'
import SmartScoreInfoModal from '@views/smartAssessmentScore/modules/SmartScoreInfoModal'

export default {
  name: 'SmartScoreDepartList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    SmartScoreInfoModal,
    SmartAnswerPage,
    SmartAssessmentContentForm,
    SmartAssessmentContentModal
  },
  props:{
    missionId:{
      type:String,
      default:'',
      required:false
    },
    contentId:{
      type:String,
      default:'',
      required:false
    },
    maxScore:{
      type: Number,
      default:0,
      required:false
    }
  },
  watch:{
    contentId:{
      immediate: true,
      handler(val) {
        if(!this.missionId){
          this.clearList()
        }else{
          this.queryParam['missionId'] = this.missionId
          this.loadData(1);
        }
      }
    }
  },
  data() {
    return {
      description: '被考核单位列表',
      disableMixinCreated:true,
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
    handleMark:function(record){
      // console.log(record)
      this.$refs.modalForm.title="评分";
      this.$refs.modalForm.disableSubmit = false;
      this.$refs.modalForm.edit(this.contentId, record.id);
    },
    initDictConfig() {
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
      fieldList.push({ type: 'int', value: 'finishedPoint', text: '完成要点个数', dictCode: '' })
      fieldList.push({ type: 'double', value: 'completionDegree', text: '完成度', dictCode: '' })
      fieldList.push({ type: 'int', value: 'totalPoints', text: '总分', dictCode: '' })
      fieldList.push({ type: 'int', value: 'ranking', text: '排名', dictCode: '' })
      this.superFieldList = fieldList
    },
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>