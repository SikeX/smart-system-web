<template>
  <a-card :bordered="false">
    <!-- 三员+调查问卷-->
    <div>
<!--      <span class="ant-card-head"> <a-icon type="line"/> 三员+调查问卷 <a-icon type="line" /></span>-->
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
              <a-form-item label="调查问卷名称">
                <j-search-select-tag
                  placeholder="请选择调查问卷名称"
                  v-model="queryParam.id"
                  dict="smart_paper,paper_name,id,paper_type = '4'"
                  :async="true">
                </j-search-select-tag>
              </a-form-item>
            </a-col>
            <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
            </span>
            </a-col>
          </a-row>
        </a-form>
      </div>
      <!-- 查询区域-END -->

      <!-- 操作按钮区域 -->
      <div class="table-operator">
        <!--<a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>-->
        <a-button @click="createTestPaper"  type="primary" icon="plus">创建问卷</a-button>

      </div>

      <!-- table区域-begin -->
      <div>
        <!--      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
                <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
                <a style="margin-left: 24px" @click="onClearSelected">清空</a>
              </div>-->

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
          <!--<a @click="handleEdit(record)">编辑</a>-->
<!--          <a @click="handleIssueSurvey(record)" :class="isDisabled(record)">发布问卷</a>-->
<!--          <a-divider type="vertical" />-->
<!--          <a @click="editTestPaper(record.id)" :class="isDisabled(record)">修改问卷</a>-->
<!--            <a @click="showPeopleList(record)">查看被访人</a>-->
          <a @click="beginSurvey(record)" :class="isDisabled(record)">开始调查</a>
