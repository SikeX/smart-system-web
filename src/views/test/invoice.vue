<template>
  <div class="upload_list">
    <a-form-item label="发票图">
      <a-upload listType="picture-card" :beforeUpload="beforeUpload" :customRequest="selfUpload" :show-upload-list="false">
        <img class="layui-upload-img" name="titleBase64Img" id="base64Img" :src="this.imgUrl" />
      </a-upload>
    </a-form-item>
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
      invoiceData: 'a',
      headImg: '',
      imageUrl: '',
      type: '',
    }
  },
  methods: {
    beforeUpload(file) {
      const isJPG =
        file.type === 'image/jpeg' ||
        file.type === 'image/jpg' ||
        file.type === 'image/png' ||
        file.type === 'image/bmp'
      if (!isJPG) {
        this.$message.error('请上传图片文件')
      }
      const isLt2M = file.size / 1024 < 1024 * 16 && file.size / 1024 > 10
      if (!isLt2M) {
        this.$message.error('文件大小应在10KB~200KB之间')
      }
      return isJPG && isLt2M
    },
    selfUpload({ action, file, onSuccess, onError, onProgress }) {
      const base64 = new Promise((resolve) => {
        const fileReader = new FileReader()
        fileReader.readAsDataURL(file)
        fileReader.onload = () => {
          resolve(fileReader.result)
          this.imgUrl = fileReader.result
        }
      })
    },
    invoiceApi() {
      let that = this
      console.log(that)
      const parameter = { img: this.imgUrl }
      console.log(parameter)
      const url = 'http://dgfp.market.alicloudapi.com/ocrservice/invoice'
      let sign = signMd5Utils.getSign(url, parameter)
      //将签名和时间戳，添加在请求接口 Header
      let signHeader = {
        'X-Sign': sign,
        'X-TIMESTAMP': signMd5Utils.getDateTimeToString(),
        Authorization: 'APPCODE 1b638e4b0ead44c593727fffa06a82c8',
        'Content-Type': 'application/json',
      }

      return axios({
        url: url,
        method: 'post',
        data: parameter,
        headers: signHeader,
      })
    },
    checkInvoice() {
      this.invoiceApi().then((res) => {
        console.log(res.data)
        this.$message.info(res.data)
      })
    },
  },
}
</script>

<style>
</style>