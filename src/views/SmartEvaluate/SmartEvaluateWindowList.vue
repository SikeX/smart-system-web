<template>
  <div>
  <a-card :bordered="true" title='评价信息'>
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="主管单位">
              <a-input placeholder="请输入主管单位" v-model="queryParam.exeDept"></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl="7" :lg="7" :md="8" :sm="24">
            <a-form-item label="窗口服务大厅名称">
<!--              <a-input placeholder="请输入窗口服务大厅名称" v-model="queryParam.windowsName"></a-input>-->
              <j-search-select-tag
                placeholder="请选择窗口服务大厅名称"
                v-model="queryParam.windowsName"
                dict="smart_window_unit,name,name,del_flag = 0"
                :async="true" :style="{width:'200px'}">
              </j-search-select-tag>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
<!--              <a @click="handleToggleSearch" style="margin-left: 8px">
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
    <div class="table-operator">
      <!--<a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>-->
      <a-button type="primary" icon="download" @click="handleExportXls('阳光评廉表')">导出</a-button>
<!--      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>-->
      <!-- 高级查询区域 -->
<!--      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>-->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
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
         <!-- <a @click="handleEdit(record)">编辑</a>-->
        <a @click="handleDetail(record)">详情</a>
          <!--<a-divider type="vertical" />-->
          <!--<a-dropdown>
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

    <smart-evaluate-window-modal ref="modalForm" @ok="modalFormOk"></smart-evaluate-window-modal>
  </a-card>
    <a-card title='不满意评价' v-if="roleId.indexOf('1467143903808229378') !== -1" :bordered='true' style='margin-top: 20px'>
      <smart-poor-eva-list/>
    </a-card>
  </div>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SmartEvaluateWindowModal from './modules/SmartEvaluateWindowModal'
  import SmartEvaluateForm from './modules/SmartEvaluateForm'
  import SmartPoorEvaList from './SmartPoorEvaList'
  import { mapGetters } from 'vuex'

  export default {
    name: 'SmartEvaluateWindowList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      SmartEvaluateWindowModal,SmartEvaluateForm,SmartPoorEvaList
    },
    data () {
      return {
        description: '阳光评廉表管理页面',
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
            title:'主管单位',
            align:"center",
            dataIndex: 'exeDept',
            sorter: true
          },
          {
            title:'窗口服务大厅名称',
            align:"center",
            dataIndex: 'windowsName',
            sorter: true
          },
          {
            title:'人员名称',
            align:"center",
            dataIndex: 'personName',
            sorter: true
          },
          {
            title:'评价人',
            align:"center",
            dataIndex: 'evaluateName',
            sorter: true
          },
          {
            title:'评价人手机号',
            align:"center",
            dataIndex: 'evaluatePhone',
            sorter: true
          },
          {
            title:'评价时间',
            align:"center",
            dataIndex: 'evaluateTime',
            sorter: true
          },
          {
            title:'评价结果',
            align:"center",
            dataIndex: 'evaluateResult_dictText',
            sorter: true
          },
          {
            title:'意见',
            align:"center",
            dataIndex: 'evaluateOpinion',
            sorter: true
          },
          {
            title: '操作',
            dataIndex: 'action',
            align: "center",
            fixed: "right",
            width: 147,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/smartEvaluateList/smartEvaluateWindow/list",
          delete: "/smartEvaluateList/smartEvaluateWindow/delete",
          deleteBatch: "/smartEvaluateList/smartEvaluateWindow/deleteBatch",
          exportXlsUrl: "/smartEvaluateList/smartEvaluateWindow/exportXls",
          importExcelUrl: "smartEvaluateList/smartEvaluateWindow/importExcel",

        },
        dictOptions:{},
        superFieldList:[],
        roleId:[]
      }
    },
    created() {
      this.roleId = this.userInfo().roleId
    this.getSuperFieldList();
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
    },
    methods: {
      ...mapGetters(["userInfo"]),
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'exeDept',text:'主管单位',dictCode:''})
        fieldList.push({type:'string',value:'windowsName',text:'窗口服务大厅名称',dictCode:''})
        fieldList.push({type:'string',value:'personName',text:'人员名称',dictCode:''})
        fieldList.push({type:'string',value:'evaluateResult',text:'评价结果',dictCode:'evaluate_grade'})
        fieldList.push({type:'string',value:'evaluateName',text:'评价人',dictCode:''})
        fieldList.push({type:'string',value:'evaluatePhone',text:'评价人手机号',dictCode:''})
        fieldList.push({type:'datetime',value:'evaluateTime',text:'评价时间'})
        fieldList.push({type:'string',value:'evaluateOpinion',text:'意见'})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>