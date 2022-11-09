<template>
  <a-card :bordered="false">
<!--    普通调查问卷-->
    <div>
<!--      <span class="ant-card-head"> <a-icon type="line"/> 普通调查问卷 <a-icon type="line" /></span>-->
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <!--            <a-form-model-item label="调查问卷名称" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="paperName">
                            <j-input placeholder="请输入调查问卷名称" v-model="queryParam.paperName"></j-input>
                          </a-form-model-item>-->
              <a-form-item label="调查问卷名称">
                <j-search-select-tag
                  placeholder="请选择调查问卷名称"
                  v-model="queryParam.id"
                  dict="smart_paper,paper_name,id,paper_type = '2' and paper_status='2'"
                  :async="true">
                </j-search-select-tag>
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

      <!-- 操作按钮区域 -->
<!--      <div class="table-operator">-->
<!--        <a-button @click="createTestPaper"  type="primary" icon="plus">创建调查问卷</a-button>-->
<!--      </div>-->

      <!-- table区域-begin -->
      <div>
        <!--      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
                <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
                <a style="margin-left: 24px" @click="onClearSelected">清空</a>
              </div>-->

        <a-table
          ref="table"
          size="middle"
          :scroll="{x:true}"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"

          class="j-table-force-nowrap"
          @change="handleTableChange">

          <template slot="htmlSlot" slot-scope="text">
            <div v-html="text"></div>
          </template>
          <template slot="imgSlot" slot-scope="text">
            <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
            <img v-else :src="getImgView(text)" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
          </template>
          <template slot="fileSlot" slot-scope="text">
            <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
            <a-button
              v-else
              :ghost="true"
              type="primary"
              icon="download"
              size="small"
              @click="downloadFile(text)">
              下载
            </a-button>
          </template>

          <span slot="action" slot-scope="text, record">
            <a @click="showScore(record)">查看选择详情</a>
            <a-divider type="vertical" />
            <a @click="showAllSurvey(record)">查看参与人问卷详情</a>
        </span>
        </a-table>
      </div>
    </div>

    <smart-paper-modal ref="modalForm" @ok="modalFormOk"></smart-paper-modal>
    <task-detail-modal ref="scoreModal" @ok="modalFormOk"></task-detail-modal>
    <survey-detail-model ref="surveyDetailModel" @ok="modalFormOk"/>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SmartPaperModal from './modules/SmartPaperModal'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import { httpAction,putAction, postAction,getAction } from '@/api/manage'
  import TaskDetailModal from './modules/TaskDetailModal.vue'
  import SurveyDetailModel from '@views/SmartSurvey/modules/SurveyDetailModel'

  export default {
    name: 'SmartSurveyStatisticsList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      SurveyDetailModel,
      SmartPaperModal,
      TaskDetailModal
    },
    data () {
      return {
        queryParam:{
          id:'',
          paperType:'2',
          paperStatus:'2'//已发布
        },
        description: '试卷表管理页面',
        // 表头
        columns: [
          {
            title: '序号',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
         /*{
            title:'试卷类型',
            align:"center",
            dataIndex: 'paperType_dictText'
          },*/
          {
            title:'问卷名称',
            align:"center",
            dataIndex: 'paperName',
            sorter: true
          },
          // {
          //   title:'试卷状态',
          //   align:"center",
          //   dataIndex: 'paperStatus_dictText',
          //   sorter: true
          // },
           {
            title:'命卷人',
            align:"center",
            dataIndex: 'creatorName',
            sorter: true
          },
          // {
          //   title:'命卷日期',
          //   align:"center",
          //   dataIndex: 'createTime',
          //   sorter: true
          // },
          {
            title:'问卷开始时间',
            align:"center",
            dataIndex: 'examStarttime',
            sorter: true
          },
          {
            title:'问卷截止时间',
            align:"center",
            dataIndex: 'examEndtime',
            sorter: true
          },
          // {
          //   title:'题目数量',
          //   align:"center",
          //   dataIndex: 'topicNum',
          //   sorter: true
          // },
          // {
          //   title:'总分',
          //   align:"center",
          //   dataIndex: 'totalScore',
          //   sorter: true
          // },
          // /*{
          //   title:'及格线',
          //   align:"center",
          //   dataIndex: 'passMark'
          // },*/
          // {
          //   title:'答题时间',
          //   align:"center",
          //   dataIndex: 'time',
          //   sorter: true
          // },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            width:100,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/SmartPaper/smartPaper/list",
          delete: "/SmartPaper/smartPaper/delete",
          deleteBatch: "/SmartPaper/smartPaper/deleteBatch",
          exportXlsUrl: "/SmartPaper/smartPaper/exportXls",
          importExcelUrl: "SmartPaper/smartPaper/importExcel",
        },
        dictOptions:{},
        superFieldList:[],
      }
    },
    created() {
    this.getSuperFieldList();
    },
    computed: {
      flag(){
        console.log(this.$route.query.flag);
        if(this.$route.query.flag){
          this.getSuperFieldList()
        }
      },
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
    },
    methods: {
      searchReset(){
        this.queryParam = { paperType:'2'}
        this.searchQuery();
      },
      showScore(record) {
        this.$refs.scoreModal.edit(record.id,record.paperName)
      },
      showAllSurvey(record){
        this.$refs.surveyDetailModel.edit(record.id,record.paperName)
      },
      detailPage(id){
        console.log(id);
        const { href } = this.$router.resolve({
          name: "editSurvey",
          params: { opt: 'detail', id}
        });
        const win = window.open(href, "_blank");
        const loop = setInterval(item => {
          if (win.closed) {
            clearInterval(loop);
            this.$ref.table.reload();
          }
        }, 1000);
  },
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'paperType',text:'试卷类型',dictCode:'paper_type'})
        fieldList.push({type:'string',value:'paperName',text:'试卷名称',dictCode:''})
        fieldList.push({type:'string',value:'paperStatus',text:'试卷状态',dictCode:'paper_status'})
        fieldList.push({type:'string',value:'creatorName',text:'命卷人',dictCode:''})
        fieldList.push({type:'datetime',value:'createTime',text:'命卷日期'})
        fieldList.push({type:'string',value:'topicNum',text:'题目数量',dictCode:''})
        fieldList.push({type:'string',value:'totalScore',text:'总分',dictCode:''})
        fieldList.push({type:'string',value:'passMark',text:'及格线',dictCode:''})
        fieldList.push({type:'int',value:'time',text:'答题时间',dictCode:''})
        this.superFieldList = fieldList
      }
    },
  }
</script>
<style scoped>
@import '~@assets/less/common.less';
.disabled {
  pointer-events: none;
  filter: alpha(opacity=50); /*IE滤镜，透明度50%*/
  -moz-opacity: 0.5; /*Firefox私有，透明度50%*/
  opacity: 0.5; /*其他，透明度50%*/
}
</style>