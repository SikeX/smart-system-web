<template>
  <a-list item-layout="vertical" size="large" :pagination="pagination" :data-source="data">
    <a-list-item slot="renderItem" slot-scope="item, index">
      <a-list-item-meta> </a-list-item-meta>
      <a-row type="flex" justify="start">
        <div style="padding: 0 10px">
          <h3>资产名称: {{ item.name }}</h3>
          <h3>资产分类: {{ item.category_dictText }}</h3>
        </div>
        <img alt="资产图片" :src="getImage(item)" width="150px" />
      </a-row>
    </a-list-item>
  </a-list>
</template>

<script>
import Vue from 'vue'
import store from '@/store'

export default {
  name: 'ResourceList',
  components: {},
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