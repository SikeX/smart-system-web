<template>
  <div>
    <a-button type="primary" @click="openCamera">打开高拍仪</a-button>
    <eloam-modal ref="modalCamera" @ok="modalCameraOk"></eloam-modal>
  </div>
</template>

<script>
import fullcalendar from "../calendar/fullcalendar";
import EloamModal from "./modules/EloamModal";

export default {
  name: "eloam",
  components: {
    EloamModal,
    fullcalendar
  },
  methods: {
    openCamera() {
      this.$refs.modalCamera.open()
    },
    modalCameraOk() {

    }
  }
}
</script>

<style scoped>
</style>