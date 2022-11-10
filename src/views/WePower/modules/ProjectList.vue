<template>
  <div>
    <h3>资金总额: {{ totalMoney }}</h3>
    <h3>项目列表:</h3>
    <a-list item-layout="vertical" size="large" :pagination="pagination" :data-source="data">
      <a-list-item slot="renderItem" slot-scope="item, index">
        <a-list-item-meta> </a-list-item-meta>
        <a-row type="flex" justify="start">
          <div style="padding: 0 10px">
            <h3>项目名称: {{ item.title }}</h3>
            <h3>项目金额: {{ item.money }}</h3>
          </div>
          <!-- <img alt="资产图片" :src="getImage(item)" width="150px" /> -->
        </a-row>
      </a-list-item>
    </a-list>
  </div>
</template>

<script>
import Vue from 'vue'
import store from '@/store'

export default {
  name: 'ProjectList',
  components: {},
  computed: {
    totalMoney() {
      let total = 0
      this.data.forEach((item) => {
        total += parseInt(item.money)
      })
      return total
    },
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      filePath: window._CONFIG['ossFileUrl'],
      pagination: {
        onChange: (page) => {
          console.log(page)
        },
        pageSize: 5,
      },
    }
  },
  methods: {
    getImage(item) {
      console.log(`${window._CONFIG['ossFileUrl']}/${item.picture.split(',')[0]}`)
      return `${window._CONFIG['ossFileUrl']}/${item.picture.split(',')[0]}`
    },
  },
}
</script>

<style>
</style>