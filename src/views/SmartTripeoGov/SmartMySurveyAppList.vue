<!--开始考试-->
<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="调查问卷名称">
              <j-input placeholder="请输入调查问卷名称" v-model="queryParam.examName"></j-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <!--<a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>-->
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- table区域-begin -->
    <div>
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
          <a @click="handleExam(record)" :class="isDisabled(record)" >开始调查</a>


        </span>

      </a-table>
    </div>

    <smart-exam-information-modal ref="modalForm" @ok="modalFormOk"></smart-exam-information-modal>
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import SmartSurveyInformationModal from './modules/SmartSurveyInformationModal'
export default {
  name: 'SmartMySurveyAppList',
  mixins:[JeecgListMixin, mixinDevice],
  components: {
    SmartSurveyInformationModal
  },
  data () {
    return {
      queryParam:{},
      description: '考试信息表管理页面',
      // 表头
      columns: [

        {
          title:'调查问卷名称',
          align:"center",
          dataIndex: 'examName',
          width:50,
        },
             /*{
                    title:'调查问卷开始时间',
                    align:"center",
                    dataIndex: 'examStarttime'
                  },
                  {
                    title:'调查问卷结束时间',
                    align:"center",
                    dataIndex: 'examEndtime'
                  },*/
        {
          title:'成绩',
          align:"center",
          dataIndex: 'examGrade',
          width:60,
        },
        {
          title: '操作',
          dataIndex: 'action',
          align:"center",
          fixed:"right",
          width:80,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: "/SmartPaper/smartMyExam/myList",
        delete: "/SmartPaper/smartMyExam/delete",
        deleteBatch: "/SmartPaper/smartMyExam/deleteBatch",
        exportXlsUrl: "/SmartPaper/smartMyExam/exportXls",
        importExcelUrl: "SmartPaper/smartMyExam/importExcel",
      },
      dictOptions:{},
      superFieldList:[],
    }
  },
  created() {
    this.getSuperFieldList();
  },
  computed: {
    importExcelUrl: function(){
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
  },
  methods: {
    isDisabled(record){
      //判断考试是否已经结束
      let nowDate = new Date().getTime();
      let startTime = record.examStarttime;
      let deadline = record.examEndtime;
      console.log('deadline',deadline);
      let startDate = new Date(
        Date.parse(startTime.replace(/-/g, "/"))
      ).getTime();
      let deadlineDate = new Date(
        Date.parse(deadline.replace(/-/g, "/"))
      ).getTime();
      if (nowDate < deadlineDate && startDate < nowDate) {
        //激活开始考试
        console.log('激活开始调查');
      } else {
        return "disabled";
      }
    },
    handleExam(record){
      console.log(record);
      let examId = record.id
      let examName = record.examName
      let paperId = record.paperId
      let start = record.examStarttime
      let deadline = record.examEndtime
      const { href } = this.$router.resolve({
        name: "mySurveyAdaptive",
        query: { examId,examName,paperId,start,deadline}
      });
      window.location.href = href;
    },
    initDictConfig(){
    },
    getSuperFieldList(){
      let fieldList=[];
      fieldList.push({type:'string',value:'examName',text:'调查问卷名称',dictCode:''})
      fieldList.push({type:'datetime',value:'examStarttime',text:'调查问卷开始时间'})
      fieldList.push({type:'datetime',value:'examEndtime',text:'调查问卷结束时间'})
      //fieldList.push({type:'int',value:'examGrade',text:'成绩'})
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>

.disabled {
  pointer-events: none;
  filter: alpha(opacity=50); /*IE滤镜，透明度50%*/
  -moz-opacity: 0.5; /*Firefox私有，透明度50%*/
  opacity: 0.5; /*其他，透明度50%*/
}
</style>