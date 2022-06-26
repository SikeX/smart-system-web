<template>
  <a-card :title='description' :bordered="false">
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row :gutter='24'>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="任务名称">
              <a-input placeholder="请输入任务名称" v-model="queryParam.missionName"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="考核年份">
              <a-input placeholder="请输入考核年份" v-model="queryParam.assessmentYear"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
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
          <img v-else :src="getImgView(text)" height="25px" alt=""
               style="max-width:80px;font-size: 12px;font-style: italic;"/>
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
          <a-popconfirm title="确定发布评分结果吗?" @confirm="() => publishScoreResult(record)">
            <a @click="">发布评分结果</a>
          </a-popconfirm>
        </span>

      </a-table>
    </div>

    <a-tabs v-if='selectedMainId' defaultActiveKey='1'>
      <a-tab-pane tab='上传内容' key='1'>
        <smart-final-score-page :main-id='selectedMainId'></smart-final-score-page>
      </a-tab-pane>
      <a-tab-pane tab='总分排名' key='2'>
        <DepartRankList :main-id='selectedMainId'></DepartRankList>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script>

import {JeecgListMixin} from '@/mixins/JeecgListMixin'
import {getAction, postAction, putAction} from '@/api/manage'
import SmartAssessmentContentList from '@views/smartAssessmentContent/SmartAssessmentContentList'
import '@/assets/less/TableExpand.less'
import SmartFinalScorePage from './modules/SmartFinalScorePage'
import SmartScoreInfoModal from './modules/SmartScoreInfoModal'
import Vue from "vue";
import DepartRankList from '@views/smartAssessmentFinalScore/modules/DepartRankList'

export default {
  name: "SmartFinalScoreList",
  mixins: [JeecgListMixin],
  components: {
    DepartRankList,
    SmartScoreInfoModal,
    SmartFinalScorePage,
    SmartAssessmentContentList,
  },
  data() {
    return {
      description: '最终评分考核任务列表',
      // disableMixinCreated: true,
      // 表头
      columns: [
        {
          title: '任务名称',
          align: "center",
          dataIndex: 'missionName'
        },
        {
          title: '考核年份',
          align: "center",
          dataIndex: 'assessmentYear'
        },
        {
          title: '考核时间',
          align: "center",
          dataIndex: 'assessmentTime'
        },
        {
          title: '总分',
          align: "center",
          dataIndex: 'totalPoint'
        },
        {
          title: '任务状态',
          align: "center",
          dataIndex: 'missionStatus'
        },
        {
          title: '考核要点总数',
          align: "center",
          dataIndex: 'keyPointsAmount'
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
        list: "/smartAssessmentMission/smartAssessmentMission/finalScoreList",
        publish: "/smartAssessmentMission/smartAssessmentMission/publishScore",
      },
      dictOptions: {},
      /* 分页参数 */
      ipagination: {
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
      selectedMainId: '',
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList();
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    }
  },
  methods: {
    initDictConfig() {
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
      this.selectedMainId = ''
    },
    onSelectChange(selectedRowKeys, selectionRows) {
      this.selectedMainId = selectedRowKeys[0]
      this.selectedRowKeys = selectedRowKeys;
      this.selectionRows = selectionRows;
    },
    loadData(arg) {
      if (!this.url.list) {
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
        if (res.code === 510) {
          this.$message.warning(res.message)
        }
        this.loading = false;
      })
    },
    getSuperFieldList() {
      let fieldList = [];
      fieldList.push({type: 'string', value: 'missionName', text: '任务名称', dictCode: ''})
      fieldList.push({type: 'string', value: 'assessmentYear', text: '考核年份', dictCode: ''})
      fieldList.push({type: 'datetime', value: 'assessmentTime', text: '考核时间'})
      fieldList.push({type: 'int', value: 'totalPoint', text: '总分', dictCode: ''})
      fieldList.push({type: 'string', value: 'missionStatus', text: '任务状态', dictCode: ''})
      fieldList.push({type: 'int', value: 'keyPointsAmount', text: '考核要点总数', dictCode: ''})
      this.superFieldList = fieldList
    },
    publishScoreResult(record) {
      this.loading = true
      putAction(this.url.publish, record).then((res) => {
        if (res.success) {
          this.loadData(1)
          this.$message.success(res.message)
        } else {
          this.$message.warning(res.message)
        }
      }).finally(()=> {
        this.loading = false;
      })
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less'
</style>