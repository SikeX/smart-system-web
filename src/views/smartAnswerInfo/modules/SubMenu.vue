<template>
  <a-sub-menu :key="menuInfo.assContentId" v-bind="$props" v-on="$listeners" >
        <span slot="title">
          <span>{{ menuInfo.assContentId_dictText }}</span>
        </span>
    <template v-for="item in menuInfo.children">
      <a-menu-item v-if="item.isKey === 1" :key="item.id + ',' + item.assContentId">
        <div v-if='item.uploadCount'>
          <a-icon type='check-square' theme='twoTone' />
          <span>{{ item.assContentId_dictText }}</span>
          <el-badge :value="item.uploadCount" :max="99" type="primary"/>
        </div>
        <div v-else>
          <a-icon type="edit" theme="twoTone" />
          <span>{{ item.assContentId_dictText }}</span>
          <el-badge :value="item.uploadCount" :max="99" />
        </div>
      </a-menu-item>
      <sub-menu v-else :key="item.id + ',' + item.assContentId" :menu-info="item"/>
    </template>
  </a-sub-menu>
</template>

<script>
import { Menu } from 'ant-design-vue';

export default {
  name: 'SubMenu',
  // must add isSubMenu: true
  isSubMenu: true,
  props: {
    ...Menu.SubMenu.props,
    // Cannot overlap with properties within Menu.SubMenu.props
    menuInfo: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>

<style scoped>

</style>