<template>
  <div class="page-header-index-wide">
    <a-card :bordered="true" :body-style="{ padding: '0' }" :loading="cardLoading">
      <div class="salesCard">
        <a-tabs default-active-key="1" size="large" :tab-bar-style="{ marginBottom: '24px', paddingLeft: '16px' }">
          <!--查询区域-->
          <div class="extra-wrapper" slot="tabBarExtraContent">
            <a-row :gutter="24">
              <a-col span="8">
                <j-input placeholder="请输入年份" v-model="queryParam.year" width="60%" />
              </a-col>
              <a-col span="8">
                <j-select-depart
                  placeholder="请选择单位"
                  v-model="queryParam.departCode"
                  customReturnField="id"
                  width="60%"
                ></j-select-depart>
              </a-col>
              <a-button type="primary" @click="searchStatic" icon="search">查询</a-button>
              <a-button type="primary" @click="searchResetStatic" icon="reload" style="margin-left: 8px">重置</a-button>
            </a-row>
          </div>
          <!--统计展示-->
          <a-tab-pane :tab="title" key="1">
            <!--            <a-row>-->
            <!--              <a-col :xl="16" :lg="12" :md="12" :sm="24" :xs="24">-->
            <line-chart-multid :dataSource="lineData" :fields="lineField" :aliases="aliases" :height="height" />
            <!--              </a-col>-->
            <!--              <a-col :xl="8" :lg="12" :md="12" :sm="24" :xs="24">-->
            <!--                <rank-list :title="rankCountTitle" :list="rankCountData" />-->
            <!--              </a-col>-->
            <!--            </a-row>-->
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-card>
    <a-card :bordered="true" style="margin-top: 10px">
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="被谈话人单位">
                <j-select-depart
                  placeholder="请输入被谈话人单位"
                  v-model="queryParam.intervieweeDept"
                  customReturnField="id"
                ></j-select-depart>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="被谈话人姓名">
                <j-input placeholder="请输入被谈话人姓名" v-model="queryParam.intervieweeName"></j-input>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="谈话人单位">
                <j-select-depart
                  placeholder="请输入谈话人单位"
                  v-model="queryParam.talkerDept"
                  customReturnField="id"
                ></j-select-depart>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="谈话人姓名">
                <j-input placeholder="请输入谈话人姓名" v-model="queryParam.talkerName"></j-input>
              </a-form-item>
            </a-col>
            <!--              <template v-if="toggleSearchStatus"></template>-->
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
                <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
                <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
                <!--              <a @click="handleToggleSearch" style="margin-left: 8px">-->
                <!--                {{ toggleSearchStatus ? '收起' : '展开' }}-->
                <!--                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>-->
                <!--              </a>-->
              </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <!-- 查询区域-END -->

      <!-- 操作按钮区域 -->
      <div class="table-operator">
        <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
        <a-button type="primary" icon="download" @click="handleExportXls('执行第一种形态人员表')">导出</a-button>
        <!--      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
                <a-button type="primary" icon="import">导入</a-button>
              </a-upload>-->
        <!-- 高级查询区域 -->
        <!--      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>-->
        <a-dropdown v-if="selectedRowKeys.length > 0">
          <a-menu slot="overlay">
            <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
        </a-dropdown>
      </div>

      <!-- table区域-begin -->
      <div>
        <!--        <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">-->
        <!--          <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项-->
        <!--          <a style="margin-left: 24px" @click="onClearSelected">清空</a>-->
        <!--        </div>-->

        <a-table
          ref="table"
          size="middle"
          :scroll="{ x: true }"
          bordered
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="ipagination"
          :loading="loading"
          class="j-table-force-nowrap"
          @change="handleTableChange"
        >
          <template slot="htmlSlot" slot-scope="text">
            <div v-html="text"></div>
          </template>
          <template slot="imgSlot" slot-scope="text">
            <span v-if="!text" style="font-size: 12px; font-style: italic">无图片</span>
            <img
              v-else
              :src="getImgView(text)"
              height="25px"
              alt=""
              style="max-width: 80px; font-size: 12px; font-style: italic"
            />
          </template>
          <template slot="fileSlot" slot-scope="text">
            <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
            <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="downloadFile(text)">
              下载
            </a-button>
          </template>

          <span slot="action" slot-scope="text, record">
            <a-popconfirm title="确定提交吗，提交后不可再修改?" @confirm="() => submitVerify(record)">
              <a v-if="record.verifyStatus === '4'">提交审核</a>
            </a-popconfirm>
            <a-divider v-if="record.verifyStatus === '4'" type="vertical" />
            <a v-show="record.verifyStatus === '3' || record.verifyStatus === '4'" @click="handleEdit(record)">编辑</a>
            <a-divider v-show="record.verifyStatus === '3' || record.verifyStatus === '4'" type="vertical" />
            <a @click="handleDetail(record)">详情</a>
            <a-divider type="vertical" />
            <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
              <a v-show="record.verifyStatus == '3' || record.verifyStatus === '4'">删除</a>
            </a-popconfirm>
          </span>

          <span slot="verify" slot-scope="text">
            <a-tag v-if="text == '0'" color="#f14c4c">不通过</a-tag>
            <a-tag v-if="text == '1'" color="#10bc79">通过</a-tag>
            <a-tag v-if="text == '2'" color="#29b8db">待审核</a-tag>
            <a-tag v-if="text == '3'" color="green">免审</a-tag>
            <a-tag v-if="text == '4'" color="gray">待提交</a-tag>
          </span>
        </a-table>
      </div>

      <smart-first-form-people-modal ref="modalForm" @ok="modalFormOk"></smart-first-form-people-modal>
    </a-card>
  </div>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import SmartFirstFormPeopleModal from './modules/SmartFirstFormPeopleModal'
