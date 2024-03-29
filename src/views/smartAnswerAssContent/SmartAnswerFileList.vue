<template>
  <a-card v-if='mainId' title='上传内容' :bordered="false" :class="'cust-erp-sub-tab'">
    <!-- 操作按钮区域 -->
    <div class="table-operator" v-if='!disabled'>
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('要点答题附件')">导出</a-button>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div v-if='!disabled' class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
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
          <a v-if='!disabled' @click="handleEdit(record)">编辑</a>
          <a-divider v-if='!disabled' type="vertical" />
          <a @click="handleDetail(record)">详情</a>
          <a-divider v-if='!disabled' type="vertical" />
          <a-popconfirm v-if='!disabled' title="确定删除吗?" @confirm="() => handleDelete(record)">
            <a>删除</a>
          </a-popconfirm>
        </span>

      </a-table>
    </div>

    <smartAnswerFile-modal ref="modalForm" @ok="modalFormOk" :mainId="mainId"></smartAnswerFile-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SmartAnswerFileModal from './modules/SmartAnswerFileModal'
  import { deleteAction } from '@api/manage'

  export default {
    name: "SmartAnswerFileList",
    mixins:[JeecgListMixin],
    components: { SmartAnswerFileModal },
    props:{
      mainId:{
        type:String,
        default:'',
        required:false
      },
      disabled: {
        type: Boolean,
        required: false,
        default: false
      },
    },
    watch:{
      mainId:{
        immediate: true,
        handler(val) {
          if(!this.mainId){
            this.clearList()
          }else{
            this.queryParam['mainId'] = val
            this.loadData(1);
          }
        }
      }
    },
    data () {
      return {
        description: '答题考核节点表管理页面',
        disableMixinCreated:true,
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
            title:'附件说明',
            align:"center",
            dataIndex: 'attachmentDescription'
          },
          {
            title:'工作开始时间',
            align:"center",
            dataIndex: 'workTime'
          },
          {
            title:'上报人',
            align:"center",
            dataIndex: 'uploadUser_dictText'
          },
          {
            title:'上传时间',
            align:"center",
            dataIndex: 'createTime'
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
          list: "/smartAnswerAssContent/smartAnswerAssContent/listSmartAnswerFileByMainId",
          delete: "/smartAnswerAssContent/smartAnswerAssContent/deleteSmartAnswerFile",
          deleteBatch: "/smartAnswerAssContent/smartAnswerAssContent/deleteBatchSmartAnswerFile",
          exportXlsUrl: "/smartAnswerAssContent/smartAnswerAssContent/exportSmartAnswerFile",
          importUrl: "/smartAnswerAssContent/smartAnswerAssContent/importSmartAnswerFile",
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
      modalFormOk() {
        // 新增/修改 成功时，重载列表
        this.loadData();
        //清空列表选中
        this.onClearSelected()
        this.$emit("ok")
      },
      handleDelete: function (record) {
        if(!this.url.delete){
          this.$message.error("请设置url.delete属性!")
          return
        }
        var that = this;
        let params = {
          id: record.id,
          mainId: record.mainId,
        }
        that.onClearSelected();
        deleteAction(that.url.delete, params).then((res) => {
          if (res.success) {
            //重新计算分页问题
            that.reCalculatePage(1)
            that.$message.success(res.message);
            // 重新加载
            this.$emit("ok")
            that.loadData();
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      batchDel: function () {
        if(!this.url.deleteBatch){
          this.$message.error("请设置url.deleteBatch属性!")
          return
        }
        if (this.selectedRowKeys.length <= 0) {
          this.$message.warning('请选择一条记录！');
          return;
        } else {
          var ids = "";
          for (var a = 0; a < this.selectedRowKeys.length; a++) {
            ids += this.selectedRowKeys[a] + ",";
          }
          var that = this;
          this.$confirm({
            title: "确认删除",
            content: "是否删除选中数据?",
            onOk: function () {
              that.loading = true;
              let params = {
                ids: ids,
                mainId: that.mainId,
                count: that.selectedRowKeys.length
              }
              deleteAction(that.url.deleteBatch, params).then((res) => {
                if (res.success) {
                  //重新计算分页问题
                  that.reCalculatePage(that.selectedRowKeys.length)
                  that.$message.success(res.message);
                  that.loadData();
                  that.$emit("ok");
                  that.onClearSelected();
                } else {
                  that.$message.warning(res.message);
                }
              }).finally(() => {
                that.loading = false;
              });
            }
          });
        }
      },
      clearList(){
        this.dataSource=[]
        this.selectedRowKeys=[]
        this.ipagination.current = 1
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'pid',text:'父级节点',dictCode:''})
        fieldList.push({type:'string',value:'hasChild',text:'是否有子节点',dictCode:''})
        fieldList.push({type:'string',value:'assContentId',text:'考核内容节点',dictCode:''})
        fieldList.push({type:'string',value:'contentStatus',text:'要点状态',dictCode:''})
        fieldList.push({type:'double',value:'lowestScore',text:'最低得分',dictCode:''})
        fieldList.push({type:'double',value:'highestScore',text:'最高得分',dictCode:''})
        fieldList.push({type:'double',value:'averageScore',text:'平均得分',dictCode:''})
        fieldList.push({type:'double',value:'finalScore',text:'最终得分',dictCode:''})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>
