<template>
  <j-modal
    :width="modalWidth"
    :visible="visible"
    :title="title"
    switchFullscreen
    wrapClassName="j-user-select-modal"
    @ok="handleSubmit"
    @cancel="close"
    style="top:50px"
    cancelText="关闭"
  >
    <a-row :gutter="10" style="background-color: #ececec; padding: 10px; margin: -10px">
      <a-col :md="6" :sm="24">
        <a-card :bordered="false" >
          <!--组织机构-->
          <a-directory-tree
            selectable
            :selectedKeys="selectedDepIds"
            :checkStrictly="true"
            :dropdownStyle="{maxHeight:'200px',overflow:'auto'}"
            :treeData="naturalDepartTree"
            :expandAction="false"
            :expandedKeys.sync="expandedKeys"
            @select="onDepSelect"

          />
        </a-card>
      </a-col>
     <a-col :md="18" :sm="24">
      <a-col>
        <a-card :bordered="false">
          姓名:
          <a-input-search
            :style="{width:'150px',marginBottom:'15px'}"
            placeholder="请输入姓名"
            v-model="queryParam.realname"
            @search="onSearch"
          ></a-input-search>
          <a-button @click="searchReset(1)" style="margin-left: 20px" icon="redo">重置</a-button>
          <!--用户列表-->
          <a-table
            ref="table"
            :scroll="scrollTrigger"
            size="middle"
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :pagination="ipagination"
            :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange,type: getType}"
            :loading="loading"
            @change="handleTableChange">
          </a-table>
        </a-card>
      </a-col>
     </a-col>
    </a-row>
  </j-modal>
</template>

