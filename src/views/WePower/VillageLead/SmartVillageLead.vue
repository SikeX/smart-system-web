<template>
  <div>
    <smart-village-lead-list />
    <smart-village-lead-2-list />
  </div>
</template>

<script>
import SmartVillageLead2List from './SmartVillageLead2List.vue'
import SmartVillageLeadList from './SmartVillageLeadList.vue'
export default {
  name: 'SmartVillageLead',
  components: { SmartVillageLeadList, SmartVillageLead2List },
}
</script>

<style>
</style>