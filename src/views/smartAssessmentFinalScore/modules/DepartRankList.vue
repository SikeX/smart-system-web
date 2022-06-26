<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='单位'>
              <j-select-depart placeholder='请选择单位' v-model='queryParam.depart' customReturnField='id' :multi='true' :treeOpera='true'></j-select-depart>
            </a-form-item>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <span style='float: left;overflow: hidden;' class='table-page-search-submitButtons'>
              <a-button type='primary' @click='searchQuery' icon='search'>查询</a-button>
              <a-button type='primary' @click='searchReset' icon='reload' style='margin-left: 8px'>重置</a-button>
              <a @click='handleToggleSearch' style='margin-left: 8px'>
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
              </a>
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button v-if='isShow' @click="updateRank" type="primary">更新排名</a-button>
      <!-- 高级查询区域 -->
      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
    </div>

    <!-- table区域-begin -->
    <div>

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
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
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
          </a-dropdown>
        </span>

      </a-table>
    </div>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'
  import { getAction, putAction } from '@api/manage'

  export default {
    name: 'DepartRankList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
    },
    props: {
      mainId: {
        type: String,
        default: '',
        required: false
      },
      isShow: {
        type: Boolean,
        default: true,
        required: false
      },
    },
    watch: {
      // 选择的 missionId
      mainId: {
        immediate: true,
        handler(val) {
          this.loadData(1)
        }
      }
    },
    data () {
      return {
        description: '答题信息表管理页面',
        disableMixinCreated: true,
        // 表头
        columns: [
          {
            title:'单位',
            align:"center",
            dataIndex: 'depart_dictText'
          },
          {
            title:'任务状态',
            align:"center",
            dataIndex: 'missionStatus'
          },
          {
            title:'总分',
            align:"center",
            dataIndex: 'totalPoints'
          },
          {
            title:'排名',
            align:"center",
            dataIndex: 'ranking'
          },
        ],
        url: {
          list: "/smartAnswerInfo/smartAnswerInfo/listAll",
          generateRank: "/smartAssessmentMission/smartAssessmentMission/generateRank",
        },
        dictOptions:{},
        superFieldList:[],

        isorter:{
          column: 'ranking',
          order: 'asc',
        },
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
      loadData(arg) {
        if(!this.url.list){
          this.$message.error("请设置url.list属性!")
          return
        }
        //加载数据 若传入参数1则加载第一页的内容
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        var params = this.getQueryParams();//查询条件
        params['missionId'] = this.mainId
        this.loading = true;
        getAction(this.url.list, params).then((res) => {
          if (res.success) {
            //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
            this.dataSource = res.result.records||res.result;
            if(res.result.total)
            {
              this.ipagination.total = res.result.total;
            }else{
              this.ipagination.total = 0;
            }
            //update-end---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
          }else{
            this.$message.warning(res.message)
          }
        }).finally(() => {
          this.loading = false
        })
      },
      updateRank() {
        this.loading = true
        putAction(this.url.generateRank, {id: this.mainId}).then((res) => {
          if (res.success) {
            this.loadData(1)
            this.$message.success(res.message)
          } else {
            this.$message.warning(res.message)
          }
        }).finally(()=> {
          this.loading = false;
        })
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'sel_depart',value:'depart',text:'单位'})
        fieldList.push({type:'string',value:'missionStatus',text:'任务状态',dictCode:''})
        fieldList.push({type:'int',value:'finishedPoint',text:'完成要点个数',dictCode:''})
        fieldList.push({type:'double',value:'completionDegree',text:'完成度',dictCode:''})
        fieldList.push({type:'int',value:'totalPoints',text:'总分',dictCode:''})
        fieldList.push({type:'int',value:'ranking',text:'排名',dictCode:''})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>