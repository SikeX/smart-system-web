<template>
  <a-card :bordered="false" :class="'cust-erp-sub-tab'">
    <!-- 查询区域 -->
    <div v-if="mainId"  class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row :gutter='24'>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='单位'>
              <j-select-depart placeholder='全部' v-model='queryParam.assessmentDepart' customReturnField='id' :multi='true'
                               :treeOpera='true'></j-select-depart>
            </a-form-item>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='是否查看评分详情'>
              <a-select
                placeholder="全部"
                v-model:value="queryParam.isShowScore">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="1">是</a-select-option>
                <a-select-option value="0">否</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='签收状态'>
              <a-select
                placeholder="全部"
                v-model:value="queryParam.signStatus">
                <a-select-option value="">全部</a-select-option>
                <a-select-option value="0">未签收</a-select-option>
                <a-select-option value="1">已签收</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <span style='float: left;overflow: hidden;' class='table-page-search-submitButtons'>
              <a-button type='primary' @click='searchQuery' icon='search'>查询</a-button>
              <a-button type='primary' @click='searchReset' icon='reload' style='margin-left: 8px'>重置</a-button>
              <a @click='handleToggleSearch' style='margin-left: 8px'>
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div v-if="mainId" class="table-operator">
      <a-button v-if="mainInfo.missionStatus === isShowText" @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('考核任务被考核单位')">导出</a-button>
      <a-upload
        v-if="mainInfo.missionStatus === isShowText"
        name="file"
        :showUploadList="false"
        accept='.xls,.xlsx'
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel">
          <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <!-- 高级查询区域 -->
<!--      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>-->
      <a-dropdown v-if="mainInfo.missionStatus === isShowText && selectedRowKeys.length > 0" >
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div v-if='mainId' class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :scroll="{x:true}"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
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
          <a-divider v-if='mainId && mainInfo.missionStatus === isShowText' type="vertical" />
          <a-popconfirm v-if='mainId && mainInfo.missionStatus === isShowText' title="确定删除吗?" @confirm="() => handleDelete(record.id)">
            <a>删除</a>
          </a-popconfirm>
        </span>

      </a-table>
    </div>

    <smartAssessmentDepart-modal ref="modalForm" @ok="modalFormOk" :mainId="mainId"></smartAssessmentDepart-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SmartAssessmentDepartModal from './modules/SmartAssessmentDepartModal'

  export default {
    name: "SmartAssessmentDepartList",
    mixins:[JeecgListMixin],
    components: { SmartAssessmentDepartModal },
    props:{
      mainId:{
        type:String,
        default:'',
        required:false
      },
      mainInfo:{
        type:Object,
        default:Object,
        required:false
      }
    },
    watch:{
      mainId:{
        immediate: true,
        handler(val) {
          if(!this.mainId){
            this.clearList()
          }else{
            this.queryParam['missionId'] = val
            this.loadData(1);
          }
        }
      }
    },
    data () {
      return {
        description: '考核任务表管理页面',
        disableMixinCreated:true,
        isShowText: '未发布',
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
            title:'被考核单位',
            align:"center",
            dataIndex: 'assessmentDepart_dictText',
          },
          {
            title:'截止时间',
            align:"center",
            dataIndex: 'deadline'
          },
          {
            title:'是否查看评分详情',
            align:"center",
            dataIndex: 'isShowScore',
            customRender:function (t,r,index) {
              return t == 1 ? '是':'否'
            }
          },
          {
            title:'签收状态',
            align:"center",
            dataIndex: 'signStatus'
          },
          {
            title:'签收时间',
            align:"center",
            dataIndex: 'signTime'
          },
          {
            title:'签收人',
            align:"center",
            dataIndex: 'signUser_dictText'
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
          list: "/smartAssessmentMission/smartAssessmentMission/listSmartAssessmentDepartByMainId",
          delete: "/smartAssessmentMission/smartAssessmentMission/deleteSmartAssessmentDepart",
          deleteBatch: "/smartAssessmentMission/smartAssessmentMission/deleteBatchSmartAssessmentDepart",
          exportXlsUrl: "/smartAssessmentMission/smartAssessmentMission/exportSmartAssessmentDepart",
          importUrl: "/smartAssessmentMission/smartAssessmentMission/importSmartAssessmentDepart",
        },
        dictOptions:{
        },
        superFieldList:[],
      }
    },
    created() {
      this.getSuperFieldList();
    },
    computed: {
      importExcelUrl(){
        return `${window._CONFIG['domianURL']}/${this.url.importUrl}/${this.mainId}`;
      }
    },
    methods: {
      handleAdd: function () {
        this.$refs.modalForm.add(this.mainInfo);
        this.$refs.modalForm.title = "新增被考核单位";
        this.$refs.modalForm.disableSubmit = false;
      },
      searchReset() {
        this.queryParam = {
          missionId: this.mainId,
        }
        this.loadData(1);
      },
      clearList(){
        this.dataSource=[]
        this.selectedRowKeys=[]
        this.ipagination.current = 1
      },
      getSuperFieldList(){
        let fieldList=[];
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>
