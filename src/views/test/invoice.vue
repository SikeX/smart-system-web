<template>
  <div class="upload_list">
    <a-form-model-item label="发票图" prop="imgList">
      <j-image-upload bizPath="invoice" v-model="model.img"></j-image-upload>
    </a-form-model-item>
    <div>
      <a-button @click="checkInvoice()">查询发票</a-button>
    </div>
    <div>发票数据</div>
    <div>{{ invoiceData }}</div>
  </div>
</template>

<script>
import { axios } from '@/utils/request'
import signMd5Utils from '@/utils/encryption/signMd5Utils'
import { postAction } from '../../api/manage'

export default {
  name: 'invoice',
  data() {
    return {
      model: {},
      invoiceData: '',
    }
  },
  methods: {
    checkInvoice() {
      postAction('/invoice/recognize', this.model).then((res) => {
        if (res.success) {
          this.invoiceData = JSON.stringify(res.result)
          this.$message.success('查询成功')
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