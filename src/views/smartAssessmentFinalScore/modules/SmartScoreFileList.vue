<template>
  <a-card title='上传内容' :bordered="false" :class="'cust-erp-sub-tab'">

    <!-- table区域-begin -->
    <div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
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
          <a @click="handleDetail(record)">详情</a>
        </span>

      </a-table>
    </div>
    <smart-score-file-modal ref="modalForm" @ok="modalFormOk" :mainId="mainId"></smart-score-file-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SmartScoreFileModal from './SmartScoreFileModal'

  export default {
    name: "SmartScoreFileList",
    mixins:[JeecgListMixin],
    components: { SmartScoreFileModal  },
    props:{
      mainId:{
        type:String,
        default:'',
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
            dataIndex: 'attachmentDescription',
            ellipsis: true,
          },
          {
            title:'工作开始时间',
            align:"center",
            dataIndex: 'workTime'
          },
          {
            title:'附件',
            align:"center",
            dataIndex: 'attachment',
            scopedSlots: {customRender: 'fileSlot'}
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
            width:100,
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
