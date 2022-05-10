<template>
  <a-card :title='description' v-if='contentId' :bordered='false'>
    <a-modal v-model="isShowModal" title="请选择最终得分方式">
      <template slot="footer">
        <a-button key="back" @click="isShowModal=false">
          取消
        </a-button>
        <a-button key="submit" type="primary" @click="changeFinalScore">
          确 定
        </a-button>
      </template>
      <a-form layout="inline">
        <a-form-item label="最终得分方式">
          <a-select v-model="scoreType" style="width: 200px">
            <a-select-option value="low">
              最低分
            </a-select-option>
            <a-select-option value="high">
              最高分
            </a-select-option>
            <a-select-option value="ave">
              平均分
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="isShowModal = true" type="primary">修改最终得分方式</a-button>
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
          <a v-if="record.answerAssContentId" @click='handleDetail(record)'>详情</a>
          <a v-else @click='signMission(record)'>手动签收</a>
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
import { getAction, putAction, postAction } from '@api/manage'
import SmartAssessmentContentForm from '@views/smartAnswerInfo/modules/SmartAssessmentContentForm'
import SmartAnswerPage from '@views/smartAnswerInfo/modules/SmartAnswerPage'
import SmartScoreInfoModal from './SmartScoreInfoModal'
import Vue from "vue";

export default {
  name: 'SmartFinalScoreDepartList',
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
        if(!this.contentId){
          this.clearList()
        }else{
          this.queryParam['missionId'] = this.missionId
          this.queryParam['assContentId'] = val
          this.loadData(1);
        }
      }
    }
  },
  data() {
    return {
      description: '被考核单位列表',
      disableMixinCreated:true,
      isShowModal: false,
      scoreType: '',
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
          dataIndex: 'departName'
        },
        {
          title: '最低得分',
          align: 'center',
          dataIndex: 'lowestScore'
        },
        {
          title: '要点最高得分',
          align: 'center',
          dataIndex: 'highestScore'
        },
        {
          title: '要点平均得分',
          align: 'center',
          dataIndex: 'averageScore'
        },
        {
          title: '要点最终得分',
          align: 'center',
          dataIndex: 'finalScore'
        },
        {
          title: '考核任务总分',
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
        list: '/smartAnswerInfo/smartAnswerInfo/listDepartContentScore',
        delete: '/smartAnswerInfo/smartAnswerInfo/delete',
        sign: '/smartAnswerInfo/smartAnswerInfo/sign',
        changeFinalScore: '/smartAnswerAssContent/smartAnswerAssContent/changeFinalScore',
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
    clearList() {
      this.dataSource = []
      this.ipagination.current = 1
    },
    handleDetail:function(record){
      // console.log(record)
      this.$refs.modalForm.title="详情";
      this.$refs.modalForm.disableSubmit = true;
      this.$refs.modalForm.edit(record.answerAssContentId);
    },
    signMission(record) {
      // 签收任务，并生成答题要点记录
      this.loading = true
      putAction(this.url.sign, record).then((res) => {
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
    changeFinalScore() {
      let that = this

      this.isShowModal = false
      this.loading = true

      let params = {
        contentId: this.contentId,
        missionId: this.missionId,
        scoreType: this.scoreType
      }

      // TODO: 向后端发送修改请求
      getAction(this.url.changeFinalScore, params).then((res) => {
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