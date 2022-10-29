<template>
  <div>
    <div style="width: 50%; padding: 10px 10px">
      <select-village-street-depart placeholder="请选择村镇(街道)" v-model="location" @change="getData" />
    </div>
    <a-card title="村镇信息" :bordered="false" style="width: 100%">
      <h3>名称: {{ model.locationName }}</h3>
      <!-- <h3>户数: {{ model.homeNumber }}</h3>
      <h3>人口数量: {{ model.population }}</h3> -->
      <div style="padding: 20px 0">
        <a-collapse v-model="activeKey">
          <a-collapse-panel key="1" header="村党支部名单">
            <home-list :data="model.dangZhiBuList" />
          </a-collapse-panel>
          <a-collapse-panel key="2" header="村民委员会名单">
            <home-list :data="model.committeeList" />
          </a-collapse-panel>
          <a-collapse-panel key="3" header="党员名单">
            <home-list :data="model.dangYuanList" />
          </a-collapse-panel>
          <a-collapse-panel key="4" header="村民代表名单">
            <home-list :data="model.villageRepresentativeList" />
          </a-collapse-panel>
          <a-collapse-panel key="5" header="农村集体经济组织理事会名单">
            <home-list :data="model.councilList" />
          </a-collapse-panel>
          <a-collapse-panel key="6" header="股东名单">
            <home-list :data="model.shareholderList" />
          </a-collapse-panel>
          <a-collapse-panel key="7" header="成员名单">
            <home-list :data="model.memberList" />
          </a-collapse-panel>
          <a-collapse-panel key="8" header="代表名单">
            <home-list :data="model.representativeList" />
          </a-collapse-panel>
        </a-collapse>
      </div>
    </a-card>
    <a-card title="三资信息" :bordered="false" style="width: 100%"> </a-card>
  </div>
</template>

<script>
import { getAction } from '../../api/manage'
import SelectVillageDepart from '../../components/common/SelectVillageDepart.vue'
import HomeList from './modules/HomeList.vue'
import SelectVillageStreetDepart from '@/components/common/SelectVillageStreetDepart'

export default {
  name: 'Home',
  components: {
    SelectVillageDepart,
    HomeList,
    SelectVillageStreetDepart,
  },
  created() {
    // this.getData()
  },
  data() {
    return {
      location: '',
      model: {},
    }
  },
  methods: {
    getData() {
      getAction('/wePowerInfo/getInfo', { locationId: this.location }).then((res) => {
        if (res.success) {
          this.model = res.result
        } else {
          this.$message.error(res.message)
        }
      })
    },
  },
}
</script>

<style>
</style>
