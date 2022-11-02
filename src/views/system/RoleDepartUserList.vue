<template>
  <a-row :gutter='10'>
    <a-col :md='24' :sm='24'>
      <a-card :bordered='false'>
        <!-- 查询区域 -->
        <div class='table-page-search-wrapper'>
          <a-form layout='inline'>
            <a-row :gutter='24'>
              <a-col :xl='6' :lg='7' :md='8' :sm='24'>
                <a-form-item label='角色'>
                  <j-search-select-tag
                    placeholder='请选择角色'
                    v-model='currentRoleId'
                    dict='sys_role,role_name,id'
                    :async='false'>
                  </j-search-select-tag>
                </a-form-item>
              </a-col>
              <a-col :xl='6' :lg='7' :md='8' :sm='24'>
                <a-form-item label='单位'>
                  <j-select-depart placeholder='请选择单位' v-model='queryParam2.departIds' customReturnField='id'
                                   :multi='true' :treeOpera='true'></j-select-depart>
                </a-form-item>
              </a-col>
              <a-col :xl='6' :lg='7' :md='8' :sm='24'>
                <a-form-item label='用户账号'>
                  <a-input placeholder='' v-model='queryParam2.username'></a-input>
                </a-form-item>
              </a-col>
              <span style='float: left;overflow: hidden;' class='table-page-search-submitButtons'>
            <a-col :md='9' :sm='24'>
             <a-button type='primary' @click='searchQuery2' icon='search' style='margin-left: 21px'>查询</a-button>
              <a-button type='primary' @click='searchReset2' icon='reload' style='margin-left: 8px'>重置</a-button>

            </a-col>
          </span>
            </a-row>
          </a-form>
        </div>
        <!-- 操作按钮区域 -->
        <div class='table-operator' :md='24' :sm='24'>
          <a-button @click='handleAdd2' type='primary' icon='plus' style='margin-top: 16px'>新增用户
          </a-button>
          <!--<a-button @click="handleEdit2" type="primary" icon="edit" style="margin-top: 16px">用户编辑</a-button>-->
          <a-button @click='handleAddUserRole' type='primary' icon='plus' style='margin-top: 16px'>
            已有用户
          </a-button>

          <a-dropdown v-if='selectedRowKeys2.length > 0'>
            <a-menu slot='overlay'>
              <a-menu-item key='1' @click='batchDel2'>
                <a-icon type='delete' />
                删除
              </a-menu-item>
            </a-menu>
            <a-button style='margin-left: 8px'> 批量操作
              <a-icon type='down' />
            </a-button>
          </a-dropdown>
        </div>
        <!-- table区域-begin -->
        <div>
          <div class='ant-alert ant-alert-info' style='margin-bottom: 16px;'>
            <i class='anticon anticon-info-circle ant-alert-icon'></i> 已选择 <a style='font-weight: 600'>{{
              selectedRowKeys2.length }}</a>项
            <a style='margin-left: 24px' @click='onClearSelected2'>清空</a>
          </div>
          <a-table
            style='height:500px'
            ref='table2'
            bordered
            size='middle'
            rowKey='id'
            :columns='columns2'
            :dataSource='dataSource2'
            :pagination='ipagination2'
            :loading='loading2'
            :rowSelection='{selectedRowKeys: selectedRowKeys2, onChange: onSelectChange2}'
            @change='handleTableChange2'>
           <span slot='action' slot-scope='text, record'>
           <a @click='handleEdit2(record)'>编辑</a>
          <a-divider type='vertical' />
          <a-dropdown>
            <a class='ant-dropdown-link'>
              更多 <a-icon type='down' />
            </a>
            <a-menu slot='overlay'>
              <a-menu-item>
                <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete2(record.id)'>
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
          </a-table>
        </div>
        <!-- 表单区域 -->
        <role-modal ref='modalForm' @ok='modalFormOk'></role-modal>
        <user-modal ref='modalForm2' @ok='modalFormOk2'></user-modal>
        <Select-User-Modal ref='selectUserModal' @selectFinished='selectOK'></Select-User-Modal>
      </a-card>
    </a-col>
  </a-row>