<!--          <a-divider type="vertical" />-->
<!--          <a @click="showScore(record)">查看调查结果</a>-->
        </span>

        </a-table>

      </div>
    </div>

    <smart-paper-modal ref="modalForm" @ok="modalFormOk"></smart-paper-modal>
    <task-detail-modal ref="scoreModal" @ok="modalFormOk"></task-detail-modal>
    <!-- 发布调查问卷弹框 -->
    <ReleaseTest ref="releaseTestDialog" @ok="modalFormOk"/>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { filterObj } from '@/utils/util'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import SmartPaperModal from './modules/SmartPaperModal'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import { httpAction,putAction, postAction,getAction } from '@/api/manage'
  import ReleaseTest from './modules/ReleaseTest'
  import TaskDetailModal from './modules/TaskDetailModal.vue'
  import Vue from 'vue'
  import { ACCESS_TOKEN,TENANT_ID } from '@/store/mutation-types'
  import JSZip from 'jszip'
  import axios from 'axios'

  export default {
    name: 'SmartSurveyList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      SmartPaperModal,
      ReleaseTest,
      TaskDetailModal
    },
    data () {
      return {
        dcId:"",
        dcName:'',
        queryParam:{
          id:'',
          paperType:'4'
        },
        description: '试卷表管理页面',
        fileList: [],
        dataSource: [],
        ipagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 共' + total + '条'
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0,
        },
        /* 排序参数 */
        isorter: {
          column: 'createTime',
          order: 'desc',
        },
        /* 筛选参数 */
        filters: {},
        /* table加载状态 */
        loading: false,
        /* table选中keys*/
        selectedRowKeys: [],
        /* table选中records*/
        selectionRows: [],
        /* 查询折叠 */
        toggleSearchStatus: false,
        /* 高级查询条件生效状态 */
        superQueryFlag: false,
        /* 高级查询条件 */
        superQueryParams: '',
        /** 高级查询拼接方式 */
        superQueryMatchType: 'and',
        anntId: '',
        // 表头
        columns: [
          {
            title:'问卷名称',
            align:"center",
            dataIndex: 'paperName',
            //sorter: true
          },
          {
            title:'被访人',
            align:"center",
            dataIndex: 'userId_dictText',
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            width:100,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/SmartPaper/smartPaper/triPeoGovList",
          delete: "/SmartPaper/smartPaper/delete",
          deleteBatch: "/SmartPaper/smartPaper/deleteBatch",
          exportXlsUrl: "/SmartPaper/smartPaper/exportXls",
          importExcelUrl: "SmartPaper/smartPaper/importExcel",
        },
        dictOptions:{},
        superFieldList:[],
      }
    },
    created() {
    this.getSuperFieldList();
    },
    computed: {
      flag(){
        console.log(this.$route.query.flag);
        if(this.$route.query.flag){
          this.getSuperFieldList()
        }
      },
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
      //token header
      tokenHeader(){
        let head = {'X-Access-Token': Vue.ls.get(ACCESS_TOKEN)}
        let tenantid = Vue.ls.get(TENANT_ID)
        if(tenantid){
          head['tenant-id'] = tenantid
        }
        return head;
      }
    },
    methods: {
      beginSurvey(record){
        console.log(record);
        let paperId = record.paperId
        let userName = record.realname
        let userId = record.userId
        let dcName = this.dcName
        let dcId = this.dcId

        /*this.$router.push({
          name: "myTriPrePlusSurvey",
          query: {paperId,userName,userId,dcName}
        });*/
        const { href } = this.$router.resolve({
          name: "myTriPrePlusGov",
          query: {paperId,userName,userId,dcName,dcId}
        });
        const win = window.open(href, "_blank");
        const loop = setInterval(item => {
          if (win.closed) {
            clearInterval(loop);
            this.$ref.table.reload();
          }
        }, 1000);
      },
      isDisabled(record){
        if ( record.isFinish === "0") {
          //激活开始调查
          //console.log('激活发布');
        } else if ( record.isFinish === "1"){
          //console.log('No发布');
          return "disabled";
        }
      },
      searchReset(){
        this.queryParam = {id:"",paperType: "4"}
        this.searchQuery();
      },
      showScore(record) {
        console.log(record)
        this.$refs.scoreModal.edit(record.paperId,record.paperName,record.departId,record.departName)
      },
      //去创建新试卷
      createTestPaper() {
        const { href } = this.$router.resolve({
          name: "createTriPrePlusGov",
          params: { opt: 'addSurvey'}
        });
        const win  = window.open(href, "_blank");
        const loop = setInterval(item => {
          if (win.closed) {
            clearInterval(loop);
            this.refresh();
          }
        }, 1000);
      },
      // 编辑试卷
      editTestPaper(id) {
        console.log(id);
        const { href } = this.$router.resolve({
          name: "editTriPrePlusGov",
          params: { opt: 'edit', id}
        });
        const win = window.open(href, "_blank");
        const loop = setInterval(item => {
          if (win.closed) {
            clearInterval(loop);
            this.$ref.table.reload();
          }
        }, 1000);
      },
      detailPage(id){
        console.log(id);
        const { href } = this.$router.resolve({
          name: "editTriPrePlusGov",
          params: { opt: 'detail', id}
        });
        const win = window.open(href, "_blank");
        const loop = setInterval(item => {
          if (win.closed) {
            clearInterval(loop);
            this.$ref.table.reload();
          }
        }, 1000);
  },
      //试卷发布
      handleIssueSurvey(record){
        console.log(record)
        let paperId = record.id
        this.$refs.releaseTestDialog.releaseTest(paperId)
      },
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'string',value:'paperId',text:'试卷ID',dictCode:''})
        fieldList.push({type:'string',value:'paperName',text:'试卷名称',dictCode:''})
        fieldList.push({type:'string',value:'userId',text:'被访人',dictCode:'sys_user,realname,id'})
        this.superFieldList = fieldList
      },

      loadData(arg) {
        if (!this.url.list) {
          this.$message.error('请设置url.list属性!')
          return
        }
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1
        }
        var params = this.getQueryParams() //查询条件
        this.loading = true
        getAction(this.url.list,params)
          .then((res) => {
            if (res.success) {
              console.log(res.message)
              let mes = (res.message).split(",")
              console.log(mes)
              //调查人ID和姓名
              this.dcId = mes[0]
              this.dcName = mes[1]
              this.dataSource = res.result.records || res.result
              if (res.result.total) {
                this.ipagination.total = res.result.total
              } else {
                this.ipagination.total = 0
              }
            } else {
              this.$message.warning(res.message)
            }
          })
          .finally(() => {
            this.loading = false
          })
      },
      handleTableChange(pagination, filters, sorter) {
        //分页、排序、筛选变化时触发
        //TODO 筛选
        console.log(pagination)
        if (Object.keys(sorter).length > 0) {
          this.isorter.column = sorter.field
          this.isorter.order = 'ascend' == sorter.order ? 'asc' : 'desc'
        }
        this.ipagination = pagination
        this.loadData()
      },
      onSelectChange(selectedRowKeys, selectionRows) {
        this.selectedRowKeys = selectedRowKeys
        this.selectionRows = selectionRows
      },
      getQueryParams() {
        //获取查询条件
        let sqp = {}
        if(this.superQueryParams){
          sqp['superQueryParams']=encodeURI(this.superQueryParams)
          sqp['superQueryMatchType'] = this.superQueryMatchType
        }
        var param = Object.assign(sqp, this.queryParam, this.isorter ,this.filters);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        return filterObj(param);
      },
      handleBatchDownload(title) {
        const params = {
          anntId: this.anntId,
        }
        getAction('/sys/sysAnnouncementSend/getSubmitFileList', params).then((res) => {
          if (res.success) {
            res.result.map((item) => {
              if (item) {
                this.fileList.push(this.upurl + item)
              }
            })
            console.log(this.fileList)
            this.downFileZip(title)
          }
        })
      },
      downFileZip(title) {
        const data = this.fileList // 需要下载打包的路径, 可以是本地相对路径, 也可以是跨域的全路径
        const zip = new JSZip()
        const cache = {}
        const promises = []
        data.forEach((item) => {
          console.log(item)
          const promise = this.getFile(item).then((data) => {
            // 下载文件, 并存成ArrayBuffer对象
            const arr_name = item.split('/')
            const file_name = arr_name[arr_name.length - 1] // 获取文件名
            zip.file(file_name, data, { binary: true }) // 逐个添加文件
            cache[file_name] = data
          })
          promises.push(promise)
        })

        Promise.all(promises).then(() => {
          zip.generateAsync({ type: 'blob' }).then((content) => {
            // 生成二进制流
            FileSaver.saveAs(content, title + '提交附件' + '.zip') // 利用file-saver保存文件
          })
        })
      },
      getFile(url) {
        console.log(url)
        return new Promise((resolve, reject) => {
          axios({
            method: 'get',
            url,
            responseType: 'arraybuffer',
          })
            .then((data) => {
              console.log(data)
              resolve(data.data)
            })
            .catch((error) => {
              reject(error.toString())
            })
        })
      },
      /* 导出 */
      handleExportXls2(){
        let paramsStr = encodeURI(JSON.stringify(this.getQueryParams()));
        let url = `${window._CONFIG['domianURL']}/${this.url.exportXlsUrl}?paramsStr=${paramsStr}`;
        window.location.href = url;
      },
      handleExportXls(fileName){
        if(!fileName || typeof fileName != "string"){
          fileName = "导出文件"
        }else{
          fileName = this.title
        }
        let param = this.getQueryParams();
        if(this.selectedRowKeys && this.selectedRowKeys.length>0){
          param['selections'] = this.selectedRowKeys.join(",")
        }
        Object.assign(param,{title:this.title},{examId:this.examId})
        console.log("导出参数",param)
        downFile(this.url.exportXlsUrl,param).then((data)=>{
          if (!data) {
            this.$message.warning("文件下载失败")
            return
          }
          if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(new Blob([data],{type: 'application/vnd.ms-excel'}), fileName+'.xls')
          }else{
            let url = window.URL.createObjectURL(new Blob([data],{type: 'application/vnd.ms-excel'}))
            let link = document.createElement('a')
            link.style.display = 'none'
            link.href = url
            link.setAttribute('download', fileName+'.xls')
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link); //下载完成移除元素
            window.URL.revokeObjectURL(url); //释放掉blob对象
          }
        })
      },
      /* 文件下载 */
      // update--autor:lvdandan-----date:20200630------for：修改下载文件方法名uploadFile改为downloadFile------
      downloadFile(text){
        if(!text){
          this.$message.warning("未知的文件")
          return;
        }
        if(text.indexOf(",")>0){
          text = text.substring(0,text.indexOf(","))
        }
        let url = getFileAccessHttpUrl(text)
        window.open(url);
      },
    },
  }
</script>
<style scoped>
@import '~@assets/less/common.less';
.disabled {
  pointer-events: none;
  filter: alpha(opacity=50); /*IE滤镜，透明度50%*/
  -moz-opacity: 0.5; /*Firefox私有，透明度50%*/
  opacity: 0.5; /*其他，透明度50%*/
}
</style>