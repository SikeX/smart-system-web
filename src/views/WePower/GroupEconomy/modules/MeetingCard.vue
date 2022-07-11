<template>
  <a-card :title="name" style="width: 100%">
    <a-col :span="24">
      <a-form-model-item label="会议材料" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="file">
        <j-upload v-model="meetFile" :multiple="false"></j-upload>
      </a-form-model-item>
    </a-col>
    <a-col :span="24">
      <a-form-model-item label="参会人员" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="people">
        <j-multi-select-tag
          type="list_multi"
          v-model="meetPeople"
          dictCode="smart_group_economy_people,name,id"
          placeholder="请选择参会人员"
        />
      </a-form-model-item>
    </a-col>
    <a-col :span="24">
      <a-form-model-item label="会议照片" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="video1">
        <j-image-upload isMultiple v-model="meetVideo"></j-image-upload>
        <a-button v-if="!disableSubmit" type="primary" @click="checkMeetingPeople()">检测参会人员</a-button>
      </a-form-model-item>
    </a-col>
    <a-col :span="24">
      <a-form-model-item label="检测到参会人员" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="video1">
        <j-multi-select-tag
          type="list_multi"
          v-model="arrival"
          dictCode="smart_group_economy_people,name,id"
          :disabled="true"
        />
      </a-form-model-item>
    </a-col>
    <a-col :span="24">
      <a-form-model-item label="未到人员" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="video1">
        <j-multi-select-tag
          type="list_multi"
          v-model="nonarrival"
          dictCode="smart_group_economy_people,name,id"
          :disabled="true"
        />
      </a-form-model-item>
    </a-col>
  </a-card>
</template>

<script>
import { getAction } from '../../../../api/manage'
export default {
  name: 'MeetingCard',
  components: {},
  props: ['name', 'file', 'people', 'video', 'disableSubmit', 'videoPeople'],
  watch: {
    meetFile(val) {
      console.log(val)
      this.$emit('update:file', val)
    },
    meetPeople(val) {
      this.$emit('update:people', val)
    },
    meetVideo(val) {
      this.$emit('update:video', val)
    },
    arrival(val) {
      this.$emit('update:videoPeople', val)
    },
  },
  created() {
    this.getNonarrival()
  },
  data() {
    return {
      meetFile: this.file,
      meetPeople: this.people,
      meetVideo: this.video,
      arrival: this.videoPeople,
      nonarrival: '',
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    }
  },
  methods: {
    checkMeetingPeople() {
      const params = {
        imgPaths: this.video,
        groupId: 'GroupEconomy',
      }
      if (!this.video) {
        this.$message.error('请上传会议照片')
        return
      }
      getAction('faceRecognition/getFaceRecognition', params).then((res) => {
        if (res.success) {
          let arrivalList = []
          this.$message.success('检测成功')
          res.result.forEach((item) => {
            arrivalList.push(item.userId)
          })
          this.arrival = arrivalList.join(',')
          let peopleList = this.people.split(',')
          let nonarrivalList = peopleList.filter((item) => {
            return !arrivalList.includes(item)
          })
          this.nonarrival = nonarrivalList.join(',')
          console.log(res.result)
        } else {
          this.$message.error(res.message)
        }
      })
    },
    getNonarrival() {
      if (this.disableSubmit) {
        console.log('1')
        let arrivalList = this.arrival.split(',')
        let peopleList = this.meetPeople.split(',')
        let nonarrivalList = peopleList.filter((item) => {
          return !arrivalList.includes(item)
        })
        this.nonarrival = nonarrivalList.join(',')
      }
    },
  },
}
</script>

<style>
</style>