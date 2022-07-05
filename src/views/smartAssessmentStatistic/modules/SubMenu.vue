<template>
  <a-sub-menu :key="menuInfo.assContentId" v-bind="$props" v-on="$listeners" >
        <span slot="title">
          <a-tooltip placement="topLeft">
            <template #title>{{ menuInfo.assContentId_dictText }}</template>
            <span>{{ menuInfo.assContentId_dictText }}</span>
          </a-tooltip>
        </span>
    <template v-for="item in menuInfo.children">
      <a-menu-item v-if="item.isKey === 1" :key="item.id + ',' + item.assContentId">
        <div v-if='item.uploadCount'>
<!--          <el-badge :value="item.uploadCount" :max="99" type="primary"/>-->
          <a-badge title="此要点上传数目" :count="item.uploadCount" :number-style="{ backgroundColor: '#52c41a' }" />
          <!--                  <a-icon type='check-square' theme='twoTone' />-->
          <a-tooltip placement="topLeft">
            <template #title>{{ item.assContentId_dictText }}</template>
            <span>{{ item.assContentId_dictText }}</span>
          </a-tooltip>
        </div>
        <div v-else>
<!--          <el-badge :value="item.uploadCount" :max="99" />-->
          <a-badge title="此要点暂未上传任何内容" show-zero :count="item.uploadCount" />
          <!--                  <a-icon type="edit" theme="twoTone" />-->
          <a-tooltip placement="topLeft">
            <template #title>{{ item.assContentId_dictText }}</template>
            <span>{{ item.assContentId_dictText }}</span>
          </a-tooltip>
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