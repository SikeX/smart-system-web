<template>
  <a-card title="评分列表" :bordered="false" :class="'cust-erp-sub-tab'">

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

    <smartAnswerAssScore-modal ref="modalForm" @ok="modalFormOk" :mainId="mainId"></smartAnswerAssScore-modal>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SmartAnswerAssScoreModal from './SmartAnswerAssScoreModal'

  export default {
    name: "SmartAnswerAssScoreList",
    mixins:[JeecgListMixin],
    components: { SmartAnswerAssScoreModal },
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
            title:'评分人',
            align:"center",
            dataIndex: 'ratingUser_dictText',
          },
          {
            title:'评分',
            align:"center",
            dataIndex: 'score',
            width: 60,
          },
          {
            title:'评语',
            align:"center",
            dataIndex: 'comment',
            ellipsis: true,
          },
          {
            title:'评分时间',
            align:"center",
            dataIndex: 'createTime',
          },
          {
            title:'评分角色',
            align:"center",
            dataIndex: 'roleType',
            customRender:function (t,r,index) {
              if (t === 0) {
                return '考核组';
              } else {
                return '考核单位'
              }
            }
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            fixed:"right",
            width:80,
            scopedSlots: { customRender: 'action' },
          }
        ],
        url: {
          list: "/smartAnswerAssContent/smartAnswerAssContent/listSmartAnswerAssScoreByMainId",
          delete: "/smartAnswerAssContent/smartAnswerAssContent/deleteSmartAnswerAssScore",
          deleteBatch: "/smartAnswerAssContent/smartAnswerAssContent/deleteBatchSmartAnswerAssScore",
          exportXlsUrl: "/smartAnswerAssContent/smartAnswerAssContent/exportSmartAnswerAssScore",
          importUrl: "/smartAnswerAssContent/smartAnswerAssContent/importSmartAnswerAssScore",
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
