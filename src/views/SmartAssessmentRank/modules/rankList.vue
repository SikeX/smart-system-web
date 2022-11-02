<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24"> </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <a-button :style="{ margin: '5px 0' }" type="primary" icon="download" @click="saveFiles('排名表')">导出</a-button>
    <!-- table区域-begin -->
    <div>
      <a-table
        ref="table"
        size="middle"
        bordered
        class="j-table-force-nowrap"
        :scroll="{ x: true }"
        :columns="columns"
        :dataSource="dataSource"
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
      </a-table>
    </div>
  </a-card>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import '@/assets/less/TableExpand.less'
import { getAction } from '@/api/manage'
import { downFile, myDownload } from '../../../api/manage'

export default {
  name: 'rankList',
  // mixins:[JeecgListMixin],
  components: {},
  props: {
    id: String,
    title: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      description: '附件测试主表管理页面',
      // title: '得分排名附件',
      // 表头
      columns: [],
      dataSource: [],
      url: {
        list: '/smartAnswerInfo/rank/getRankById',
        importExcelUrl: 'testAttached/testAttached/importExcel',
        exportWord: '/smartAnswerInfo/rank/exportWord',
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created() {
    this.getSuperFieldList()
    this.getColumn()
    this.loadData()
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    loadData() {
      const dataSource = []
      getAction('/smartAnswerInfo/rank/getRankById', { id: this.id }).then((res) => {
        if (res.success) {
          res.result.forEach((element) => {
            let tmp = {}
            tmp = { ...element, ...element.scoreMap }
            dataSource.push(tmp)
          })
          this.dataSource = dataSource
          console.log(this.dataSource)
        }
      })
    },
    getColumn() {
      const columns = [
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
          title: '单位',
          dataIndex: 'departName',
          width: 60,
          align: 'center',
        },
      ]

      getAction('/smartRankVisible/smartRankVisible/queryByMissionId', { missionId: this.id }).then((res) => {
        if (res.success) {
          res.result.forEach((element) => {
            if (element.visible === '1') {
              let tmp = {}
              tmp.title = element.contentName
              tmp.dataIndex = element.contentId
              // tmp.width = 60
              tmp.align = 'center'
              columns.push(tmp)
            }
          })
          // columns = [...columns,...this.cosntColumns]
          // console.log(columns)
          this.columns = [...columns]
          console.log(columns)
        }
      })
    },
    getScoreType() {
      console.log(this.id)

      const columns = [
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
          title: '单位',
          dataIndex: 'departName',
          key: 'rowIndex',
          width: 60,
          align: 'center',
        },
      ]
      getAction('/smartAnswerInfo/rank/getScoreTypeById', { id: this.id }).then((res) => {
        if (res.success) {
          res.result.forEach((element) => {
            let tmp = {}
            tmp.title = element.name
            tmp.dataIndex = element.id
            // tmp.width = 60
            tmp.align = 'center'
            columns.push(tmp)
          })
          // columns = [...columns,...this.cosntColumns]
          // console.log(columns)
          this.columns = [...columns, ...this.cosntColumns]
          console.log(res.result)
        }
      })
    },
    saveFiles() {
      //下载zip文件
      myDownload(this.url.exportWord, this.id).then((res) => {
        if (!res) {
          console.log('lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllll')
          return
        }
        // 创建文件临时存储地址
        const url = window.URL.createObjectURL(new Blob([res], { type: 'application/msword' }))
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
          try {
            window.navigator.msSaveOrOpenBlob(res, `${this.title}`.doc)
          } catch (e) {
            this.$message.error('下载附件失败')
          }
        } else {
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = '得分排名附件.doc'
          document.body.appendChild(link)
          link.click()
          URL.revokeObjectURL(link.href)
          document.body.removeChild(link)
        }
      })
    },
    initDictConfig() {},
    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'testDesc', text: '说明', dictCode: '' })
      this.superFieldList = fieldList
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>