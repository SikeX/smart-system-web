<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="审核状态">
              <a-select v-model="queryParam.verifyStatus" placeholder="请选择审核状态">
                <a-select-option value="0">不通过</a-select-option>
                <a-select-option value="1">通过</a-select-option>
                <a-select-option value="2">待审核</a-select-option>
                <a-select-option value="3">免审</a-select-option>
                <a-select-option value="4">待提交</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <a-form-item label="单位">
              <!-- <a-input placeholder="请输入单位" v-model="queryParam.departId"></a-input> -->
              <j-select-depart
                placeholder="请选择单位"
                v-model="queryParam.departId"
                customReturnField="id"
                :multi="false"
                :treeOpera="true"
              ></j-select-depart>
            </a-form-item>
          </a-col>
          <a-col :xl="6" :lg="7" :md="8" :sm="24">
            <span style="float: left; overflow: hidden" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <!-- <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a> -->
            </span>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <!-- <a-button @click="handleAdd" type="primary" icon="plus">新增婚前报备</a-button> -->
      <a-button type="primary" icon="download" @click="handleExportXls('8项规定婚后报备表')"
        >导出婚后报备Excel</a-button
      >
      <a-upload
        name="file"
        :showUploadList="false"
        :multiple="false"
        :headers="tokenHeader"
        :action="importExcelUrl"
        @change="handleImportExcel"
      >
        <!-- <a-button type="primary" icon="import">导入</a-button> -->
      </a-upload>
      <!-- 高级查询区域 -->
      <j-super-query
        :fieldList="superFieldList"
        ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"
      ></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>

      <a-button @click="saveFiles" type="primary" icon="download">导出婚后报备word</a-button>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
        <a style="font-weight: 600">{{ selectedRowKeys.length }}</a
        >项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        bordered
        rowKey="id"
        class="j-table-force-nowrap"
        :scroll="{ x: true }"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        @change="handleTableChange"
      >
        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无图片</span>
          <img
            v-else
            :src="getImgView(text)"
            height="25px"
            alt=""
            style="max-width: 80px; font-size: 12px; font-style: italic"
          />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a-popconfirm title="确定提交吗，提交后不可再修改?" @confirm="() => submitVerify(record)">
            <a v-if="record.verifyStatus === '4'">提交审核</a>
          </a-popconfirm>

          <a v-show="record.isReport == '0' || record.isReport == '15'" @click="postAdd(record)">婚后报备</a>
          <a v-show="record.isReport == '1'" @click="postAdd(record)">已婚后报备</a>

          <!-- <a-divider type="vertical" />  -->

          <a-divider v-if="record.verifyStatus === '3' || record.verifyStatus === '4'" type="vertical" />

          <a v-show="record.verifyStatus === '3' || record.verifyStatus === '4'" @click="postEdit(record.id)">编辑</a>

          <!--          <a-divider v-show="record.verifyStatus === '3' || record.verifyStatus === '4'" type="vertical" />-->
          <a-divider type="vertical" />

          <a @click="postDetail(record.id)">详情</a>

          <a-divider type="vertical" />

          <a-popconfirm title="确定删除吗?" @confirm="() => postDelete(record)">
            <a v-show="record.verifyStatus == '3'">删除</a>
          </a-popconfirm>
        </span>
        <span slot="verify" slot-scope="text">
          <a-tag v-if="text == '0'" color="#f14c4c">不通过</a-tag>
          <a-tag v-if="text == '1'" color="#10bc79">通过</a-tag>
          <a-tag v-if="text == '2'" color="#29b8db">待审核</a-tag>
          <a-tag v-if="text == '3'" color="green">免审</a-tag>
          <a-tag v-if="text == '4'" color="gray">待提交</a-tag>
        </span>
      </a-table>
    </div>

    <smart-post-marriage-report-modal ref="modalForm" @refreshList="refreshList"></smart-post-marriage-report-modal>
    <!-- <smart-premarital-filing-modal ref="modalForm" @ok="modalFormOk" /> -->
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
// import SmartPremaritalFilingModal from './modules/SmartPremaritalFilingModal'
import SmartPostMarriageReportModal from './module/SmartPostMarriageReportModal'
import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'
import '@/assets/less/TableExpand.less'
import { myDownload } from '@/api/manage'

