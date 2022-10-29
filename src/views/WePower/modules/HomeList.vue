<template>
  <a-list item-layout="vertical" size="large" :pagination="pagination" :data-source="data">
    <a-list-item slot="renderItem" slot-scope="item, index">
      <a-list-item-meta>
        <!-- <p>{{ item.address }}</p> -->
        <!-- <p>{{ item.name }}</p> -->
      </a-list-item-meta>
      <a-row type="flex" justify="start">
        <img alt="people img" :src="getImage(item)" width="150px" />
        <div style="padding: 0 10px">
          <h3>姓名: {{ item.name }}</h3>
          <h3 v-if="item.dangZhiBuJob">职务: {{ item.dangZhiBuJob }}</h3>
        </div>
      </a-row>
    </a-list-item>
  </a-list>
</template>

<script>
import Vue from 'vue'
import store from '@/store'

export default {
  name: 'HomeList',
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
      console.log(`${window._CONFIG['ossFileUrl']}/${item.img}`)
      return `${window._CONFIG['ossFileUrl']}/${item.img}`
    },
  },
}
</script>

<style>
</style>