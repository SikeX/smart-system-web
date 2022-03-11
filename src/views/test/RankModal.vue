<template>
  <j-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :maskClosable="false"
    switchFullscreen
    @ok="handleOk"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel">

    <rank-list :id="id" ref="realList" />
  </j-modal>
</template>

<script>
import rankList from './rankList.vue'

  export default {
    name: 'RankModal',
    components: {
      rankList
    },
    data() {
      return {
        title:'排名',
        width:800,
        visible: false,
        disableSubmit: false,
        id: ""
      }
    },
    methods:{
      add () {
        this.visible=true
        this.$nextTick(()=>{
          this.$refs.realForm.add();
        })
      },
      edit (record) {
        this.visible=true
        console.log(record)
        this.id = record.id
        // this.$nextTick(()=>{
        //   this.$refs.realList.id = record.id
        // })
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        this.$refs.realForm.handleOk();
      },
      submitCallback(){
        this.$emit('ok');
        this.visible = false;
      },
      handleCancel () {
        this.close()
      }
    }
  }
</script>

<style scoped>
</style>