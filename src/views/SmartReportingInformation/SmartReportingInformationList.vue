<template>
<!--提示音-->
<!--  <audio id="audio" preload="auto" loop>-->
<!--    <source src="./system.mp3" type="audio/mp3" />-->
<!--  </audio>-->

  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
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
          <a @click="handleEdit(record)">处理举报信息</a>
        </span>

      </a-table>
    </div>

    <smart-reporting-information-modal ref="modalForm" @ok="modalFormOk"/>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SmartReportingInformationModal from './modules/SmartReportingInformationModal'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import '@/assets/less/TableExpand.less'

  export default {
    name: "SmartReportingInformationList",
    mixins:[JeecgListMixin],
    components: {
      SmartReportingInformationModal,
    },
    data () {
      return {
        description: '举报信息表管理页面',
        // 表头
        columns: [
          {
            title: '编号',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title:'被反映人信息',
            align:"center",
            dataIndex: 'reflectedInformation'
          },
          {
            title:'被反映人单位',
            align:"center",
            dataIndex: 'reflectedDocumentid'
          },
          {
            title:'主要问题',
            align:"center",
            dataIndex: 'majorProblem'
          },
          {
            title:'举报时间',
            align:"center",
            dataIndex: 'reportingTime'
          },
          {
            title:'处理状态',
            align:"center",
            dataIndex: 'processingResult_dictText'
          },
          {
            title:'举报人姓名',
            align:"center",
            dataIndex: 'reportingName'
          },
          {
            title:'联系电话',
            align:"center",
            dataIndex: 'contactNumber'
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
          list: "/smartReportingInformation/smartReportingInformation/list",
          delete: "/smartReportingInformation/smartReportingInformation/delete",
          deleteBatch: "/smartReportingInformation/smartReportingInformation/deleteBatch",
          exportXlsUrl: "/smartReportingInformation/smartReportingInformation/exportXls",
          importExcelUrl: "smartReportingInformation/smartReportingInformation/importExcel",

        },
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
      }
    },
    methods: {
     /* play () {
        this.lastRunTime = Date.now()
        let audio = document.querySelector('#audio')
        if (!this.isPlaying) {
          audio.play()
          this.isPlaying = true
        }
        let timeOut = setTimeout(() => {
          this.stop(timeOut)
        }, 15000)
      },
      stop (timeOut) {
        this.currentTime = Date.now()
        let audio = document.querySelector('#audio')
        if (this.currentTime - this.lastRunTime < 15000) {
        } else {
          if (this.isPlaying) {
            audio.currentTime = 0
            audio.pause()
            this.isPlaying = false
          }
        }
        clearTimeout(timeOut)
      },*/

      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
         fieldList.push({type:'string',value:'reflectedInformation',text:'被反映人信息',dictCode:''})
         fieldList.push({type:'string',value:'reflectedDocumentid',text:'被反映人单位',dictCode:''})
         fieldList.push({type:'string',value:'majorProblem',text:'主要问题',dictCode:''})
         fieldList.push({type:'Blob',value:'photo',text:'照片',dictCode:''})
         fieldList.push({type:'Text',value:'description',text:'附件',dictCode:''})
         fieldList.push({type:'datetime',value:'reportingTime',text:'举报时间'})
         fieldList.push({type:'string',value:'processingResult',text:'处理状态',dictCode:'processing_result'})
         fieldList.push({type:'string',value:'reportingName',text:'举报人姓名',dictCode:''})
         fieldList.push({type:'string',value:'contactNumber',text:'联系电话',dictCode:''})
        this.superFieldList = fieldList
      }
    }
  }
</script>
