<template>
  <j-modal
    :title='title'
    :width='width'
    :visible='visible'
    switchFullscreen
    @ok='handleOk'
    :okButtonProps="{ class:{'jee-hidden': true} }"
    @cancel='handleCancel'
    cancelText='关闭'>

    <a-form-model layout='inline' @submit.native.prevent>
      <a-form-model-item>
        <a-input v-model:value='searchText' placeholder='过滤搜索单位'>
          <a-icon slot='prefix' type='cluster' style='color:rgba(0,0,0,.25)' />
        </a-input>
      </a-form-model-item>
      <a-form-model-item>
        <a-button @click='clearFilters'>
          清空筛选
        </a-button>
      </a-form-model-item>
    </a-form-model>

<!--    <a-input-search v-model:value='searchValue' style='margin-bottom: 8px' placeholder='过滤搜索' />-->

    <a-table :columns='columns'
             rowKey='id'
             :dataSource='dataSource'
             :pagination='ipagination'
             size='small'
             @change='handleTableChange'>
      <template slot='customRender' slot-scope='text, record, index, column'>
        <span v-if='searchText && searchedColumn === column.dataIndex'>
          <template
            v-for="(fragment, i) in text
              .toString()
              .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))"
          >
            <mark
              v-if='fragment.toLowerCase() === searchText.toLowerCase()'
              :key='i'
              class='highlight'
            >{{ fragment }}</mark>
            <template v-else>{{ fragment }}</template>
          </template>
        </span>
        <template v-else>
          {{ text }}
        </template>
      </template>
    </a-table>
  </j-modal>
</template>

<script>

export default {
  name: 'DepartListModal',
  components: {},
  data() {
    return {
      title: '负责单位列表',
      width: 800,
      visible: false,
      disableSubmit: false,
      searchText: null,
      filteredInfo: {
        departName: []
      },
      searchedColumn: 'departName',
      dataSource: [],
      /* 分页参数 */
      ipagination: {
        pageSize: 10,
        pageSizeOptions: ['10', '20', '30'],
        showTotal: (total, range) => {
          return range[0] + '-' + range[1] + ' 共' + total + '条'
        },
        showSizeChanger: true,
      }
    }
  },
  props: {
    // 存储字段 [key field]
    store: {
      type: String,
      default: 'departs',
      required: false
    },
    // 显示字段 [label field]
    text: {
      type: String,
      default: 'departs_dictText',
      required: false
    },
  },
  watch: {
    searchText(val) {
      this.filteredInfo = {
        departName: [val]
      }
    }
  },
  computed: {
    columns() {
      let { filteredInfo } = this
      filteredInfo = filteredInfo || {}
      const columns = [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function(t, r, index) {
            return parseInt(index) + 1
          }
        },
        {
          title: '单位名称',
          align: 'center',
          dataIndex: 'departName',
          key: 'departName',
          scopedSlots: {
            customRender: 'customRender'
          },
          filteredValue: filteredInfo.departName || null,
          onFilter: (value, record) => record.departName
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase()),
        }
      ]
      return columns
    }
  },
  methods: {
    clearFilters() {
      this.searchText = ''
    },
    edit(record) {
      this.visible = true
      if (record[this.text]) {
        let departIdList = record[this.store].split(',')
        let departNameList = record[this.text].split(',')
        for (let i = 0; i < departNameList.length; i++) {
          this.dataSource.push({
            id: departIdList[i],
            departName: departNameList[i]
          })
        }
      }
    },
    handleTableChange(pagination, filters, sorter) {
      //分页、排序、筛选变化时触发
      this.ipagination = pagination
      this.filteredInfo = filters
    },
    close() {
      this.$emit('close')
      this.dataSource = []
      this.ipagination.current = 1
      this.clearFilters()
      this.visible = false
    },
    handleOk() {
      this.close()
    },
    submitCallback() {
      this.$emit('ok')
      this.visible = false
    },
    handleCancel() {
      this.close()
    }
  }
}
</script>
<style scoped>
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
</style>