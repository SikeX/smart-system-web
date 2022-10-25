<template>
  <div class="img">
    <a-upload
      name="file"
      listType="picture-card"
      :multiple="isMultiple"
      :action="uploadAction"
      :headers="headers"
      :data="{ biz: bizPath }"
      :fileList="fileList"
      :beforeUpload="beforeUpload"
      :disabled="disabled"
      :isMultiple="isMultiple"
      @change="handleChange"
      @preview="handlePreview"
      :class="[!isMultiple ? 'imgupload' : '', !isMultiple && picUrl ? 'image-upload-single-over' : '']"
    >
      <div>
        <!--<img v-if="!isMultiple && picUrl" :src="getAvatarView()" style="width:100%;height:100%"/>-->
        <div class="iconp">
          <a-icon :type="uploadLoading ? 'loading' : 'plus'" />
          <div class="ant-upload-text">{{ text }}</div>
        </div>
      </div>
      <a-modal
        title="图片预览"
        :visible="previewVisible"
        @cancel="handleCancel()"
        okText="保存"
        cancelText="退出"
        @ok="editImg"
      >
        <img ref="imgRef" alt="example" style="width: 100%" :src="previewImage" />
        <div class="rotate">
          <a-icon class="icon" type="undo" @click="rotateLeft()" />
          <a-icon class="icon" type="redo" @click="rotateRight()" />
        </div>
      </a-modal>
    </a-upload>
  </div>
</template>

<script>
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { getFileAccessHttpUrl } from '@/api/manage'
import { postAction, uploadFile } from '../../api/manage'

