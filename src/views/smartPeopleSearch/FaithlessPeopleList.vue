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


      </a-table>
    </div>
  </a-card>
</template>

<script>
  import { mapActions, mapGetters,mapState } from 'vuex'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import '@/assets/less/TableExpand.less'
  import AFormItem from 'ant-design-vue/es/form/FormItem'
  import Vue from 'vue'
  import { ACCESS_TOKEN, TENANT_ID } from "@/store/mutation-types"

  export default {
    name: "FaithlessPeopleList",
    mixins: [JeecgListMixin],
    components: {
      AFormItem,
    },
    data() {
      return {
        /* 数据源 */
        dataSource: [],
        /* 分页参数 */
        ipagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + "-" + range[1] + " 共" + total + "条"
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
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
        queryParam: [],
        description: '失信执行人列表',
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
            title: '姓名',
            align: "center",
            dataIndex: 'iname',
          },
          {
            title: '性别',
            align: "center",
            dataIndex: 'sexname',

          },
          {
            title: '年龄',
            align: "center",
            dataIndex: 'age',

          },
          {
            title: '省份',
            align: "center",
            dataIndex: 'areaname',
          },
          // {
          //   title: '发布时间',
          //   align: "center",
          //   dataIndex: 'publishdate',
          // },
          {
            title: '立案时间',
            align: "center",
            dataIndex: 'regdate',

          },
          {
            title: '案号',
            align: "center",
            dataIndex: 'casecode',
          },
          {
            title: '执行依据文号',
            align: "center",
            dataIndex: 'gistcid',
          },
          {
            title: '执行法院',
            align: "center",
            dataIndex: 'courtname',
          },
        ],
        url: {},
        dictOptions: {},
        superFieldList: [],
        roleId: []
      }
    },
    created() {
      if (!this.disableMixinCreated) {
        console.log(' -- mixin created -- ')
        this.loadData();
        //初始化字典配置 在自己页面定义
        this.initDictConfig();
      }
    },
    computed: {
      //token header
      tokenHeader() {
        let head = { 'X-Access-Token': Vue.ls.get(ACCESS_TOKEN) }
        let tenantid = Vue.ls.get(TENANT_ID)
        if (tenantid) {
          head['tenant-id'] = tenantid
        }
        return head;
      }
    },
    methods: {
      loadData(res) {
        console.log("loadData"+res)
        //update-begin---author:zhangyafei    Date:20201118  for：适配不分页的数据列表------------
        this.dataSource = res.result.records || res.result;
        if (res.result.total) {
          this.ipagination.total = res.result.total;
        } else {
          this.ipagination.total = 0;
        }
      },
      initDictConfig() {
      },

    },
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>