import { getAction } from '../../api/manage'

export default {
  name: 'SmartPostMarriageReportList01',
  mixins: [JeecgListMixin],
  components: {
    // SmartPremaritalFilingModal,
    SmartPostMarriageReportModal,
  },
  data() {
    return {
      showAddPost: false,
      description: '8项规定婚前报备表管理页面',
      // 表头
      columns: [
        {
          title: '审核状态',
          align: 'center',
          dataIndex: 'verifyStatus',
          scopedSlots: { customRender: 'verify' },
        },
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          },
        },
        {
          title: '人员姓名',
          align: 'center',
          dataIndex: 'peopleName',
        },
        {
          title: '人员性别',
          align: 'center',
          dataIndex: 'peopleSex_dictText',
        },
        {
          title: '人员年龄',
          align: 'center',
          dataIndex: 'peopleAge',
        },
        {
          title: '政治面貌',
          align: 'center',
          dataIndex: 'politicCou_dictText',
        },
        {
          title: '职务',
          align: 'center',
          dataIndex: 'post_dictText',
        },
        {
          title: '职级',
          align: 'center',
          dataIndex: 'postRank_dictText',
        },
        {
          title: '配偶姓名',
          align: 'center',
          dataIndex: 'spoName',
        },
        {
          title: '配偶单位',
          align: 'center',
          dataIndex: 'spoUnit',
        },
        {
          title: '配偶单位职务',
          align: 'center',
          dataIndex: 'spoUnitPos',
        },
        {
          title: '配偶政治面貌',
          align: 'center',
          dataIndex: 'spoPoliticCou_dictText',
        },
        {
          title: '结婚人姓名',
          align: 'center',
          dataIndex: 'marriedName',
        },
        {
          title: '与本人关系',
          align: 'center',
          dataIndex: 'relationWithMyself',
        },
        {
          title: '婚姻登记时间',
          align: 'center',
          dataIndex: 'marryRegistTime',
          customRender: function (text) {
            return !text ? '' : text.length > 10 ? text.substr(0, 10) : text
          },
        },
        {
          title: '婚礼时间',
          align: 'center',
          dataIndex: 'weddingTime',
          customRender: function (text) {
            return !text ? '' : text.length > 10 ? text.substr(0, 10) : text
          },
        },
        {
          title: '是否同城同地合办',
          align: 'center',
          dataIndex: 'isSameOrganized',
        },
        {
          title: '拟宴请人数',
          align: 'center',
          dataIndex: 'guestsNumber',
        },
        {
          title: '婚宴场所名称',
          align: 'center',
          dataIndex: 'banqPlaceName',
        },
        {
          title: '婚宴场所地址',
          align: 'center',
          dataIndex: 'banqPlaceAddr',
        },
        {
          title: '宴请人员范围',
          align: 'center',
          dataIndex: 'banqPersonScope',
        },
        {
          title: '拟用婚礼车辆来源',
          align: 'center',
          dataIndex: 'proCarsSource',
        },
        {
          title: '拟用婚礼车辆数量',
          align: 'center',
          dataIndex: 'proCarsNum',
        },
        {
          title: '结婚人配偶姓名',
          align: 'center',
          dataIndex: 'marrySpoName',
        },
        {
          title: '结婚人配偶单位',
          align: 'center',
          dataIndex: 'marrySpoUnit',
        },
        {
          title: '结婚人配偶单位职务',
          align: 'center',
          dataIndex: 'marrySpoUnitPos',
        },
        {
          title: '结婚人配偶父亲姓名',
          align: 'center',
          dataIndex: 'marrySpoMaleName',
        },
        {
          title: '结婚人配偶母亲姓名',
          align: 'center',
          dataIndex: 'marrySpoFemaleName',
        },
        {
          title: '结婚人配偶父亲单位',
          align: 'center',
          dataIndex: 'marrySpoMaleUnit',
        },
        {
          title: '结婚人配偶母亲单位',
          align: 'center',
          dataIndex: 'marrySpoFemaleUnit',
        },
        {
          title: '结婚人配偶父亲职务',
          align: 'center',
          dataIndex: 'marrySpoMaleUnitPos',
        },
        {
          title: '结婚人配偶母亲职务',
          align: 'center',
          dataIndex: 'marrySpoFemaleUnitPos',
        },
        // {
        //   title: '结婚人配偶父母姓名',
        //   align: 'center',
        //   dataIndex: 'marrySpoParName',
        // },
        // {
        //   title: '结婚人配偶父母单位',
        //   align: 'center',
        //   dataIndex: 'marrySpoParUnit',
        // },
        // {
        //   title: '结婚人配偶父母单位职务',
        //   align: 'center',
        //   dataIndex: 'marrySpoParUnitPos',
        // },
        {
          title: '其他需要说明的事情',
          align: 'center',
          dataIndex: 'otherMattersExp',
        },
        {
          title: '报告时间',
          align: 'center',
          dataIndex: 'reportTime',
          customRender: function (text) {
            return !text ? '' : text.length > 10 ? text.substr(0, 10) : text
          },
        },
        {
          title: '联系电话',
          align: 'center',
          dataIndex: 'contactNumber',
        },
        {
          title: '婚后报备操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' },
        },
      ],
      url: {
        list: '/smartPremaritalFiling/smartPremaritalFiling/list',
        delete: '/smartPostMarriage/smartPostMarriageReport/delete',
        deleteBatch: '/smartPostMarriage/smartPostMarriageReport/deleteBatch',
        exportXlsUrl: '/smartPostMarriage/smartPostMarriageReport/exportXls',
        importExcelUrl: '/smartPostMarriage/smartPostMarriageReport/importExcel',
        verify: '/smartPostMarriage/smartPostMarriageReport/submitVerify',
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList()
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    //刷新list
    refreshList() {
      this.loadData(1)
    },

    //婚后添加
    postAdd(record) {
      if (record.isReport == '1') {
        this.$message.error('该条记录已婚后报备！')
        return
      }

      this.$refs.modalForm.postAdd(record)
      this.$refs.modalForm.title = '添加'
      this.$refs.modalForm.disableSubmit = false
    },
    //婚后编辑
    postEdit(preId) {
      console.log(preId)
      getAction('/smartPostMarriage/smartPostMarriageReport/queryByPreId', { id: preId, preId: preId }).then(
        (record) => {
          if (record.success) {
            //传到编辑
            console.log(record)
            this.$nextTick(() => {
              this.$refs.modalForm.edit(record.result)
              this.$refs.modalForm.title = '编辑'
              this.$refs.modalForm.disableSubmit = false
            })
          } else {
            this.$message.error('未找到对应的婚后报备记录！')
            return
          }
        }
      )
    },
    //婚后详情
    postDetail(preId) {
      console.log(preId)

      getAction('/smartPostMarriage/smartPostMarriageReport/queryByPreId', { id: preId, preId: preId }).then(
        (record) => {
          if (record.success) {
            //传到编辑
            console.log(record)
            this.$nextTick(() => {
              this.$refs.modalForm.edit(record.result)
              this.$refs.modalForm.title = '详情'
              this.$refs.modalForm.disableSubmit = true
            })
          } else {
            this.$message.error('未找到对应的婚后报备记录！')
            return
          }
        }
      )
    },

    //婚后删除
    postDelete(record) {
      console.log(record)

      getAction('/smartPostMarriage/smartPostMarriageReport/queryByPreId', { id: record.id, preId: record.id }).then(
        (res) => {
          if (res.success) {
            //传到删除
            console.log(res)
            this.$nextTick(() => {
              this.handleDelete(res.result.id)
            })
          } else {
            this.$message.error('未找到对应的婚后报备记录！')
            return
          }
        }
      )
    },

    initDictConfig() {},
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'peopleId', text: '人员' })
      fieldList.push({ type: 'string', value: 'peopleName', text: '人员姓名' })
      fieldList.push({ type: 'string', value: 'peopleSex', text: '人员性别', dictCode: '	sex' })
      fieldList.push({ type: 'int', value: 'peopleAge', text: '人员年龄', dictCode: '' })
      fieldList.push({ type: 'string', value: 'politicCou', text: '政治面貌', dictCode: 'political_status' })
      fieldList.push({ type: 'string', value: 'departId', text: '单位', dictCode: '' })
      fieldList.push({ type: 'string', value: 'post', text: '职务', dictCode: 'sys_position,name,code' })
      fieldList.push({ type: 'string', value: 'postRank', text: '职级', dictCode: 'position_rank' })
      fieldList.push({ type: 'string', value: 'spoName', text: '配偶姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'spoUnit', text: '配偶单位', dictCode: '' })
      fieldList.push({ type: 'string', value: 'spoUnitPos', text: '配偶单位职务', dictCode: '' })
      fieldList.push({ type: 'string', value: 'spoPoliticCou', text: '配偶政治面貌', dictCode: 'political_status' })
      fieldList.push({ type: 'string', value: 'marriedName', text: '结婚人姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'relationWithMyself', text: '与本人关系', dictCode: '' })
      fieldList.push({ type: 'date', value: 'marryRegistTime', text: '婚姻登记时间' })
      fieldList.push({ type: 'date', value: 'weddingTime', text: '婚礼时间' })
      fieldList.push({ type: 'string', value: 'isSameOrganized', text: '是否同城同地合办', dictCode: '' })
      fieldList.push({ type: 'int', value: 'guestsNumber', text: '拟宴请人数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'banqPlaceName', text: '婚宴场所名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'banqPlaceAddr', text: '婚宴场所地址', dictCode: '' })
      fieldList.push({ type: 'string', value: 'banqPersonScope', text: '宴请人员范围', dictCode: '' })
      fieldList.push({ type: 'string', value: 'proCarsSource', text: '拟用婚礼车辆来源', dictCode: '' })
      fieldList.push({ type: 'string', value: 'proCarsNum', text: '拟用婚礼车辆数量', dictCode: '' })
      fieldList.push({ type: 'string', value: 'marrySpoName', text: '结婚人配偶姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'marrySpoUnit', text: '结婚人配偶单位', dictCode: '' })
      fieldList.push({ type: 'string', value: 'marrySpoUnitPos', text: '结婚人配偶单位职务', dictCode: '' })
      fieldList.push({ type: 'string', value: 'marrySpoParName', text: '结婚人配偶父母姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'marrySpoParUnit', text: '结婚人配偶父母单位', dictCode: '' })
      fieldList.push({ type: 'string', value: 'marrySpoParUnitPos', text: '结婚人配偶父母单位职务', dictCode: '' })
      fieldList.push({ type: 'string', value: 'otherMattersExp', text: '其他需要说明的事情', dictCode: '' })
      fieldList.push({ type: 'date', value: 'reportTime', text: '报告时间' })
      fieldList.push({ type: 'string', value: 'contactNumber', text: '联系电话', dictCode: '' })
      this.superFieldList = fieldList
    },
    saveFiles() {
      //记录id
      console.log(this.selectedRowKeys)
      console.log(this.sele)
      let ids = this.selectedRowKeys.join(',')

      if (ids.length == 0) {
        this.$message.error('请选择要导出的数据！')
        return
      }

      //下载zip文件
      myDownload('/smartPostMarriage/smartPostMarriageReport/exportWord', ids).then((res) => {
        if (res.size == 0) {
          this.$message.error('未查询到该条记录的婚后报备数据！')
          return
        }
        // 创建文件临时存储地址
        const url = window.URL.createObjectURL(new Blob([res], { type: 'application/zip' }))
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          try {
            window.navigator.msSaveOrOpenBlob(res, '附件.zip')
          } catch (e) {
            this.$message.error('下载附件失败')
          }
        } else {
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = '附件.zip'
          document.body.appendChild(link)
          link.click()
          URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        }
      })
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>