<script>
  import { pushIfNotExist, filterObj } from '@/utils/util'
  import {queryDepartTreeList, getUserList, queryUserByDepId,queryVillageIdTree} from '@/api/api'
  import { getAction } from '@/api/manage'

  export default {
    name: 'SelectUserByVillageModal',
    components: {},
    props: ['modalWidth', 'multi', 'userIds', 'store', 'text','flag'],
    data() {
      return {
        naturalDepartTree: [],
        queryParam: {
          peopleType: 2
        },
        columns: [
/*          {
            title: '工号',
            align: 'center',
            dataIndex: 'workNo'
          },*/
          // {
          //   title: '账号',
          //   align: 'center',
          //   dataIndex: 'username'
          // },
          {
            title: '户口本编号',
            align: 'center',
            dataIndex: 'homeCode'
          },
          {
            title: '亲属关系',
            align: 'center',
            dataIndex: 'relation_dictText'
          },
          {
            title: '姓名',
            align: 'center',
            dataIndex: 'realname'
          },
          {
            title: '性别',
            align: 'center',
            dataIndex: 'sex',
            customRender: function (text) {
              if (text === 1) {
                return '男'
              } else if (text === 2) {
                return '女'
              } else {
                return text
              }
            }
          },
          {
            title: '手机号码',
            align: 'center',
            dataIndex: 'phone'
          },
          {  title: '村',
            align: 'center',
            dataIndex: 'orgCodeTxt'
          },
          // {  title: '职务',
          //   align: 'center',
          //   dataIndex: 'post_dictText'
          // },
          // {  title: '职级',
          //   align: 'center',
          //   dataIndex: 'positionRank_dictText'
          // },
          {  title: '角色',
            align: 'center',
            dataIndex: 'role',
            customRender: function (text) {
              if (text == '1463074308371800066') {
                return '村长'
              } else if (text == '1463112478345588738') {
                return '村民'
              } else {
                return '非村民'
              }
            }
          },
        ],
        scrollTrigger: {},
        dataSource: [],
        selectionRows: [],
        selectedRowKeys: [],
        selectUserRows: [],
        selectUserIds: [],
        title: '选择人员',
        ipagination: {
          current: 1,
          pageSize: 10,
          pageSizeOptions: ['10', '20', '30'],
          showTotal: (total, range) => {
            return range[0] + '-' + range[1] + ' 共' + total + '条'
          },
          showQuickJumper: true,
          showSizeChanger: true,
          total: 0
        },
        isorter: {
          column: 'createTime',
          order: 'desc'
        },
        selectedDepIds: ['b52392aa3f914019bb41d29d6f99c1b5'],
        departTree: [],
        visible: false,
        form: this.$form.createForm(this),
        loading: false,
        expandedKeys: [],
      }
    },
    computed: {
      // 计算属性的 getter
      getType: function () {
        return this.multi == true ? 'checkbox' : 'radio';
      }
    },
    watch: {
      userIds: {
        immediate: true,
        handler() {
          this.initUserNames()
        }
      },
    },
    created() {
      // 该方法触发屏幕自适应
      this.resetScreenSize();
      this.loadData();
      this.loadNaturalTree()
    },
    methods: {
      initUserNames() {
        if (this.userIds) {
          // 这里最后加一个 , 的原因是因为无论如何都要使用 in 查询，防止后台进行了模糊匹配，导致查询结果不准确
          let values = this.userIds.split(',') + ','
          let param = {[this.store]: values}
          getAction('/sys/user/getMultiUser', param).then((list)=>{
            this.selectionRows = []
            let selectedRowKeys = []
            let textArray = []
            if(list && list.length>0){
              for(let user of list){
                textArray.push(user[this.text])
                selectedRowKeys.push(user['id'])
                this.selectionRows.push(user)
              }
            }
            this.selectedRowKeys = selectedRowKeys
            this.$emit('initComp', textArray.join(','))
          })

        } else {
          // JSelectUserByDep组件bug issues/I16634
          this.$emit('initComp', '')
          // 前端用户选择单选无法置空的问题 #2610
          this.selectedRowKeys = []
        }
      },
      async loadData(arg) {
        if (arg === 1) {
          this.ipagination.current = 1;
        }
        let params = this.getQueryParams()//查询条件
        //console.log(params)
        this.loading = true
        // let url = null;
        // if(this.flag == true){
        //   //过滤
        //   url = '/sys/user/newQueryUserComponentData';
        // }else{
        //   全部人员
        //   url = '/sys/user/queryUserComponentData';
        // }
        getAction('/sys/user/queryVillageComponentData', params).then(res=>{
          if (res.success) {
            console.log(res.result.records)
            this.dataSource = res.result.records
            this.ipagination.total = res.result.total
          }
        }).finally(() => {
          this.loading = false
        })
      },
      // 触发屏幕自适应
      resetScreenSize() {
        let screenWidth = document.body.clientWidth;
        if (screenWidth < 500) {
          this.scrollTrigger = {x: 800};
        } else {
          this.scrollTrigger = {};
        }
      },
      showModal() {
        this.visible = true;
        this.queryDepartTree();
        this.initUserNames()
        this.loadData();
        this.form.resetFields();
      },
      getQueryParams() {
        let param = Object.assign({}, this.queryParam, this.isorter);
        param.field = this.getQueryField();
        param.pageNo = this.ipagination.current;
        param.pageSize = this.ipagination.pageSize;
        param.departId = this.selectedDepIds.join(',')
        return filterObj(param);
      },
      getQueryField() {
        let str = 'id,';
        for (let a = 0; a < this.columns.length; a++) {
          str += ',' + this.columns[a].dataIndex;
        }
        return str;
      },
      searchReset(num) {
        let that = this;
        that.selectedRowKeys = [];
        that.selectUserIds = [];
        that.selectedDepIds = ['b52392aa3f914019bb41d29d6f99c1b5'];
        if (num !== 0) {
          that.queryParam = { realname: "",
            peopleType: 2};
          that.loadData(1);
        }
      },
      close() {
        this.searchReset(0);
        this.visible = false;
      },
      handleTableChange(pagination, filters, sorter) {
        //TODO 筛选
        if (Object.keys(sorter).length > 0) {
          this.isorter.column = sorter.field;
          this.isorter.order = 'ascend' === sorter.order ? 'asc' : 'desc';
        }
        this.ipagination = pagination;
        this.loadData();
      },
      handleSubmit() {
        let that = this;
        this.getSelectUserRows();
        that.$emit('ok', that.selectUserRows);
        that.searchReset(0)
        that.close();
      },
      //获取选择用户信息
      getSelectUserRows() {
        this.selectUserRows = []
        for (let row of this.selectionRows) {
          if (this.selectedRowKeys.includes(row.id)) {
            this.selectUserRows.push(row)
          }
        }
        this.selectUserIds = this.selectUserRows.map(row => row.username).join(',')
      },
      // 点击树节点,筛选出对应的用户
      onDepSelect(selectedDepIds) {
        if (selectedDepIds[0] != null) {
          if (this.selectedDepIds[0] !== selectedDepIds[0]) {
            this.selectedDepIds = [selectedDepIds[0]];
          }
          this.loadData(1);
        }
      },
      onSelectChange(selectedRowKeys, selectionRows) {
        this.selectedRowKeys = selectedRowKeys;
        selectionRows.forEach(row => pushIfNotExist(this.selectionRows, row, 'id'))
      },
      onSearch() {
        this.loadData(1);
      },
      // 根据选择的id来查询用户信息
      initQueryUserByDepId(selectedDepIds) {
        this.loading = true
        return queryUserByDepId({id: selectedDepIds.toString()}).then((res) => {
          if (res.success) {
            this.dataSource = res.result;
            this.ipagination.total = res.result.length;
          }
        }).finally(() => {
          this.loading = false
        })
      },
      loadNaturalTree() {
        var that = this;
        this.naturalDepartTee = []
        queryVillageIdTree().then((res)=>{
          if(res.success){
            that.naturalDepartTree = [];
            for (let j = 0; j < res.result.length; j++) {
              let temp = res.result[j];
              that.naturalDepartTree.push(temp);
            }
          }

        })
      },
     /* queryDepartTree() {
        queryDepartTreeList().then((res) => {
          if (res.success) {
            this.departTree = res.result;
            // 默认展开父节点
            this.expandedKeys = this.departTree.map(item => item.id)
          }
        })
      },*/
      modalFormOk() {
        this.loadData();
      }
    }
  }
</script>

<style scoped>
  .ant-table-tbody .ant-table-row td {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  #components-layout-demo-custom-trigger .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color .3s;
  }
</style>