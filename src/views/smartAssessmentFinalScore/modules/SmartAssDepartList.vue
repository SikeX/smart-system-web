<template>
  <a-card v-if='contentId' :bordered='false'>
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row>
          <a-form-item label="评分角色类型">
            <a-radio-group v-model:value="roleType">
              <a-radio value="team">考核组</a-radio>
              <a-radio value="depart">考核单位</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-row>
        <a-row :gutter='24'>
          <a-col v-show='roleType == "team"' :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="考核组">
              <j-search-select-tag
                ref='team'
                placeholder="请选择考核组,可输入过滤"
                v-model="queryParam.roleId"
                :dictOptions="teamOptions">
              </j-search-select-tag>
            </a-form-item>
          </a-col>
          <a-col v-show='roleType == "depart"' :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="考核单位">
              <j-search-select-tag
                ref='depart'
                placeholder="请选择考核单位,可输入过滤"
                v-model="queryParam.roleId"
                :dictOptions="departOptions">
              </j-search-select-tag>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="评分状态">
              <a-select
                placeholder="全部"
                v-model:value="queryParam.markedContent">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="0">未评分</a-select-option>
                <a-select-option value="1">已评分</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
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
          <a @click="handleDetail(record)">详情</a>
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
import SmartScoreInfoModal from './SmartScoreInfoModal'
import Vue from "vue";

export default {
  name: 'SmartAssDepartList',
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
    },
    disabled: {
      type: Boolean,
      required: false,
      default: true
    },
  },
  watch:{
    contentId:{
      immediate: true,
      handler(val) {
        this.clearList();
        if (val && this.missionId) {
          this.loadDict(val)
        }
      }
    },
    roleType: {
      immediate: true,
      handler(val) {
        this.queryParam.roleId = null
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
          title: '截止时间',
          align: 'center',
          dataIndex: 'endTime'
        },
        {
          title: '评分状态',
          align: 'center',
          dataIndex: 'markedContent',
        },
        {
          title: '评分',
          align: 'center',
          dataIndex: 'totalPoints',
        },
        // {
        //   title: '操作',
        //   dataIndex: 'action',
        //   align: 'center',
        //   fixed: 'right',
        //   width: 147,
        //   scopedSlots: { customRender: 'action' }
        // }
      ],
      url: {
        list: '/smartAnswerInfo/smartAnswerInfo/listInCharge2',
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

      departOptions: [],
      teamOptions: [],
      roleType: 'team',
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
    loadDict(contentId) {
      this.departOptions = []
      this.teamOptions = []

      if (this.$refs.team) {
        this.$refs.team.setCurrentDictOptions(this.teamOptions)
      }
      if (this.$refs.depart) {
        this.$refs.depart.setCurrentDictOptions(this.departOptions)
      }

      // this.$refs.team.setCurrentDictOptions(this.teamOptions)
      // this.$refs.depart.setCurrentDictOptions(this.departOptions)

      getAction('/smartAssessmentContent/smartAssessmentContent/departmentDictByContentId', {contentId}).then(res => {
        if (res.success) {
          for (let i = 0; i < res.result.records.length; i++) {
            this.departOptions.push({
              value: res.result.records[i].id,
              text: res.result.records[i].departId_dictText
            })
          }
        } else {
          this.departOptions = []
          this.$message.warning(res.message)
        }

      }).finally(res => {
        this.loading = false
      })

      getAction('/smartAssessmentContent/smartAssessmentContent/teamDictByContentId', {contentId}).then(res => {
        if (res.success) {
          for (let i = 0; i < res.result.length; i++) {
            this.teamOptions.push({
              value: res.result[i].id,
              text: res.result[i].teamName
            })
          }
        } else {
          this.teamOptions = []
          this.$message.warning(res.message)
        }

      }).finally(res => {
        this.loading = false
      })
    },
    disableSubmit(endTime) {
      let dateDiff = new Date(endTime).getTime() - new Date().getTime()
      return dateDiff > 0;
    },
    handleDetail:function(record){
      // console.log(record)
      this.$refs.modalForm.title="详情";
      this.$refs.modalForm.disableSubmit = true;
      this.$refs.modalForm.edit(record.id);
    },
    clearList() {
      this.queryParam = {}
      this.teamRoleId = null
      this.departRoleId = null
      this.dataSource = [];
    },
    searchReset() {
      this.clearList()
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
      // if (this.roleType == 'team') {
      //   this.queryParam.roleId = this.teamRoleId
      // } else {
      //   this.queryParam.roleId = this.departRoleId
      // }
      var params = this.getQueryParams();//查询条件
      params['missionId'] = this.missionId;
      params['contentId'] = this.contentId;
      params['type'] = this.roleType;
      if (this.queryParam.roleId == null || this.queryParam.roleId == '') {
        this.$message.warning('请选择具体考核组或者考核单位!')
        return
      }
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
    initDictConfig() {
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