import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'
import { getAction } from '@api/manage'
import LineChartMultid from '@comp/chart/LineChartMultid'

export default {
  name: 'SmartFirstFormPeopleList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    SmartFirstFormPeopleModal,
    LineChartMultid,
  },
  data() {
    return {
      description: '执行第一种形态人员表管理页面',
      title: '',
      queryParam: { year: '', departCode: '' },
      // 表头
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '案件标题',
          align: 'center',
          dataIndex: 'caseName',
          sorter: true,
        },
        {
          title: '被谈话人单位',
          align: 'center',
          dataIndex: 'intervieweeDept_dictText',
          sorter: true,
        },
        {
          title: '被谈话人姓名',
          align: 'center',
          dataIndex: 'intervieweeName',
          sorter: true,
        },
        {
          title: '谈话人单位',
          align: 'center',
          dataIndex: 'talkerDept_dictText',
          sorter: true,
        },
        {
          title: '谈话人姓名',
          align: 'center',
          dataIndex: 'talkerName',
          sorter: true,
        },
        {
          title: '办理部门',
          align: 'center',
          dataIndex: 'handlerDepart_dictText',
          sorter: true,
        },
        {
          title: '审核状态',
          align: 'center',
          dataIndex: 'verifyStatus',
          scopedSlots: { customRender: 'verify' },
        },

        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/SmartFirstFormPeople/smartFirstFormPeople/list',
        delete: '/SmartFirstFormPeople/smartFirstFormPeople/delete',
        deleteBatch: '/SmartFirstFormPeople/smartFirstFormPeople/deleteBatch',
        exportXlsUrl: '/SmartFirstFormPeople/smartFirstFormPeople/exportXls',
        importExcelUrl: 'SmartFirstFormPeople/smartFirstFormPeople/importExcel',
        verify: '/SmartFirstFormPeople/smartFirstFormPeople/submitVerify',
      },
      dictOptions: {},
      superFieldList: [],
      //折线图
      lineData: [],
      lineField: ['count'],
      aliases: [{ field: 'count', alias: '执行第一形态人员人数' }],
      cardLoading: false,
      height: 420,
    }
  },
  created() {
    this.getTitle()
    this.loadLineData()
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    getTitle() {
      if (this.queryParam.year === '') {
        let currentYear = new Date().getFullYear()
        this.title = currentYear + '年执行第一形态人统计'
      } else {
        let len = this.queryParam.year.length
        console.log(Number(this.queryParam.year.substring(1, len - 1)))
        this.title = Number(this.queryParam.year.substring(1, len - 1)) + '年执行第一形态人统计'
      }
    },
    //加载折线图数据
    loadLineData() {
      let param = { year: this.queryParam.year, departCode: this.queryParam.departCode }
      let url = '/SmartFirstFormPeople/smartFirstFormPeople/statistics'
      getAction(url, param)
        .then((res) => {
          console.log(res)
          if (res.success) {
            let result = res.result
            let i = 1
            let monthArray = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
            //console.log(result.length,result)
            if (result.length !== 0) {
              for (i = 0; i < 12; i++) {
                if (result.length > i + 1) {
                  if (result[i].month !== monthArray[i]) {
                    //console.log(i,monthArray[i],result[i].month)
                    let item = { month: monthArray[i], count: 0 }
                    result.splice(i, 0, item)
                  } else {
                    let item = { month: monthArray[i], count: result[i].count }
                    result.push(item)
                  }
                } else {
                  let item = { month: monthArray[i], count: 0 }
                  result.splice(i, 0, item)
                }
              }
            } else {
              for (i = 0; i < 12; i++) {
                //console.log(monthArray[i])
                this.lineData = []
                let item = { month: monthArray[i], count: 0 }
                result.splice(i, 0, item)
              }
            }
            console.log(result)
            result.forEach((c) => {
              let monthData = c.month + '月'
              //console.log(this.lineData)
              this.lineData.push({ type: monthData, count: c.count })
            })
            console.log(this.lineData)
          } else {
            this.$message.warning('系统错误!')
          }
        })
        .finally((this.cardLoading = false))
    },
    //搜索
    searchStatic() {
      let curYear = Number(new Date().getFullYear())
      let l = this.queryParam.year.length
      let y = Number(this.queryParam.year.substring(1, l - 1))
      //console.log(curYear,y)
      if (y === '' || y === 'undefined') {
        this.$message.warning('请输入年份！')
      } else if (curYear < y || y < 2000) {
        this.$message.warning('请输入正确的年份！')
      } else {
        this.cardLoading = true
        this.lineData = []
        this.pieData = []
        this.getTitle()
        this.loadLineData()
        // setTimeout(() => {
        //   this.cardLoading = !this.cardLoading
        // }, 1000)
      }
    },
    searchResetStatic() {
      this.queryParam.year = ''
      this.queryParam.departCode = ''
      this.cardLoading = true
      this.lineData = []
      this.getTitle()
      this.loadLineData()
      // setTimeout(() => {
      //   this.cardLoading = !this.cardLoading
      // }, 1000)
    },
    initDictConfig() {},
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'caseName', text: '案件标题', dictCode: '' })
      fieldList.push({ type: 'string', value: 'caseSource', text: '案件（线索来源）', dictCode: '' })
      fieldList.push({ type: 'string', value: 'intervieweeId', text: '被谈话人', dictCode: '' })
      fieldList.push({
        type: 'string',
        value: 'intervieweeDept',
        text: '被谈话人单位',
        dictCode: 'sys_depart,depart_name,id',
      })
      fieldList.push({ type: 'string', value: 'intervieweeName', text: '被谈话人姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'intervieweeSex', text: '被谈话人性别', dictCode: '' })
      fieldList.push({ type: 'string', value: 'intervieweeEthnicity', text: '被谈话人民族', dictCode: 'ethnicity' })
      fieldList.push({
        type: 'string',
        value: 'intervieweePolsta',
        text: '被谈话人政治面貌',
        dictCode: 'political_status',
      })
      fieldList.push({ type: 'string', value: 'intervieweeJpt', text: '被谈话人入党时间', dictCode: '' })
      fieldList.push({
        type: 'string',
        value: 'intervieweePost',
        text: '被谈话人职务',
        dictCode: 'sys_position,name,code',
      })
      fieldList.push({ type: 'string', value: 'intervieweePostrank', text: '被谈话人职级', dictCode: 'position_rank' })
      fieldList.push({ type: 'string', value: 'principal', text: '是否党政正职', dictCode: 'yn' })
      fieldList.push({ type: 'string', value: 'country', text: '是否国家检查队形', dictCode: 'yn' })
      fieldList.push({ type: 'string', value: 'authority', text: '干部管理权限', dictCode: '' })
      fieldList.push({ type: 'string', value: 'supervision', text: '是否是纪检监察干部', dictCode: 'yn' })
      fieldList.push({ type: 'string', value: 'talkerId', text: '谈话人', dictCode: '' })
      fieldList.push({ type: 'string', value: 'talkerDept', text: '谈话人单位', dictCode: 'sys_depart,depart_name,id' })
      fieldList.push({ type: 'string', value: 'talkerName', text: '谈话人姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'talkerPost', text: '谈话人职务', dictCode: 'sys_position,name,code' })
      fieldList.push({ type: 'string', value: 'talkerPostrank', text: '谈话人职级', dictCode: 'position_rank' })
      fieldList.push({ type: 'string', value: 'caseAbs', text: '简要案情', dictCode: '' })
      fieldList.push({ type: 'sel_depart', value: 'handlerDepart', text: '办理部门' })
      fieldList.push({ type: 'string', value: 'verifyStatus', text: '审理状态' })
      fieldList.push({ type: 'string', value: 'type', text: '类型', dictCode: 'first_form_type' })
      fieldList.push({ type: 'string', value: 'situation', text: '情形', dictCode: '' })
      fieldList.push({ type: 'date', value: 'talkTime', text: '谈话时间' })
      fieldList.push({ type: 'string', value: 'measures', text: '组织措施', dictCode: '' })
      fieldList.push({
        type: 'string',
        value: 'decisionOrgan',
        text: '采取组织措施决定机关',
        dictCode: 'sys_depart,depart_name,id',
      })
      fieldList.push({ type: 'string', value: 'annex', text: '附件', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped lang="less">
@import '~@assets/less/common.less';
.extra-wrapper {
  line-height: 55px;
  padding-right: 50px;

  .extra-item {
    display: inline-block;
    margin-right: 40px;

    a {
      margin-left: 24px;
    }
  }
}
</style>