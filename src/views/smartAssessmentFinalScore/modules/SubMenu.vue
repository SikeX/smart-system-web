<template>
  <a-sub-menu :key="menuInfo.id" v-bind="$props" v-on="$listeners" >
        <span slot="title">
          <span>{{ menuInfo.name }}</span>
        </span>
    <template v-for="item in menuInfo.children">
      <a-menu-item v-if="item.isKey == 1" :key="item.id + ',' + item.missionId">
        <span>{{ item.name }}</span>
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