<template>
  <j-modal
    :title="title"
    :width="1200"
    :visible="visible"
    :maskClosable="false"
    switchFullscreen
    okText="保存"
    @ok="handleOk"
    :okButtonProps="{ class:{'jee-hidden': disableSubmit} }"
    @cancel="handleCancel">
    <a-row type="flex" justify="center">
      <a-col :span="22">
        <a-card style="width: 100%; margin: 1rem 0">
          <a-card-meta title="填表说明" :description="typeDesc">
          </a-card-meta>
        </a-card>
      </a-col>
    </a-row>
    <smart-inner-party-talk-form ref="realForm" @ok="submitCallback" :disabled="disableSubmit"/>
  </j-modal>
</template>

<script>

  import SmartInnerPartyTalkForm from './SmartInnerPartyTalkForm'
  import { httpAction,putAction, postAction,getAction } from '@/api/manage'
  export default {
    name: 'SmartInnerPartyTalkModal',
    components: {
      SmartInnerPartyTalkForm
    },
    data() {
      return {
        title:'',
        width:800,
        visible: false,
        disableSubmit: false,
        typeDesc:'',
        typeName:'党内谈话'
      }
    },
    methods:{
      add () {
        this.visible=true
        getAction('/taskType/smartVerifyType/queryByTypeName',{typeName:this.typeName}).then((res)=> {
          if(res.success){
            this.typeDesc = res.result
          }
        }),
        this.$nextTick(()=>{
          this.$refs.realForm.add();
        })
      },
      edit (record) {
        this.visible=true
        this.$nextTick(()=>{
          this.$refs.realForm.edit(record);
        })
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