<template>
  <a-card :title='description' :bordered="false">
    <!-- table区域-begin -->
    <div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        class="j-table-force-nowrap"
        :scroll="{x:true}"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange, type:'radio'}"
        :customRow="clickThenSelect"
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
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a @click="publishMission(record)">发布</a>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <div>
      <a-row v-if='selectedMainId'>
        <smart-answer-page :main-id='selectedMainId'></smart-answer-page>
      </a-row>
    </div>

    <SmartScoreInfoModal ref='modalForm' @ok='modalFormOk'></SmartScoreInfoModal>
  </a-card>
</template>

<script>

import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction, postAction, putAction } from '@/api/manage'
import SmartAssessmentContentList from '@views/smartAssessmentContent/SmartAssessmentContentList'
import '@/assets/less/TableExpand.less'
import SmartAnswerPage from '@views/smartAssessmentScore/modules/SmartAnswerPage'
import SmartScoreInfoModal from '@views/smartAssessmentScore/modules/SmartScoreInfoModal__Style#Drawer'

export default {
  name: "SmartScoreList",
  mixins:[JeecgListMixin],
  components: {
    SmartScoreInfoModal,
    SmartAnswerPage,
    SmartAssessmentContentList,
  },
  data () {
    return {
      description: '考核任务列表',
      // 表头
      columns: [
        {
          title:'任务名称',
          align:"center",
          dataIndex: 'missionName'
        },
        {
          title:'考核年份',
          align:"center",
          dataIndex: 'assessmentYear'
        },
        {
          title:'考核时间',
          align:"center",
          dataIndex: 'assessmentTime'
        },
        {
          title:'总分',
          align:"center",
          dataIndex: 'totalPoint'
        },
        {
          title:'任务状态',
          align:"center",
          dataIndex: 'missionStatus'
        },
        {
          title:'考核要点总数',
          align:"center",
          dataIndex: 'keyPointsAmount'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align:"center",
          fixed:"right",
          width:147,
          scopedSlots: { customRender: 'action' },
        }
      ],
      url: {
        list: "/smartAssessmentMission/smartAssessmentMission/list",
        delete: "/smartAssessmentMission/smartAssessmentMission/delete",
        publish: "/smartAssessmentMission/smartAssessmentMission/publish",
        deleteBatch: "/smartAssessmentMission/smartAssessmentMission/deleteBatch",
        exportXlsUrl: "/smartAssessmentMission/smartAssessmentMission/exportXls",
        importExcelUrl: "smartAssessmentMission/smartAssessmentMission/importExcel",
      },
      dictOptions:{
      },
      /* 分页参数 */
      ipagination:{
        current: 1,
        pageSize: 5,
        pageSizeOptions: ['5', '10', '50'],
        showTotal: (total, range) => {
          return range[0] + "-" + range[1] + " 共" + total + "条"
        },
        showQuickJumper: true,
        showSizeChanger: true,
        total: 0
      },
      selectedMainId:'',
      superFieldList:[],
    }
  },
  created() {
    this.getSuperFieldList();
  },
  computed: {
    importExcelUrl: function(){
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    }
  },
  methods: {
    initDictConfig(){
    },
    clickThenSelect(record) {
      return {
        on: {
          click: () => {
            this.onSelectChange(record.id.split(","), [record]);
          }
        }
      }
    },
    onClearSelected() {
      this.selectedRowKeys = [];
      this.selectionRows = [];
      this.selectedMainId=''
    },
    onSelectChange(selectedRowKeys, selectionRows) {
      this.selectedMainId=selectedRowKeys[0]
      this.selectedRowKeys = selectedRowKeys;
      this.selectionRows = selectionRows;
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
      this.onClearSelected()
      var params = this.getQueryParams();//查询条件
      this.loading = true;
      getAction(this.url.list, params).then((res) => {
        if (res.success) {
          this.dataSource = res.result.records;
          this.ipagination.total = res.result.total;
        }
        if(res.code===510){
          this.$message.warning(res.message)
        }
        this.loading = false;
      })
    },
    getSuperFieldList(){
      let fieldList=[];
      fieldList.push({type:'string',value:'missionName',text:'任务名称',dictCode:''})
      fieldList.push({type:'string',value:'assessmentYear',text:'考核年份',dictCode:''})
      fieldList.push({type:'datetime',value:'assessmentTime',text:'考核时间'})
      fieldList.push({type:'int',value:'totalPoint',text:'总分',dictCode:''})
      fieldList.push({type:'string',value:'missionStatus',text:'任务状态',dictCode:''})
      fieldList.push({type:'int',value:'keyPointsAmount',text:'考核要点总数',dictCode:''})
      this.superFieldList = fieldList
    },
    publishMission(record) {
      putAction(this.url.publish, record).then((res) => {
        if (res.success) {
          this.loadData(1)
        }
      })
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less'
</style>