</template>
<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { deleteAction, postAction, getAction } from '@/api/manage'
import SelectUserModal from './modules/SelectUserModal'
import RoleModal from './modules/RoleModal'
import UserModal from './modules/UserModal'
import { filterObj } from '@/utils/util'
import UserRoleModal from './modules/UserRoleModal'
import moment from 'moment'

export default {
  name: 'RoleUserList',
  mixins: [JeecgListMixin],
  components: {
    UserRoleModal,
    SelectUserModal,
    RoleModal,
    UserModal,
    moment
  },
  data() {
    return {
      disableMixinCreated: true,
      model2: {},
      currentRoleId: null,
      queryParam2: {},
      dataSource2: [],
      ipagination2: {
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
      isorter2: {
        column: 'createTime',
        order: 'desc'
      },
      filters2: {},
      loading2: false,
      selectedRowKeys2: [],
      selectionRows2: [],
      test: {},
      columns2: [
        {
          title: '用户账号',
          align: 'center',
          dataIndex: 'username',
          width: 120
        },
        {
          title: '姓名',
          align: 'center',
          width: 100,
          dataIndex: 'realname',
        },
        {
          title: '性别',
          align: 'center',
          width: 80,
          dataIndex: 'sex_dictText',
        },
        {
          title: '出生日期',
          align: 'center',
          width: 100,
          dataIndex: 'birthday',
        },
        {
          title: '手机号码',
          align: 'center',
          width: 100,
          dataIndex: 'phone',
        },
        {
          title: '单位',
          align: 'center',
          width: 180,
          dataIndex: 'departId_dictText',
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          align: 'center',
          width: 120
        }],

      // 高级查询参数
      superQueryParams2: '',
      // 高级查询拼接条件
      superQueryMatchType2: 'and',
      url: {
        list2: '/sys/user/userRoleList',
        addUserRole: '/sys/user/addSysUserRole',
        delete2: '/sys/user/deleteUserRole',
        deleteBatch2: '/sys/user/deleteUserRoleBatch'
      }
    }
  },
  methods: {
    onSelectChange2(selectedRowKeys, selectionRows) {
      this.selectedRowKeys2 = selectedRowKeys
      this.selectionRows2 = selectionRows
    },
    onClearSelected2() {
      this.selectedRowKeys2 = []
      this.selectionRows2 = []
    },
    onClearSelected() {
    },

    getQueryParams2() {
      //获取查询条件
      let sqp = {}
      if (this.superQueryParams2) {
        sqp['superQueryParams'] = encodeURI(this.superQueryParams2)
        sqp['superQueryMatchType'] = this.superQueryMatchType2
      }
      var param = Object.assign(sqp, this.queryParam2, this.isorter2, this.filters2)
      param.field = this.getQueryField2()
      param.pageNo = this.ipagination2.current
      param.pageSize = this.ipagination2.pageSize
      return filterObj(param)
    },
    getQueryField2() {
      //TODO 字段权限控制
      var str = 'id,'
      this.columns2.forEach(function(value) {
        str += ',' + value.dataIndex
      })
      return str
    },
    handleEdit2: function(record) {
      this.$refs.modalForm2.title = '编辑'
      this.$refs.modalForm2.roleDisabled = true
      this.$refs.modalForm2.edit(record)
    },
    handleAdd2: function() {
      if (this.currentRoleId == null || this.currentRoleId == '') {
        this.$message.error('请选择一个角色!')
      } else {
        this.$refs.modalForm2.roleDisabled = true
        this.$refs.modalForm2.title = '新增'
        this.$refs.modalForm2.edit({ activitiSync: '1', userIdentity: 1, selectedroles: this.currentRoleId })
      }
    },
    modalFormOk2() {
      // 新增/修改 成功时，重载列表
      this.loadData2()
    },
    loadData2(arg) {
      if (!this.url.list2) {
        this.$message.error('请设置url.list2属性!')
        return
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination2.current = 1
      }
      let params = this.getQueryParams2()//查询条件
      params.roleId = this.currentRoleId
      this.loading2 = true
      getAction(this.url.list2, params).then((res) => {
        if (res.success) {
          this.dataSource2 = res.result.records
          this.ipagination2.total = res.result.total
        } else {
          this.$message.warning(res.message)
          this.dataSource2 = []
          this.ipagination2.total = 0
        }
        this.loading2 = false
      })

    },
    handleDelete2: function(id) {
      if (!this.url.delete2) {
        this.$message.error('请设置url.delete2属性!')
        return
      }
      var that = this
      deleteAction(that.url.delete2, { roleId: this.currentRoleId, userId: id }).then((res) => {
        if (res.success) {
          that.$message.success(res.message)
          that.loadData2()
        } else {
          that.$message.warning(res.message)
        }
      })
    },
    batchDel2: function() {

      if (!this.url.deleteBatch2) {
        this.$message.error('请设置url.deleteBatch2属性!')
        return
      }
      if (this.selectedRowKeys2.length <= 0) {
        this.$message.warning('请选择一条记录！')
        return
      } else {
        var ids = ''
        for (var a = 0; a < this.selectedRowKeys2.length; a++) {
          ids += this.selectedRowKeys2[a] + ','
        }
        var that = this
        console.log(this.currentDeptId)
        this.$confirm({
          title: '确认删除',
          content: '是否删除选中数据?',
          onOk: function() {
            deleteAction(that.url.deleteBatch2, { roleId: that.currentRoleId, userIds: ids }).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.loadData2()
                that.onClearSelected()
              } else {
                that.$message.warning(res.message)
              }
            })
          }
        })
      }
    },
    selectOK(data) {
      let params = {}
      params.roleId = this.currentRoleId
      params.userIdList = []
      for (var a = 0; a < data.length; a++) {
        params.userIdList.push(data[a])
      }
      console.log(params)
      postAction(this.url.addUserRole, params).then((res) => {
        if (res.success) {
          this.loadData2()
          this.$message.success(res.message)
        } else {
          this.$message.warning(res.message)
        }
      })
    },

    handleAddUserRole() {
      if (this.currentRoleId == null || this.currentRoleId == '') {
        this.$message.error('请选择一个角色!')
      } else {
        this.$refs.selectUserModal.visible = true
      }
    },
    handleOpen(record) {
      this.rightcolval = 1
      this.selectedRowKeys1 = [record.id]
      this.model1 = Object.assign({}, record)
      this.currentRoleId = record.id
      this.onClearSelected2()
      this.loadData2()
    },
    /*handleEdit: function(record) {
      if (this.currentRoleId == '') {
        this.$message.error('请选择一个角色!')
      } else {
        this.$refs.modalForm.edit(record)
        this.$refs.modalForm.title = '编辑'
      }
    },*/
    searchQuery2() {
      this.loadData2(1)
    },
    searchReset2() {
      this.queryParam2 = {}
      this.loadData2(1)
    },
    handleTableChange2(pagination, filters, sorter) {
      //分页、排序、筛选变化时触发
      //TODO 筛选
      if (Object.keys(sorter).length > 0) {
        this.isorter2.column = sorter.field
        this.isorter2.order = 'ascend' == sorter.order ? 'asc' : 'desc'
      }
      this.ipagination2 = pagination
      this.loadData2()
    },
    hideUserList() {
      //this.rightcolval = 0
      this.selectedRowKeys1 = []
    },
    handlePerssion(roleId) {
      this.$refs.modalUserRole.show(roleId)
    }
  }
}
</script>
<style scoped>
/** Button按钮间距 */
.ant-btn {
  margin-left: 8px
}
</style>