const uidGenerator = () => {
  return '-' + parseInt(Math.random() * 10000 + 1, 10)
}
const getFileName = (path) => {
  if (path.lastIndexOf('\\') >= 0) {
    let reg = new RegExp('\\\\', 'g')
    path = path.replace(reg, '/')
  }
  return path.substring(path.lastIndexOf('/') + 1)
}
export default {
  name: 'JImageUpload',
  data() {
    return {
      uploadAction: window._CONFIG['domianURL'] + '/sys/common/upload',
      uploadLoading: false,
      picUrl: false,
      headers: {},
      fileList: [],
      previewImage: '',
      previewVisible: false,
      imgInfo: {
        name: '',
        url: '',
      },
    }
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    text: {
      type: String,
      required: false,
      default: '上传',
    },
    /* 这个属性用于控制文件上传的业务路径 */
    bizPath: {
      type: String,
      required: false,
      default: 'temp',
    },
    value: {
      type: [String, Array],
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    isMultiple: {
      type: Boolean,
      required: false,
      default: false,
    },
    // update-begin-author:wangshuai date:20201021 for:LOWCOD-969 新增number属性，用于判断上传数量
    number: {
      type: Number,
      required: false,
      default: 0,
    },
    // update-end-author:wangshuai date:20201021 for:LOWCOD-969 新增number属性，用于判断上传数量
  },
  watch: {
    value: {
      handler(val, oldValue) {
        if (val instanceof Array) {
          this.initFileList(val.join(','))
        } else {
          this.initFileList(val)
        }
        if (!val || val.length == 0) {
          this.picUrl = false
        }
      },
      // 立刻执行handler
      immediate: true,
    },
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN)
    this.headers = { 'X-Access-Token': token }
  },
  methods: {
    initFileList(paths) {
      if (!paths || paths.length == 0) {
        this.fileList = []
        return
      }
      this.picUrl = true
      let fileList = []
      let arr = paths.split(',')
      for (var a = 0; a < arr.length; a++) {
        let url = getFileAccessHttpUrl(arr[a])
        fileList.push({
          uid: uidGenerator(),
          name: getFileName(arr[a]),
          status: 'done',
          url: url,
          response: {
            status: 'history',
            message: arr[a],
          },
        })
      }
      this.fileList = fileList
    },
    beforeUpload: function (file) {
      var fileType = file.type
      if (fileType.indexOf('image') < 0) {
        this.$message.warning('请上传图片')
        return false
      }
    },
    rotateLeft() {
      this.rotateBase64Img(this.previewImage, -90, this.changePic)
    },
    rotateRight() {
      this.rotateBase64Img(this.previewImage, 90, this.changePic)
    },
    changePic(newPicSrc) {
      this.previewImage = newPicSrc
    },
    editImg() {
      if (this.previewImage.startsWith('http')) {
        this.previewVisible = false
        return
      }
      console.log(this.base64toFile(this.previewImage))
      console.log(this.imgInfo)
      let nameList = this.imgInfo.name.split('.')
      let type = nameList[nameList.length - 1]
      let formData = new FormData()
      formData.append('biz', this.bizPath)
      formData.append('file', this.base64toFile(this.previewImage, this.imgInfo.name.split('_')[0] + '.' + type))
      uploadFile(formData).then((res) => {
        if (res.success) {
          let filePathList = this.value.split(',')
          console.log(this.value)
          let urlList = this.imgInfo.url.split('/')
          let filePath = ''
          urlList[urlList.length - 2] === 'static'
            ? (filePath = urlList[urlList.length - 1])
            : (filePath = urlList[urlList.length - 2] + '/' + urlList[urlList.length - 1])
          console.log(filePath)

          let index = filePathList.indexOf(filePath)
          console.log(index)
          filePathList[index] = res.message
          this.value = filePathList.join(',')
          this.$emit('change', this.value)
          console.log(this.value)
          this.previewVisible = false
        } else {
          this.$message.error(res.message)
        }
      })
    },

    handleChange(info) {
      console.log(info)
      this.picUrl = false
      let fileList = info.fileList
      // update-begin-author:wangshuai date:20201022 for:LOWCOD-969 判断number是否大于0和是否多选，返回选定的元素。
      if (this.number > 0 && this.isMultiple) {
        fileList = fileList.slice(-this.number)
      }
      // update-end-author:wangshuai date:20201022 for:LOWCOD-969 判断number是否大于0和是否多选，返回选定的元素。
      if (info.file.status === 'done') {
        if (info.file.response.success) {
          this.picUrl = true
          fileList = fileList.map((file) => {
            if (file.response) {
              file.url = file.response.message
            }
            return file
          })
        }
        // this.$message.success(`${info.file.name} 上传成功!`);
      } else if (info.file.status === 'error') {
        this.$message.error(`${info.file.name} 上传失败.`)
      } else if (info.file.status === 'removed') {
        this.handleDelete(info.file)
      }
      this.fileList = fileList
      if (info.file.status === 'done' || info.file.status === 'removed') {
        this.handlePathChange()
      }
    },
    // 预览
    handlePreview(file) {
      this.imgInfo.name = file.name
      this.imgInfo.url = file.url
      this.previewImage = file.url || file.thumbUrl
      this.previewVisible = true
    },
    getAvatarView() {
      if (this.fileList.length > 0) {
        let url = this.fileList[0].url
        return getFileAccessHttpUrl(url)
      }
    },
    handlePathChange() {
      let uploadFiles = this.fileList
      let path = ''
      if (!uploadFiles || uploadFiles.length == 0) {
        path = ''
      }
      let arr = []
      if (!this.isMultiple && uploadFiles.length > 0) {
        arr.push(uploadFiles[uploadFiles.length - 1].response.message)
      } else {
        for (let a = 0; a < uploadFiles.length; a++) {
          // update-begin-author:taoyan date:20200819 for:【开源问题z】上传图片组件 LOWCOD-783
          if (uploadFiles[a].status === 'done') {
            arr.push(uploadFiles[a].response.message)
          } else {
            return
          }
          // update-end-author:taoyan date:20200819 for:【开源问题z】上传图片组件 LOWCOD-783
        }
      }
      if (arr.length > 0) {
        path = arr.join(',')
      }
      this.$emit('change', path)
    },
    handleDelete(file) {
      // 如有需要新增 删除逻辑
      console.log(file)
    },
    handleCancel() {
      this.close()
      this.previewVisible = false
    },
    close() {},
    rotateBase64Img(src, edg, callback) {
      var canvas = document.createElement('canvas')
      var ctx = canvas.getContext('2d')

      var imgW //图片宽度
      var imgH //图片高度
      var size //canvas初始大小

      if (edg % 90 != 0) {
        console.error('旋转角度必须是90的倍数!')
        throw '旋转角度必须是90的倍数!'
      }
      edg < 0 && (edg = (edg % 360) + 360)
      const quadrant = (edg / 90) % 4 //旋转象限
      const cutCoor = { sx: 0, sy: 0, ex: 0, ey: 0 } //裁剪坐标

      var image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = src

      image.onload = function () {
        imgW = image.width
        imgH = image.height
        size = imgW > imgH ? imgW : imgH

        canvas.width = size * 2
        canvas.height = size * 2
        switch (quadrant) {
          case 0:
            cutCoor.sx = size
            cutCoor.sy = size
            cutCoor.ex = size + imgW
            cutCoor.ey = size + imgH
            break
          case 1:
            cutCoor.sx = size - imgH
            cutCoor.sy = size
            cutCoor.ex = size
            cutCoor.ey = size + imgW
            break
          case 2:
            cutCoor.sx = size - imgW
            cutCoor.sy = size - imgH
            cutCoor.ex = size
            cutCoor.ey = size
            break
          case 3:
            cutCoor.sx = size
            cutCoor.sy = size - imgW
            cutCoor.ex = size + imgH
            cutCoor.ey = size + imgW
            break
        }

        ctx.translate(size, size)
        ctx.rotate((edg * Math.PI) / 180)
        ctx.drawImage(image, 0, 0)

        var imgData = ctx.getImageData(cutCoor.sx, cutCoor.sy, cutCoor.ex, cutCoor.ey)
        if (quadrant % 2 == 0) {
          canvas.width = imgW
          canvas.height = imgH
        } else {
          canvas.width = imgH
          canvas.height = imgW
        }
        ctx.putImageData(imgData, 0, 0)
        callback(canvas.toDataURL())
      }
    },
    base64toFile(dataurl, filename) {
      // 将base64转换为文件，dataurl为base64字符串，filename为文件名（必须带后缀名，如.jpg,.png）
      const arr = dataurl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], filename, { type: mime })
    },
  },
  model: {
    prop: 'value',
    event: 'change',
  },
}
</script>

<style scoped>
/* update--begin--autor:lvdandan-----date:20201016------for：j-image-upload图片组件单张图片详情回显空白
  * https://github.com/zhangdaiscott/jeecg-boot/issues/1810
  * https://github.com/zhangdaiscott/jeecg-boot/issues/1779
  */

.rotate {
  display: flex;
  padding: 1rem 0;
  justify-content: center;
}
.icon {
  font-size: 2rem;
  padding: 0 1rem;
  cursor: pointer;
}

/deep/ .imgupload .iconp {
  padding: 20px;
}
/* update--end--autor:lvdandan-----date:20201016------for：j-image-upload图片组件单张图片详情回显空白*/

/deep/ .image-upload-single-over .ant-upload-select {
  display: none;
}
</style>
