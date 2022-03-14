<template>
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
        class="j-table-force-nowrap"
        :scroll="{x:true}"
        :columns="columns"
        :dataSource="dataSource"

      >

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

      </a-table>
    </div>
  </a-card>
</template>

<script>

  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import TestAttachedModal from './modules/TestAttachedModal'
  import '@/assets/less/TableExpand.less'
import { getAction } from '../../api/manage'

  export default {
    name: "rankList",
    // mixins:[JeecgListMixin],
    components: {
    },
    props: {
      id: String
    },
    data () {
      return {
        description: '附件测试主表管理页面',
        // 表头
        columns: [],
        dataSource: [],
        cosntColumns: [
          {
            title:'总分',
            align:"center",
            dataIndex: 'totalScore'
          },
          {
            title: '排名',
            dataIndex: 'rank',
            width:60,
            align:"center",
          },
          {
            title:'去年排名',
            align:"center",
            dataIndex: 'lastRank'
          },
        ],
        url: {
          list: "/smartAnswerInfo/rank/getRankById",
          importExcelUrl: "testAttached/testAttached/importExcel",
          
        },
        dictOptions:{},
        superFieldList:[],
      }
    },
    created() {
      this.getSuperFieldList();
      this.getScoreType()
      this.loadData()
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {
      loadData() {
        const dataSource = []
        getAction('/smartAnswerInfo/rank/getRankById',{id: this.id}).then((res) => {
        if(res.success) {
          res.result.forEach(element => {
            let tmp = {}
            tmp = {...element, ...element.sourceMap}
            dataSource.push(tmp)
          })
          this.dataSource = dataSource
          console.log(res.result)
        }
      })
      },
      getScoreType() {
        console.log(this.id)

        const columns = [
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
            title: '单位',
            dataIndex: 'departName',
            key:'rowIndex',
            width:60,
            align:"center",
          }
        ]
        getAction('/smartAnswerInfo/rank/getScoreTypeById', {id: this.id}).then((res) => {
          if(res.success) {
            res.result.forEach(element => {
              let tmp = {}
              tmp.title = element.name
              tmp.dataIndex = element.id
              // tmp.width = 60
              tmp.align = 'center'
              columns.push(tmp)
            });
            // columns = [...columns,...this.cosntColumns]
            // console.log(columns)
            this.columns = [...columns,...this.cosntColumns]
            console.log(res.result)
          }
        }
        )        
      },
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
         fieldList.push({type:'string',value:'testDesc',text:'说明',dictCode:''})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>