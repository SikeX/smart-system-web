<template>

  <div class="app-container">

    <h2 style="text-align: center;">发布新实验</h2>

    <el-steps :active="3" process-status="wait" align-center style="margin-bottom: 40px;">
      <el-step title="填写实验基本信息"/>
      <el-step title="创建实验大纲"/>
      <el-step title="最终发布"/>
    </el-steps>

    <el-form label-width="120px">

      <el-form-item>
        <el-button @click="previous">返回修改</el-button>
        <el-button :disabled="saveBtnDisabled" type="primary" @click="publish">发布实验</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>

export default {
  data() {
    return {
      saveBtnDisabled: false // 保存按钮是否禁用
    }
  },

  created() {
    console.log('publish created')
  },

  methods: {
    previous() {
      console.log('previous')
      this.$router.push({ path: '/courcopy/chapter/1' })
    },

    publish() {
      console.log('publish')
      this.$router.push({ path: '/edu/courcopy/list' })
    }
  }
}
</script>