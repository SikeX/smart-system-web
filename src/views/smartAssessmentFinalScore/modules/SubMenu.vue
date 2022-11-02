<template>
  <a-sub-menu :key="menuInfo.id" v-bind="$props" v-on="$listeners" >
        <span slot="title">
          <a-tooltip placement="topLeft">
            <template #title>{{ menuInfo.name }}</template>
            <span>{{ menuInfo.name }}</span>
          </a-tooltip>
        </span>
    <template v-for="item in menuInfo.children">
      <a-menu-item v-if="item.isKey == 1" :key="item.id + ',' + item.missionId">
        <a-tooltip placement="topLeft">
          <template #title>{{ item.name }}</template>
          <span>{{ item.name }}</span>
        </a-tooltip>
      </a-menu-item>
      <sub-menu v-else :key="item.id + ',' + item.missionId" :menu-info="item"/>
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