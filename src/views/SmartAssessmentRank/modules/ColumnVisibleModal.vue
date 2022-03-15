<template>
  <j-modal
    :title="title"
    :width="800"
    :visible="visible"
    :maskClosable="false"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class: { 'jee-hidden': disableSubmit } }"
    @cancel="handleCancel"
  >
    <a-form-model-item :labelCol='labelCol' :wrapperCol='wrapperCol' v-for="(val, key, index) in dataSource" :label="val.contentName">
      <j-switch :options="['1', '0']" v-model="val.visible" />
    </a-form-model-item>
  </j-modal>
</template>

<script>
import { getAction, putAction } from '../../../api/manage'

export default {
  name: 'ColumnVisibleModal',
  components: {},
  data() {
    return {
      title: '',
      width: 800,
      visible: false,
      disableSubmit: false,
      dataSource: [],
      labelCol: {
        xs: {span: 24},
        sm: {span: 5}
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 16}
      },
    }
  },
  methods: {
    add() {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.realForm.add()
      })
    },
    show(record) {
      this.visible = true

      getAction('/smartRankVisible/smartRankVisible/queryByMissionId', { missionId: record.id }).then((res) => {
        if (res.success) {
          this.dataSource = res.result
        } else {
          this.$message.error(res.message)
        }
      })
    },
    edit(record) {
      putAction('/smartRankVisible/smartRankVisible/edit', this.dataSource).then((res) => {
        if(res) {
          this.$message.success(res.message)
        } else {
          this.$message.error(res.message)
        }
      })
      this.visible = false
    },
    close() {
      this.$emit('close')
      this.visible = false
    },
    handleOk() {
      putAction('/smartRankVisible/smartRankVisible/edit', this.dataSource).then((res) => {
        if(res) {
          this.$message.success(res.message)
        } else {
          this.$message.error(res.message)
        }
      })
      this.visible = false
    },
    submitCallback() {
      this.$emit('ok')
      this.visible = false
    },
    handleCancel() {
      this.close()
    },
  },
}
</script>

<style scoped>
</style>