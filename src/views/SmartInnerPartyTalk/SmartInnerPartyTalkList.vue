<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper" v-if="roleId.indexOf('1465163864583323650') === -1">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="审核状态">
              <a-select v-model="queryParam.verifyStatus" placeholder="请选择审核状态">
                <a-select-option value="0">不通过</a-select-option>
                <a-select-option value="1">通过</a-select-option>
                <a-select-option value="2">待审核</a-select-option>
                <a-select-option value="3">免审</a-select-option>
                <a-select-option value="4">待提交</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="单位">
              <j-select-depart
                placeholder="请选择单位"
                v-model="queryParam.departId"
                customReturnField="id"
                :multi="false"
                :treeOpera="true"
              ></j-select-depart>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="会议地点">
              <j-input placeholder="请输入会议地点" v-model="queryParam.meetLocation"></j-input>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="会议名称">
              <j-input placeholder="请输入会议名称" v-model="queryParam.meetName"></j-input>
            </a-form-item>
          </a-col>
          <!--          <template v-if="toggleSearchStatus">
          <a-col :xl="10" :lg="11" :md="1" :sm="10" >
            <a-form-item label="会议时间">
&lt;!&ndash;              <a-range-picker v-model="queryParam.meetTime"></a-range-picker>&ndash;&gt;
              <a-col :style="{marginLeft:'3px'}">
              <j-date :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择开始时间"  v-model="queryParam.meetTime_begin"></j-date>
                <span class="query-group-split-cust"></span></a-col>
            <a-col :style="{marginRight:'30px',marginLeft:'3px'}">
              <j-date :show-time="true" date-format="YYYY-MM-DD HH:mm:ss" placeholder="请选择结束时间"  v-model="queryParam.meetTime_end"></j-date>
            </a-col>
            </a-form-item>
          </a-col>
         </template>-->
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
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
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('党内谈话表')">导出</a-button>
      <!--      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">-->
      <!--        <a-button type="primary" icon="import">导入</a-button>-->
      <!--      </a-upload>-->
      <!-- 高级查询区域 -->
      <!--      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>-->
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
        bordered
        rowKey="id"
        class="j-table-force-nowrap"
        :scroll="{ x: true }"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
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

    <smart-inner-party-talk-modal ref="modalForm" @ok="modalFormOk" />
  </a-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import SmartInnerPartyTalkModal from './modules/SmartInnerPartyTalkModal'
import '@/assets/less/TableExpand.less'
import AFormItem from 'ant-design-vue/es/form/FormItem'

export default {
  name: 'SmartInnerPartyTalkList',
  mixins: [JeecgListMixin],
  components: {
    AFormItem,
    SmartInnerPartyTalkModal,
  },
  data() {
    return {
      queryParam: [],
      description: '党内谈话表管理页面',
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
          title: '单位',
          align: 'center',
          dataIndex: 'departId',
          sorter: true,
        },
        {
          title: '会议时间',
          align: 'center',
          dataIndex: 'meetTime',
          sorter: true,
        },
        {
          title: '会议地点',
          align: 'center',
          dataIndex: 'meetLocation',
          sorter: true,
        },
        {
          title: '会议名称',
          align: 'center',
          dataIndex: 'meetName',
          sorter: true,
        },
        /*          {
            title:'主持人ID',
            align:"center",
            dataIndex: 'hostId_dictText'
          },*/
        {
          title: '主持人姓名',
          align: 'center',
          dataIndex: 'hostName',
          sorter: true,
        },
        {
          title: '受约谈函询人姓名',
          align: 'center',
          dataIndex: 'talkedName',
          sorter: true,
        },
        {
          title: '受诫勉谈话人姓名',
          align: 'center',
          dataIndex: 'inquirerName',
          sorter: true,
        },
        {
          title: '受党纪处分人姓名',
          align: 'center',
          dataIndex: 'punisherName',
          sorter: true,
        },
        {
          title: '记录人姓名',
          align: 'center',
          dataIndex: 'recorderName',
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
        list: '/SmartInnerPartyTalk/smartInnerPartyTalk/list',
        delete: '/SmartInnerPartyTalk/smartInnerPartyTalk/delete',
        deleteBatch: '/SmartInnerPartyTalk/smartInnerPartyTalk/deleteBatch',
        exportXlsUrl: '/SmartInnerPartyTalk/smartInnerPartyTalk/exportXls',
        importExcelUrl: 'SmartInnerPartyTalk/smartInnerPartyTalk/importExcel',
        verify: '/SmartInnerPartyTalk/smartInnerPartyTalk/submitVerify',
      },
      dictOptions: {},
      superFieldList: [],
      roleId: [],
    }
  },
  created() {
    this.roleId = this.userInfo().roleId
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    ...mapGetters(['userInfo']),
    initDictConfig() {},
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'departId', text: '单位', dictCode: '' }) //sys_depart,depart_name,id
      fieldList.push({ type: 'datetime', value: 'meetTime', text: '会议时间' })
      fieldList.push({ type: 'string', value: 'meetLocation', text: '会议地点', dictCode: '' })
      fieldList.push({ type: 'string', value: 'meetName', text: '会议名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'hostId', text: '主持人' })
      fieldList.push({ type: 'string', value: 'hostName', text: '主持人姓名' })
      fieldList.push({ type: 'string', value: 'talkedId', text: '受约谈函询人' })
      fieldList.push({ type: 'string', value: 'talkedName', text: '受约谈函询人姓名' })
      fieldList.push({ type: 'string', value: 'inquirerId', text: '受诫勉谈话人' })
      fieldList.push({ type: 'string', value: 'inquirerName', text: '受诫勉谈话人姓名' })
      fieldList.push({ type: 'string', value: 'punisherId', text: '受党纪处分人' })
      fieldList.push({ type: 'string', value: 'punisherName', text: '受诫勉谈话人姓名' })
      //fieldList.push({type:'string',value:'abs',text:'会议摘要',dictCode:''})
      fieldList.push({ type: 'string', value: 'recorderId', text: '记录人' })
      fieldList.push({ type: 'string', value: 'recorderName', text: '记录人姓名' })
      fieldList.push({ type: 'string', value: 'verifyStatus', text: '审核状态' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>