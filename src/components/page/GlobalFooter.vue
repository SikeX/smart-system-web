<template>
  <div class="footer">
    <div class="copyright">
      Copyright
      <a-icon type="copyright" />
      2022 <span>智慧纪检大数据平台 </span><a class="icp" href="https://beian.miit.gov.cn/"> 黑ICP备2022003230号</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LayoutFooter',
}
</script>

<style lang="less" scoped>
.icp {
  color: gray;
}
.footer {
  padding: 0 16px;
  margin: 48px 0 24px;
  text-align: center;

  .links {
    margin-bottom: 8px;

    a {
      color: rgba(0, 0, 0, 0.45);

      &:hover {
        color: rgba(0, 0, 0, 0.65);
      }

      &:not(:last-child) {
        margin-right: 40px;
      }
    }
  }
  .copyright {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
  }
}
</style>