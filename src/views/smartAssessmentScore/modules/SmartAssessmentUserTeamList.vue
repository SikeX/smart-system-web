<template>
  <div style="margin-top: 20px">
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
      </span>

    </a-table>
  </div>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import {getAction} from "@api/manage";
  import Vue from "vue";

  export default {
    name: 'SmartAssessmentUserTeamList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
    },
    props: {
      scoreRole: {
        type: String,
        default: '',
        required: false
      },
    },
    watch: {
      // 选择的 missionId
      scoreRole: {
        immediate: true,
        handler(val) {
          if (val === "depart") {
            this.loadMyDepartment(1);
          } else {
            this.loadMyTeamInfo(1);
          }
        }
      }
    },
    data () {
      return {
        description: '评分用户所属考核组或考核单位列表',
        disableMixinCreated: true,
        // 表头
        columns: [
          {
            title:'名称',
            align:"center",
            dataIndex: 'teamName',
            customRender: function (t, r, index) {
              if (r.departId_dictText) {
                return r.departId_dictText;
              } else {
                return r.teamName
              }
            },
          },
          {
            title:'创建时间',
            align:"center",
            dataIndex: 'createTime'
          }
        ],
        url: {
          list: "/smartAssessmentTeam/smartAssessmentTeam/list",
          delete: "/smartAssessmentTeam/smartAssessmentTeam/delete",
          deleteBatch: "/smartAssessmentTeam/smartAssessmentTeam/deleteBatch",
          exportXlsUrl: "/smartAssessmentTeam/smartAssessmentTeam/exportXls",
          importExcelUrl: "smartAssessmentTeam/smartAssessmentTeam/importExcel",

        },
        selectedMainId: '',
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
        this.selectedMainId = ''
      },
      onSelectChange(selectedRowKeys, selectionRows) {
        this.selectedMainId = selectedRowKeys[0]
        this.selectedRowKeys = selectedRowKeys;
        this.selectionRows = selectionRows;
        this.$emit('select', selectionRows[0])
      },
      // 查询考核组信息
      loadMyTeamInfo(arg) {
        if (arg == 1) {
          this.ipagination.current = 1
        }

        let that = this
        this.loading = true
        let params = {
          pageNo: this.ipagination.current,
          pageSize: this.ipagination.pageSize
        }

        getAction('/smartAssessmentTeam/smartAssessmentTeam/listMyTeam', params).then((res) => {
          if (res.success) {
            this.dataSource = res.result.records||res.result;
            if(res.result.total)
            {
              this.ipagination.total = res.result.total;
            }else{
              this.ipagination.total = 0;
            }
          } else {
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.loading = false;
        });
      },
      // 查询考核单位信息
      loadMyDepartment(arg) {
        if (arg == 1) {
          this.ipagination.current = 1
        }

        let that = this
        this.loading = true
        let params = {
          pageNo: this.ipagination.current,
          pageSize: this.ipagination.pageSize
        }

        getAction('/smartAssessmentDepartment/smartAssessmentDepartment/listMyDepartment', params).then((res) => {
          if (res.success) {
            this.dataSource = res.result.records||res.result;
            if(res.result.total)
            {
              this.ipagination.total = res.result.total;
            }else{
              this.ipagination.total = 0;
            }
          } else {
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.loading = false;
        });
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'teamName',text:'名称',dictCode:''})
        fieldList.push({type:'datetime',value:'createTime',text:'创建时间'})
        fieldList.push({type:'int',value:'departAmount',text:'负责单位数量',dictCode:''})
        fieldList.push({type:'sel_user',value:'teamLeader',text:'组长'})
        fieldList.push({type:'sel_user',value:'deputyTeamLeader',text:'副组长'})
        fieldList.push({type:'sel_user',value:'members',text:'成员'})
        fieldList.push({type:'sel_depart',value:'departs',text:'负责单位'})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>