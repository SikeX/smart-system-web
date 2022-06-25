<template>
  <a-card :bordered="false">
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
        :indentSize='20'
        @change="handleTableChange"
        @expand="handleExpand">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>

        <template slot='nameSlot' slot-scope='text, record'>
          <span v-if='record.isKey === 0'>{{ text }}</span>
          <a-badge v-else>
            <a-tooltip>
              <template slot='title'>
                此为考核要点
              </template>
              <span> {{ text }} <a-icon slot='count' type='star' theme='twoTone'/></span>
            </a-tooltip>
          </a-badge>
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
          <a v-if='record.isKey' @click="handleDetail(record)">详情</a>
        </span>

      </a-table>
    </div>

    <ScoreDetailModal ref="modalForm" @ok="modalFormOk" />
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getAction } from '@/api/manage'
import '@/assets/less/TableExpand.less'
import { filterObj } from '@/utils/util'
import ScoreDetailModal from './modules/ScoreDetailModal'

  export default {
    name: "ScoreDetailList",
    mixins:[JeecgListMixin],
    components: {
      ScoreDetailModal
    },
    props: {
      mainId: {
        type: String,
        default: '',
        required: false
      },
      mainInfo: {
        type: Object,
        default: Object,
        required: false
      }
    },
    watch: {
      // 答题信息表ID
      mainId: {
        immediate: true,
        handler(val) {
          if (val) {
            this.queryParam['mainId'] = val
            this.loadData(1)
          }
        }
      }
    },
    data () {
      return {
        fields: { children: 'children', title: 'assContentId_dictText', key: 'assContentId' },
        expandedRowKeys:[],
        hasChildrenField:"hasChild",
        pidField:"pid",
        description: '答题考核节点表管理页面',
        disableMixinCreated: true,
        // 表头
        columns: [
          {
            title:'考核内容节点',
            align:"center",
            dataIndex: 'assContentId_dictText',
            scopedSlots: {customRender: 'nameSlot'}
          },
          {
            title:'最低得分',
            align:"center",
            dataIndex: 'lowestScore'
          },
          {
            title:'最高得分',
            align:"center",
            dataIndex: 'highestScore'
          },
          {
            title:'平均得分',
            align:"center",
            dataIndex: 'averageScore'
          },
          {
            title:'最终得分',
            align:"center",
            dataIndex: 'finalScore'
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
          list: "/smartAnswerAssContent/smartAnswerAssContent/list",
          rootList: "/smartAnswerAssContent/smartAnswerAssContent/rootList",
          childList: "/smartAnswerAssContent/smartAnswerAssContent/childList",
          getChildListBatch: "/smartAnswerAssContent/smartAnswerAssContent/getChildListBatch",
          delete: "/smartAnswerAssContent/smartAnswerAssContent/delete",
          deleteBatch: "/smartAnswerAssContent/smartAnswerAssContent/deleteBatch",
          exportXlsUrl: "/smartAnswerAssContent/smartAnswerAssContent/exportXls",
          importExcelUrl: "smartAnswerAssContent/smartAnswerAssContent/importExcel",
        },
        dictOptions:{
        },
        /* 分页参数 */
        ipagination:{
          current: 1,
          pageSize: 5,
          pageSizeOptions: ['5', '10', '50'],
          showTotal: (total, range) => {
            return range[0] + "-" + range[1] + " 共" + total + "条"
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        selectedMainId:'',
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
        this.selectedMainId=''
      },
      onSelectChange(selectedRowKeys, selectionRows) {
        this.selectedMainId=selectedRowKeys[0]
        this.selectedRowKeys = selectedRowKeys;
        this.selectionRows = selectionRows;
      },
      getQueryParams(arg) {
        //获取查询条件
        let sqp = {}
        let param = {}
        if(this.superQueryParams){
          sqp['superQueryParams']=encodeURI(this.superQueryParams)
          sqp['superQueryMatchType'] = this.superQueryMatchType
        }
        if(arg){
          param = Object.assign(sqp, this.isorter ,this.filters);
        }else{
          param = Object.assign(sqp, this.queryParam, this.isorter ,this.filters);
        }
        if(JSON.stringify(this.queryParam) === "{}" || arg){
          param.hasQuery = 'false'
        }else{
          param.hasQuery = 'true'
        }
        param.hasQuery = 'false'
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        return filterObj(param);
      },
      loadData(arg) {
        if(!this.url.rootList){
          this.$message.error("请设置url.list属性!")
          return
        }
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        this.onClearSelected()
        var params = this.getQueryParams();//查询条件
        this.loading = true;
        getAction(this.url.rootList, params).then((res) => {
          if (res.success) {
            let result = res.result
            if(Number(result.total)>0){
              this.ipagination.total = Number(result.total)
              this.dataSource = this.getDataByResult(res.result.records)
              return this.loadDataByExpandedRows(this.dataSource)
            }else{
              this.ipagination.total=0
              this.dataSource=[]
            }
          }
          if(res.code===510){
            this.$message.warning(res.message)
          }
        }).finally(()=>{
          this.loading = false
        })
      },
      loadDataByExpandedRows(dataList) {
        if (this.expandedRowKeys.length > 0) {
          return getAction(this.url.getChildListBatch,{ parentIds: this.expandedRowKeys.join(',') }).then(res=>{
            if (res.success && res.result.records.length>0) {
              //已展开的数据批量子节点
              let records = res.result.records
              const listMap = new Map();
              for (let item of records) {
                let pid = item[this.pidField];
                if (this.expandedRowKeys.join(',').includes(pid)) {
                  let mapList = listMap.get(pid);
                  if (mapList == null) {
                    mapList = [];
                  }
                  mapList.push(item);
                  listMap.set(pid, mapList);
                }
              }
              let childrenMap = listMap;
              let fn = (list) => {
                if(list) {
                  list.forEach(data => {
                    if (this.expandedRowKeys.includes(data.id)) {
                      data.children = this.getDataByResult(childrenMap.get(data.id))
                      fn(data.children)
                    }
                  })
                }
              }
              fn(dataList)
            }
          })
        } else {
          return Promise.resolve()
        }
      },
      getDataByResult(result) {
        if (result) {
          return result.map(item => {
            //判断是否标记了带有子节点
            if (item[this.hasChildrenField] == '1') {
              let loadChild = { id: item.id + '_loadChild', name: 'loading...', isLoading: true }
              item.children = [loadChild]
            }
            return item
          })
        }
      },
      handleExpand(expanded, record){
        // 判断是否是展开状态
        if (expanded) {
          this.expandedRowKeys.push(record.id)
          if (record.children.length>0 && record.children[0].isLoading === true) {
            let params = this.getQueryParams(1);//查询条件
            params[this.pidField] = record.assContentId
            params['mainId'] = this.mainId
            params.hasQuery = 'false'
            params.superQueryParams=""
            getAction(this.url.childList,params).then((res)=>{
              if(res.success){
                if(res.result.records){
                  record.children = this.getDataByResult(res.result.records)
                  this.dataSource = [...this.dataSource]
                }else{
                  record.children=''
                  record.hasChildrenField='0'
                }
              }else{
                this.$message.warning(res.message)
              }
            })
          }
        }else{
          let keyIndex = this.expandedRowKeys.indexOf(record.id)
          if(keyIndex>=0){
            this.expandedRowKeys.splice(keyIndex, 1);
          }
        }
      },
      handleDetail:function(record){
        // console.log(record)
        this.$refs.modalForm.edit(record);
        this.$refs.modalForm.title="详情";
        this.$refs.modalForm.mainId = record.id;
        this.$refs.modalForm.disableSubmit = true;
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