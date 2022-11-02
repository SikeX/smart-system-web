<template>
  <a-spin :spinning='confirmLoading'>
    <j-form-container :disabled='formDisabled'>
      <a-form-model ref='form' :model='model' :rules='validatorRules' slot='detail'>
        <a-row>
          <a-col :span='24'>
            <a-form-model-item label='满分分值' :labelCol='labelCol' :wrapperCol='wrapperCol'>
              <a-input-number v-model='maxScore' placeholder='满分分值' :min="0" :max="maxScore" style='width: 100%' disabled=''/>
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='评分' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='score'>
              <a-input-number v-model='model.score' placeholder='请输入评分' :min="-100" :max="maxScore" style='width: 100%'/>
            </a-form-model-item>
          </a-col>
          <a-col :span='24'>
            <a-form-model-item label='评语' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='comment'>
              <a-textarea v-model='model.comment' rows='4' placeholder='请输入评语'/>
            </a-form-model-item>
          </a-col>
          <a-col :span="24">
            <a-form-model-item label="评分人" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="ratingUser">
              <j-select-user-by-dep v-model="model.ratingUser" store='id' text='realname' disabled/>
            </a-form-model-item>
          </a-col>
          <a-col v-if='model.updateTime' :span='24'>
            <a-form-model-item label='最后更新评分时间' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='updateTime'>
              <j-date placeholder='无更新时间' v-model='model.updateTime' :show-time='true' date-format='YYYY-MM-DD HH:mm:ss'
                      style='width: 100%' disabled/>
            </a-form-model-item>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

import {httpAction, getAction} from '@/api/manage'
import store from '@/store'
import {validateDuplicateValue} from '@/utils/util'
import Vue from "vue";

export default {
  name: 'SmartScoreInfoForm',
  components: {},
  props: {
    //表单禁用
    disabled: {
      type: Boolean,
      default: false,
      required: false
    },
    mainId: {
      type: String,
      default: '',
      required: false
    },
    maxScore: {
      type: Number,
      default: 0,
      required: false
    },
  },
  watch: {
    mainId: {
      immediate: true,
      handler(val) {
        if (!this.mainId) {
          this.model = {}
        } else {
          let assessInfo = Vue.ls.get('assessInfo');

          let params = {
            mainId: val,
            // ratingUser: store.getters.userInfo.id,
            roleId: assessInfo.id,
            roleType: assessInfo.type === 'team' ? 0 : 1
          }

          getAction(this.url.list, params).then((res) => {
            if (res.success) {
              let result = res.result
              if (Number(result.total) > 0) {
                this.model = Object.assign({}, res.result.records[0])
              } else {
                this.model = {}
              }
            }
            if (res.code === 510) {
              this.$message.warning(res.message)
            }
          })
        }
      }
    }
  },
  data() {
    return {
      model: {},
      labelCol: {
        xs: {span: 24},
        sm: {span: 5}
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 16}
      },
      confirmLoading: false,
      validatorRules: {
        score: [{ required: true, message: '请输入评分,本要点满分: ' + this.maxScore + ' 分'},]
      },
      url: {
        list: "/smartAnswerAssContent/smartAnswerAssContent/listSmartAnswerAssScoreByMainId",
        add: "/smartAnswerAssContent/smartAnswerAssContent/addSmartAnswerAssScore",
        edit: "/smartAnswerAssContent/smartAnswerAssContent/editSmartAnswerAssScore",
      }
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    }
  },
  created() {
    //备份model原始值
    this.modelDefault = JSON.parse(JSON.stringify(this.model))
  },
  methods: {
    add() {
      this.edit(this.modelDefault)
    },
    edit() {
      // this.model = Object.assign({}, record)
      this.visible = true

    },
    submitForm() {
      const that = this
      // 触发表单验证
      this.$refs.form.validate(valid => {
        if (valid) {
          that.confirmLoading = true
          let httpurl = ''
          let method = ''
          if (!this.model.id) {
            httpurl += this.url.add
            method = 'post'
          } else {
            httpurl += this.url.edit
            method = 'put'
          }
          this.model.ratingUser = store.getters.userInfo.id
          this.model.mainId = this.mainId
          let assessInfo = Vue.ls.get('assessInfo');
          if (assessInfo) {
            // 评分人所属考核组或者考核单位ID
            this.model.roleId = assessInfo.id;
            // 评分人所属类别：0-考核组，1-考核单位
            this.model.roleType = assessInfo.type === 'team' ? 0 : 1;
          } else {
            that.$message.warning('出现错误，请重新选择评分角色！')
            return
          }

          httpAction(httpurl, this.model, method).then((res) => {
            if (res.success) {
              that.$message.success(res.message)
              that.$emit('ok')
            } else {
              that.$message.warning(res.message)
            }
          }).finally(() => {
            that.confirmLoading = false
          });
        }

      })
    }
  }
}
</script>