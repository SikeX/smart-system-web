<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
<!--            <a-form-item label="试卷名称">
              <j-input placeholder="请输入试卷名称" v-model="queryParam.paperName"></j-input>
            </a-form-item>-->
            <a-form-item label="试卷名称">
              <j-search-select-tag
                placeholder="请选择试卷名称"
                v-model="queryParam.id"
                dict="smart_paper,paper_name,id,paper_type = '1'"
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
    <div class="table-operator">
      <!--<a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>-->
      <a-button @click="createTestPaper"  type="primary" icon="plus">新增</a-button>

      <!-- 高级查询区域 -->

<!--      <a-dropdown v-if="selectedRowKeys.length > 0">-->
<!--        <a-menu slot="overlay">-->
<!--          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>-->
<!--        </a-menu>-->
<!--        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>-->
<!--      </a-dropdown>-->
    </div>

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
          <!--<a @click="handleEdit(record)">编辑</a>-->
          <a @click="handleIssueExam(record)" :class="isDisabled(record)" >发布考试</a>
          <a-divider type="vertical" />
          <a @click="editTestPaper(record.id)"  :class="isDisabled(record)">修改试卷</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <!--<a @click="handleDetail(record)">详情</a>-->
                <a @click="detailPage(record.id)">查看试卷</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)" v-show="record.paperStatus == '0'">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <smart-paper-modal ref="modalForm" @ok="modalFormOk"></smart-paper-modal>
    <!-- 发布考试弹框 -->
    <ReleaseTest ref="releaseTestDialog" @ok="modalFormOk"/>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SmartPaperModal from './modules/SmartPaperModal'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import { httpAction,putAction, postAction,getAction } from '@/api/manage'
  import ReleaseTest from './modules/ReleaseTest'

  export default {
    name: 'SmartPaperList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      SmartPaperModal,ReleaseTest
    },
    data () {
      return {
        queryParam:{
          id:'',
          paperType:'1'
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
/*         {
            title:'试卷类型',
            align:"center",
            dataIndex: 'paperType_dictText'
          },*/
          {
            title:'试卷名称',
            align:"center",
            dataIndex: 'paperName',
            sorter: true
          },
          {
            title:'试卷状态',
            align:"center",
            dataIndex: 'paperStatus_dictText',
            sorter: true
          },
          {
            title:'命卷人',
            align:"center",
            dataIndex: 'creatorName',
            sorter: true
          },
          {
            title:'命卷日期',
            align:"center",
            dataIndex: 'createTime',
            sorter: true

          },
          {
            title:'题目数量',
            align:"center",
            dataIndex: 'topicNum',
            sorter: true
          },
          {
            title:'总分',
            align:"center",
            dataIndex: 'totalScore',
            sorter: true
          },
          {
            title:'及格线',
            align:"center",
            dataIndex: 'passMark',
            sorter: true
          },
          {
            title:'答题时间',
            align:"center",
            dataIndex: 'time',
            sorter: true
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
      isDisabled(record){
        if ( record.paperStatus === "0") {
          //激活开始考试
          //console.log('激活发布');
        } else if ( record.paperStatus === "2"){
          //console.log('No发布');
          return "disabled";
        }
      },
      //去创建新试卷
      createTestPaper() {
        const { href } = this.$router.resolve({
          name: "createPaper",
          params: { opt: 'add'}
        });
        const win  = window.open(href, "_blank");
        const loop = setInterval(item => {
          if (win.closed) {
            clearInterval(loop);
            this.refresh();
          }
        }, 1000);
      },
      // 编辑试卷
      editTestPaper(id) {
        console.log(id);
        const { href } = this.$router.resolve({
          name: "editPaper",
          params: { opt: 'edit', id}
        });
        const win = window.open(href, "_blank");
        const loop = setInterval(item => {
          if (win.closed) {
            clearInterval(loop);
            this.$ref.table.reload();
          }
        }, 1000);
      },
      detailPage(id){
        console.log(id);
        const { href } = this.$router.resolve({
          name: "editPaper",
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
      //试卷发布
      handleIssueExam(record){
        console.log(record)
        let paperId = record.id
        this.$refs.releaseTestDialog.releaseTest(paperId)
      },
      initDictConfig(){
      },
      searchReset(){
        this.queryParam = { paperType:'1'}
        this.searchQuery();
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