<template>
  <div>
    <a-modal v-model="isShowModal" title="请选择参与评分的角色" :maskClosable="false" :closable="false">
      <template slot="footer">
        <a-button key="submit" type="primary" @click="handleRoleOk">
          确 定
        </a-button>
      </template>
      <a-form layout="inline">
        <a-form-item label="评分角色">
          <a-select v-model="scoreRole" style="width: 200px">
            <a-select-option value="team">
              考核组
            </a-select-option>
            <a-select-option value="depart">
              考核单位
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-card :title='description' :bordered="false">
      <a-tooltip slot="extra">
        <template slot="title">
          切换评分角色
        </template>
        <a-button type="primary" @click="isShowModal = true" ghost><a-icon type="swap" /></a-button>
      </a-tooltip>
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
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical"/>
          <a @click="publishMission(record)">发布</a>
          <a-divider type="vertical"/>
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down"/></a>
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
          <smart-score-page :main-id='selectedMainId'></smart-score-page>
        </a-row>
      </div>
    </a-card>
  </div>
</template>

<script>

import {JeecgListMixin} from '@/mixins/JeecgListMixin'
import {getAction, postAction, putAction} from '@/api/manage'
import SmartAssessmentContentList from '@views/smartAssessmentContent/SmartAssessmentContentList'
import '@/assets/less/TableExpand.less'
import SmartScorePage from '@views/smartAssessmentScore/modules/SmartScorePage'
import SmartScoreInfoModal from '@views/smartAssessmentScore/modules/SmartScoreInfoModal'
import Vue from "vue";

export default {
  name: "SmartScoreList",
  mixins: [JeecgListMixin],
  components: {
    SmartScoreInfoModal,
    SmartScorePage,
    SmartAssessmentContentList,
  },
  data() {
    return {
      description: '考核任务列表',
      disableMixinCreated: true,
      isShowModal: false,
      scoreRole: 'team',
      // 评分角色信息
      scoreRoleId: '',
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
        }
      ],
      url: {
        list: "/smartAssessmentMission/smartAssessmentMission/teamMissionList",
        departmentMissionList: "/smartAssessmentMission/smartAssessmentMission/departmentMissionList",
        teamMissionList: "/smartAssessmentMission/smartAssessmentMission/teamMissionList",
        delete: "/smartAssessmentMission/smartAssessmentMission/delete",
        publish: "/smartAssessmentMission/smartAssessmentMission/publish",
        deleteBatch: "/smartAssessmentMission/smartAssessmentMission/deleteBatch",
        exportXlsUrl: "/smartAssessmentMission/smartAssessmentMission/exportXls",
        importExcelUrl: "smartAssessmentMission/smartAssessmentMission/importExcel",
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
  mounted() {
    if (Vue.ls.get('assessInfo')) {
      let assessInfo = Vue.ls.get('assessInfo');
      if (assessInfo.type === "depart") {
        this.url.list = this.url.departmentMissionList;
      } else {
        this.url.list = this.url.teamMissionList;
      }
      this.scoreRole = assessInfo.type;
      this.scoreRoleId = assessInfo.id;
      this.loadData(1);
    } else {
      this.isShowModal = true
    }
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    }
  },
  methods: {
    handleRoleOk() {
      if (this.scoreRole === "depart") {
        this.loadMyDepartment();
        this.url.list = this.url.departmentMissionList;
      } else {
        this.loadMyTeamInfo();
        this.url.list = this.url.teamMissionList;
      }
      // this.loadData(1)
      this.isShowModal = false;
    },
    // 查询考核组信息
    loadMyTeamInfo() {
      let that = this
      getAction('/smartAssessmentTeam/smartAssessmentTeam/listMyTeam').then((res) => {
        if (res.success && res.result.length > 0) {
          console.log(res)
          // 前端存储查询到的考核组信息
          let assessInfo = res.result[0]
          assessInfo.type = 'team'
          Vue.ls.set("assessInfo", assessInfo)
          // 然后加载考核任务
          this.scoreRoleId = res.result[0].id
          this.loadData(1)
        } else {
          this.$message.warning(res.message)
          this.isShowModal = true;
        }
        this.loading = false;
      })
    },
    // 查询考核单位信息
    loadMyDepartment() {
      let that = this
      getAction('/smartAssessmentDepartment/smartAssessmentDepartment/listMyDepartment').then((res) => {
        if (res.success && res.result.length > 0) {
          console.log(res)
          // 前端存储查询到的考核单位信息
          let assessInfo = res.result[0]
          assessInfo.type = 'depart'
          Vue.ls.set("assessInfo", assessInfo)
          this.scoreRoleId = res.result[0].id
          this.loadData(1)
        } else {
          this.$message.warning(res.message)
          this.isShowModal = true;
        }
        this.loading = false;
      })
    },
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
      params.scoreRoleId = this.scoreRoleId
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