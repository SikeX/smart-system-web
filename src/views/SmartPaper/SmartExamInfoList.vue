<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
<!--            <a-form-item label="考试名称">
              <j-input placeholder="请输入考试名称" v-model="queryParam.examName"></j-input>
            </a-form-item>-->
            <a-form-item label="考试名称">
              <j-search-select-tag
                placeholder="请选择考试"
                v-model="queryParam.id"
                dict="smart_exam_information,exam_name,id,paper_type = '1'"
                :async="true">
              </j-search-select-tag>
            </a-form-item>

          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
             <!-- <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>-->
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
<!--    <div class="table-operator">
      &lt;!&ndash;<a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>&ndash;&gt;
      <a-button type="primary" icon="download" @click="handleExportXls('考试信息表')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      &lt;!&ndash; 高级查询区域 &ndash;&gt;
      &lt;!&ndash;<j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>&ndash;&gt;
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>-->

    <!-- table区域-begin -->
    <div>
<!--      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">-->
<!--        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项-->
<!--        <a style="margin-left: 24px" @click="onClearSelected">清空</a>-->
<!--      </div>-->

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
          <a-popconfirm title="确定取消吗?" @confirm="() => handleDeleteExam(record)">
                  <a :class="isDisabled(record)">取消发布</a>
          </a-popconfirm>
          <a-divider type="vertical" />
          <a @click="handleEdit(record)" :class="isDisabled(record)">修改考试时间</a>

          <a-divider type="vertical" />
          <a @click="showScore(record)">查看成绩</a>
         <!-- <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>-->
        </span>

      </a-table>
    </div>

    <smart-exam-information-modal ref="modalForm" @ok="modalFormOk"></smart-exam-information-modal>
    <task-detail-modal ref="scoreModal" @ok="modalFormOk"></task-detail-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SmartExamInformationModal from './modules/SmartExamInformationModal'
  import { httpAction,putAction, postAction,getAction } from '@/api/manage'
  import TaskDetailModal from './modules/TaskDetailModal'

  export default {
    name: 'SmartExamInfoList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      SmartExamInformationModal,TaskDetailModal
    },
    data () {
      return {
        queryParam:{
          id:'',
          paperType:'1'
        },
        description: '考试信息表管理页面',
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
            title:'考试名称',
            align:"center",
            dataIndex: 'examName'
          },
          {
            title:'考试开始时间',
            align:"center",
            dataIndex: 'examStarttime'
          },
          {
            title:'考试结束时间',
            align:"center",
            dataIndex: 'examEndtime'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            fixed:"right",
            width:147,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/SmartPaper/smartMyExam/list",
          delete: "/SmartPaper/smartMyExam/delete",
          deleteBatch: "/SmartPaper/smartMyExam/deleteBatch",
          exportXlsUrl: "/SmartPaper/smartMyExam/exportXls",
          importExcelUrl: "SmartPaper/smartMyExam/importExcel",

        },
        dictOptions:{},
        superFieldList:[],
        loading:false
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
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'examName',text:'考试名称',dictCode:''})
        fieldList.push({type:'datetime',value:'examStarttime',text:'考试开始时间'})
        fieldList.push({type:'datetime',value:'examEndtime',text:'考试结束时间'})
        fieldList.push({type:'string',value:'paperType',text:''})
        this.superFieldList = fieldList
      },
      isDisabled(record){
        //判断考试是否开始
        let nowDate = new Date().getTime();
        let startTime = record.examStarttime;
        let startDate = new Date(
          Date.parse(startTime.replace(/-/g, "/"))
        ).getTime();
        if (startDate > nowDate) {
          //激活开始考试
          console.log('激活取消考试，编辑');
        } else {
          return "disabled";
        }
      },
      showScore(record) {
        console.log(record)
        this.$refs.scoreModal.edit(record.paperId,record.examName)
      },
      handleDeleteExam(record){
        console.log(record)
        let id = record.id
        let paperId = record.paperId
        let url ="/SmartPaper/smartMyExam/deleteRelease";
        let params = {
          id:id,
          paperId:paperId
        }
        postAction(url,params).then((res)=>{
          if(res.success){
            this.$elmessage({
              type:"success",
              message: "取消发布成功！",
              duration:1000
            })
            //刷新表格
            this.searchReset();
          }else {
            this.$elmessage({
              type:"error",
              message: "取消发布失败！",
              duration:1000,
            })
          }
        })

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