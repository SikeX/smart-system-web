<template>
  <div class="createTest testPaper" @click.self="edit(-1,-1)">
    <div class="w">

      <!-- 试卷信息 -->
      <div class="title ">
        <el-input v-model="testData.paperName" class="testName" placeholder="请输入调查问卷标题" :disabled="isRead"></el-input>

        <ul>
          <li class="test-info" style="margin-top: 3px" >出卷者: {{ getCreatorName()}}</li>
<!--          <li class="test-info">
            答题时间:
            <el-input-number v-model="testData.time" controls-position="right" :step="10" size="mini" :min="1" :disabled="isRead"/>
            分钟
          </li>-->
          <li class="test-info" style="margin-top: 3px">题目数量: 共 {{ topicNavIndex_mixin(4,sortedTopics[4].topic_content.length-1) }} 道</li>
          <li class="test-info" style="margin-top: 3px"><el-switch
            v-model="testData.isMark" active-value="1" inactive-value="0"
            active-text="是否评分">
          </el-switch></li>
          <div v-show="testData.isMark == 1">
          <li class="test-info" style="margin-top: 3px">总分: {{ totalScore }} 分</li>
          <li class="test-info">
            及格分数:
            <el-input-number v-model="testData.passMark" controls-position="right" :step="1" size="mini" :min="0" :max="totalScore" :disabled="isRead"/>
            分
          </li>
          </div>
          <li class="fr">
            <el-button v-if="params.opt === 'addSurvey' || params.opt === 'edit'" size="mini" type="primary" @click="selectPeople()">保存调查问卷</el-button>
          </li>

          <li style="clear:both;"></li>
        </ul>

      </div>

      <div class="title fixed" v-if="isFixed">
        <el-input v-model="testData.paperName" class="testName" placeholder="请输入调查问卷标题" :disabled="isRead"></el-input>

        <ul>
          <li class="test-info" style="margin-top: 3px" >出卷者: {{ getCreatorName()}}</li>
<!--          <li class="test-info">
            答题时间:
            <el-input-number v-model="testData.time" controls-position="right" :step="10" size="mini" :min="1" :disabled="isRead"/>
            分钟
          </li>-->
          <li class="test-info" style="margin-top: 3px">题目数量: 共 {{ topicNavIndex_mixin(4,sortedTopics[4].topic_content.length-1) }} 道</li>
          <li class="test-info" style="margin-top: 3px"><el-switch
            v-model="testData.isMark" active-value="1" inactive-value="0"
            active-text="是否评分">
          </el-switch></li>
          <div v-show="testData.isMark == 1">
          <li class="test-info" style="margin-top: 3px">总分: {{ totalScore }} 分</li>
          <li class="test-info">
            及格分数:
            <el-input-number v-model="testData.passMark" controls-position="right" :step="1" size="mini" :min="0" :max="totalScore" :disabled="isRead"/>
            分
          </li>
          </div>
          <li class="fr">
            <el-button v-if="params.opt === 'addSurvey' || params.opt === 'edit'" size="mini" type="primary" @click="selectPeople()">保存调查问卷</el-button>
          </li>
          <!-- <li class="test-info">所属班级: {{ testData.classes_name }}</li> -->
          <li style="clear:both;"></li>
        </ul>
      </div>

      <div class="test-content" @click.self="edit(-1,-1)">
        <div class="topics">
          <!-- 所有题目 -->
          <div class="topic" v-for="(s_topics, index) in sortedTopics" :key="index">
            <!-- 按类型分类好的题目 -->
            <div class="topicsType" v-if="s_topics.topic_content.length != 0">
              <div class="bigQuestionName">
                <h4> {{bigQuestionName_mixin(s_topics.type,index)}} </h4><!-- 题目类型名称 -->
                <div class="allScore" v-show="testData.isMark == 1">
                  <button :class="s_topics.showAllScore? 'active':''" @click="s_topics.showAllScore = !s_topics.showAllScore" v-show="isShow">统一设置题目分数</button>
                  <el-input v-if="s_topics.showAllScore" @change="setAllScore($event,s_topics.type)" v-model="s_topics.score" placeholder="请输入分数" :disabled="isRead"></el-input>
                </div>
              </div>

              <div v-for="(t, tIndex) in s_topics.topic_content" :key="tIndex" @click="edit(s_topics.type,tIndex)">
                <div class="topic-content" :class="isEdit(s_topics.type,tIndex)?'isEdit':''">
                  <!-- 题目 -->
                  <div class="question">
                    <strong class="question_nunber">{{ topicNavIndex_mixin(s_topics.type,tIndex) }}、</strong>
                    <span v-if="isEdit(s_topics.type,tIndex)">
                      <el-input v-model="t.question" type="textarea" autosize placeholder="请输入题干" :disabled="isRead"></el-input>
                    </span>
                    <span v-else>{{ t.question }}</span>
                  </div>

                  <!-- 单项选择题 -->
                  <div class="userAnswer" v-if="s_topics.type==0">
                    <div class="radios">
                      <el-radio v-for="(item, index) in t.choice" :key="index" v-model="t.correctAnswer" :label="getOption(index)" :disabled="isRead">
                        <span class="topicNavIndex">{{String.fromCharCode(65+index)}}、</span>
                        <span v-if="editInedx.type==0&&editInedx.index==tIndex">
                          <el-input v-model="t.choice[index]" type="textarea" autosize placeholder="请输入选项内容" :disabled="isRead"></el-input>
                          <el-button class="delRadios" size="mini" type="danger" v-if="t.choice.length>2" @click="delRadios(0,tIndex,index)" v-show="isShow">
                            <i class="el-icon-close"></i>
                          </el-button>
                        </span>
                        <span v-else>{{item}}</span>
                      </el-radio>
                    </div>
                    <el-button class="addRadios" size="mini" icon="el-icon-plus" @click="addRadios(s_topics.type,tIndex)" v-show="isShow">添加选项</el-button>
                  </div>

                  <!-- 多项选择题 -->
                  <div class="userAnswer" v-if="s_topics.type==1">
                    <div class="checkbox">
                      <el-checkbox-group v-model="t.correctAnswer" :disabled="isRead">
                        <el-checkbox :label="getOption(index)" v-for="(item, index) in t.choice" :key="index">
                          <span class="topicNavIndex">{{String.fromCharCode(65+index)}}、</span>
                          <span v-if="editInedx.type==1&&editInedx.index==tIndex">
                            <el-input v-model="t.choice[index]" type="textarea" autosize placeholder="请输入选项内容" :disabled="isRead"></el-input>
                            <!--<el-input v-model="t.choice[index]" type="textarea" autosize placeholder="请输入选项内容"></el-input>-->
                            <el-button class="delRadios" size="mini" type="danger" v-if="t.choice.length>2" @click="delRadios(1,tIndex,index)" v-show="isShow">
                              <i class="el-icon-close"></i>
                            </el-button>
                          </span>
                          <span v-else>{{item}}</span>
                        </el-checkbox>
                      </el-checkbox-group>
                    </div>
                    <el-button class="addRadios" size="mini" icon="el-icon-plus" @click="addRadios(s_topics.type,tIndex)" v-show="isShow">添加选项</el-button>
                  </div>

                  <!-- 判断题 -->
                  <div class="userAnswer" v-if="s_topics.type==2">
                    <div class="TrueOrFalse">
                      <el-radio v-model="t.correctAnswer" label="T" :disabled="isRead">正确</el-radio>
                      <el-radio v-model="t.correctAnswer" label="F" :disabled="isRead">错误</el-radio>
                    </div>
                  </div>

                  <!-- 填空题 -->
                  <div class="userAnswer" v-if="s_topics.type==3">
                  <el-button size="mini" @click="addFillSymbol(tIndex)" v-show="isShow">插入填空符</el-button>
                  <!--<span style="font-size:12px;">(三个下划线为一个填空符)</span>-->

                  <div class="fillInBlank">
                    <div v-for="(q, index) in fillSymbolStr(t.question,tIndex)" :key="index">
                      <el-input type="textarea" autosize placeholder="请回答" v-if="index!=fillSymbolStr(t.question,tIndex).length-1" v-model="t.correctAnswer[index]" :disabled="isRead">
                      </el-input>
                    </div>
                  </div>
                </div>

                  <!-- 简答题 -->
                  <div class="userAnswer" v-if="s_topics.type==4">
                    <div class="text">
                      <strong>&nbsp;&nbsp;关键字</strong>
                      <div v-for="(q, index) in t.correctAnswer" :key="index">
                        <el-input type="textarea" autosize placeholder="请输入关键字" v-model="t.correctAnswer[index]" :disabled="isRead"> </el-input>
                      </div>
                      <el-button class="addRadios" size="mini" icon="el-icon-plus" @click="addKeyWord(tIndex)" v-show="isShow">添加关键字</el-button>
                      <!-- {{t.correctAnswer}} -->
                    </div>
                  </div>

                  <!-- 正确答案 -->
                  <p class="correctAnswer" v-show="testData.isMark == 1">
                    <strong>正确答案: </strong>
                    {{ t.correctAnswer}}
                  </p>
                  <div>

                    <div class="topicScore" v-show="testData.isMark == 1">
                      <strong>分值: </strong>
                      <span v-if="isEdit(s_topics.type,tIndex)">
                        <el-input-number v-model="t.score" controls-position="right" :step="1" size="mini" :min="0" :disabled="isRead"/>
                      </span>
                      <span v-else>{{t.score}}</span>
                      (分)
                    </div>

                  </div>

                </div>
                <el-divider></el-divider>
              </div>

            </div>
          </div>

        </div>

        <!-- 题目导航 -->
        <div class="topic-nav" :class="isFixed ? 'isFixed' : ''" :style="topic_nav_style">
          <!-- 工具 -->
          <div class="tool">
            <transition name="el-zoom-in-top">
              <div v-show="!isEdit(-1,-1)">
                <el-button icon="el-icon-top" title="上移" @click="moveTopic(-1)" v-show="isShow"></el-button>
                <el-button icon="el-icon-bottom" title="下移" @click="moveTopic(1)" v-show="isShow"></el-button>
                <el-button type="danger" icon="el-icon-delete" title="删除" @click="delTopic()" v-show="isShow"></el-button>
              </div>
            </transition>
          </div>

          <!-- 导航按钮 -->
          <ul v-for="(topics, Topics_index) in sortedTopics" :key="Topics_index">
            <li class="topic-nav-item" @click.self="edit(-1,-1)">
              <div class="nav-title">{{topicTypeName_mixin(topics.type)}}</div>
              <span class="topic-nav-button" :class="editInedx.type==topics.type" v-for="(item , index) in topics.topic_content" :key="index" @click="topicNav(Topics_index,index)">
                {{topicNavIndex_mixin(Topics_index,index)}}
              </span>

              <span class="topic-nav-button" @click="newTopic(topics.type)" v-show="isShow">
                <i class="el-icon-plus"></i>
              </span>
            </li>
          </ul>
        </div>

        <div style="clear:both;"></div>
      </div>

      <div class="back-top" @click="backTop_mixin()">
        <i class="el-icon-arrow-up"></i>
      </div>
    </div>
<!-- 选择被访人-->
  <el-dialog title="调查详情" :visible.sync="dialogFormVisible"  @closed="handleClose"
             v-loading="randomLoading"
             element-loading-text="正在抽选中..."
             element-loading-spinner="el-icon-loading"
             element-loading-background="rgba(0, 0, 0, 0.3)">
    <el-form :model="form" ref="form">
      <el-form-item label="每村被访人数" :label-width="formLabelWidth"  prop="selectedPeoCount"
                    :rules="[{ required: true, message: '请输入人数', trigger: 'blur,change' },
      //{ type: 'number', message: '请输入数字', trigger: 'blur,change' },
      { pattern: /^[1-9]*$/, message:'请输入正整数', trigger: 'blur,change' }]">
        <el-input v-model="form.selectedPeoCount" placeholder="请输入每村被访人数" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button style="float:right" type="primary" @click="randomSelect(form)">确 定</el-button>
        <el-button style="float:right;margin-right:15px" @click="closeDialog">取 消</el-button>
      </el-form-item>
    </el-form>
<!--    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" @click="randomSelect(form)">确 定</el-button>
    </div>-->
  </el-dialog>
<!--    <selected-people-modal ref="selectedPeopleModel" @ok="modalFormOk"/>-->
  </div>
</template>

<script>
  import "@/assets/less/testPaper.less";
  import testPaperMixin from "@/mixins/testPaper-mixin";
  import {postAction, httpAction, getAction ,putAction} from '@/api/manage'
  import { mapActions, mapGetters,mapState } from 'vuex'
  import SelectedPeopleModal from './modules/SelectedPeopleModal'

  export default {
    name: "Paper",
    mixins: [testPaperMixin],
    components:[SelectedPeopleModal],
    data() {
      return{
        dialogFormVisible: false,
        randomLoading:false,
        form: {
          /*examStarttime:'',
          examEndtime:'',*/
          selectedPeoCount:''
        },
        formLabelWidth: '120px',

        //按题目类型分类好的题目数据
        //题目类型==>  0:单选题  1:多选题  2:判断题  3:填空题  4:简答题
        sortedTopics: [
          { type: 0, topic_content: [], score: 0, showAllScore: false },
          { type: 1, topic_content: [], score: 0, showAllScore: false },
          { type: 2, topic_content: [], score: 0, showAllScore: false },
          { type: 3, topic_content: [], score: 0, showAllScore: false },
          { type: 4, topic_content: [], score: 0, showAllScore: false },
        ],

        //试卷数据
        testData: {
          isMark:0,
          paperName: '', //试卷名称
          time: 30, //答题时间
          topicNum: 0, //题目数量
          passMark: 0,
          totalScore:'',
          createBy:'',
          creatorName:'',
          smartTopicVoList:{},
          selectedCount: ''
        },
       /* //用户数据
        userData: {
          id: "",
          name: "李子建",
        },*/

        //当前编辑的题目索引
        editInedx: {
          type: "-1",
          index: "-1",
          input: "-2",
        },

        //topicDifficultyOptions: ["简单", "中等", "困难"], //题目难度选项

        //侧导航栏是否悬浮
        isFixed: false,
        topic_nav_style: "top:0px",
        isRead: false, //是否为只读模式
        isShow:true //是否展示添加选项按钮
      };
    },

      computed: {
      params(){
        return this.$route.params;
      },
      //试卷总分
      totalScore() {
        let score = 0;
        this.sortedTopics.forEach((element) => {
          element.topic_content.forEach((item) => {
            // console.log(typeof(item.score));
            score += parseInt(item.score);
          });
        });
        this.testData.totalScore = score;
        return score;
      },

      //按填空符(三个下划线)划分字符串
      fillSymbolStr() {
        return function (str) {
          let q = str.split("___");
          let len = this.sortedTopics[3].topic_content[tIndex].correctAnswer.length
          for(var i =0;i<len - q.length+1;i++){
            this.sortedTopics[3].topic_content[tIndex].correctAnswer.pop()
          }
          return q;
        };
      },
    },
    created() {
      console.log(this.$route)
      let type = this.$route.params.opt;
      if (type === "addSurvey") {
      }
      if (type === "edit") {
        this.getTestPaper();
      }
      if (type === "detail") {
        this.getTestPaper();
        this.isRead = true;
        this.isShow = false;
      }
    },

    mounted() {
      // 监听滚动事件，然后用handleScroll这个方法进行相应的处理
      window.addEventListener("scroll", this.handleScroll);
    },

    methods: {

      //获取出题者姓名
      getCreatorName:function (){
        let that = this
        if(that.testData.creatorName){
          return that.testData.creatorName;
        }else{
          console.log(that.$store.getters.nickname);
          return that.$store.getters.nickname;
        }
      },

      //获取当前用户信息
      ...mapGetters(["nickname", "avatar","userInfo"]),
      //选择村民-被调查人-弹窗
      selectPeople(){
      this.dialogFormVisible  = true
      },
      //随机选择村民
      randomSelect(){
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.testData.selectedCount = this.form.selectedPeoCount
            console.log(this.testData.selectedCount)
            this.randomLoading = true
            this.$nextTick(() => {
              this.submit()
            })
          } else {
            this.$refs.form.resetField();
          }
        })
      },
      handleClose () {
        this.form.selectedPeoCount = ''
        this.$refs.form.resetFields()
        //this.$emit('handleClose')
      },
      closeDialog(){
        this.dialogFormVisible  = false
        this.form.selectedPeoCount = ''
        this.$refs.form.resetField()
      },
      //提交试卷
      submit() {
        /*  处理题目信息 */
        let topicData = [];
        this.sortedTopics.forEach((element) => {
          if (element.topic_content.length != 0) {
            element.topic_content.forEach((item) => {
              //深拷贝
              let newItem = JSON.parse(JSON.stringify(item));
              topicData.push(newItem);

            });
          }
        });

        //处理选择题选项
        topicData.forEach((item) => {
          if (item.choice instanceof Array) {
            let i = 0
            let length = item.choice.length
            for (i = 0; i < length; i++) {
              if (item.choice[i] === '') {
                console.log("111")
                //this.$message.warning("有题目存在空选项！");
                this.isEmpty = true
                return
              }
            }
            let choice = "";
            console.log(item)
            item.choice.forEach((c) => {
              //console.log(item.choice)
              //console.log(c)
              if (c === "") {
                console.log("222")
                //this.$message.warning("有题目存在空选项！");
                this.isEmpty = true
                return
              } else {
                choice += c + "\n";
              }
            });
            item.choice = choice.slice(0, -1);
          }
        });

        //处理正确答案
        if(this.testData.isMark == 1){
          for(let item of topicData) {
            /*if(!item.correctAnswer){
              console.log("empty")
              this.isCorrect = false
              //this.$message.warning("有题目未选答案！");
              return
            }*/
            //选择题答案非空
            if(item.correctAnswer.length === 0){
              this.isCorrect = false
              console.log("333")
              console.log(this.isCorrect)
              this.$elmessage.warning("有题目答案为空！");
              return
            }
            //填空，简答答案非空
            if (item.correctAnswer instanceof Array) {
              console.log("array")
              let j = 0
              let length = item.correctAnswer.length
              console.log(item.correctAnswer)
              if(length == 1 && item.correctAnswer[0] === ''){
                this.isCorrect = false
                this.$elmessage.warning("有题目答案为空！");
                console.log("444")
                return
              }else{
                for (j = 0; j < length; j++) {
                  console.log(length)
                  if ( item.correctAnswer[j] === "") {
                    console.log("555")
                    this.$elmessage.warning("有题目答案为空！");
                    this.isCorrect = false
                    return
                  }
                }
              }
              console.log(this.isCorrect)
              let correctAnswer = "";
              item.correctAnswer.forEach((c) => {
                correctAnswer += c + "\n";
              });
              item.correctAnswer = correctAnswer.slice(0, -1);
            }
          };
        }else {
          for (let item of topicData) {
            item.correctAnswer = ""
          }
        }

        //处理试卷信息
        this.testData.creatorName = this.getCreatorName();
        this.testData.smartTopicVoList= topicData;
        this.testData.topicNum = topicData.length;

        if(this.isEmpty === true &&this.isCorrect === true){
          this.dialogFormVisible  = false
          console.log("isEmpty")
          this.$elmessage.warning("有题目存在空选项！");
          this.isEmpty = false
        }
        else if(this.isCorrect === false && this.isEmpty === true && this.testData.isMark == '1'){
          this.dialogFormVisible  = false
          console.log("all")
          this.$elmessage.warning("有题目答案为空！");
          this.$elmessage.warning("有题目存在空选项！");
          this.isEmpty = false
          this.isCorrect =true

        }else if(this.testData.paperName === ''){
          this.dialogFormVisible  = false
          this.$elmessage.warning("问卷标题为空！");
        }else if(this.testData.smartTopicVoList.length === 0){
          this.dialogFormVisible  = false
          this.$elmessage.warning("不能创建空问卷！");
        }
        else {
          if(this.testData.passMark>this.totalScore && this.testData.isMark == '1'){
            this.dialogFormVisible  = false
            console.log(this.testData.passMark,this.testData.totalScore)
            this.$elmessage({
              type: "error",
              message: "及格分不能超过总分！",
              duration: 1000,
            })
          }else{
            if (this.params.opt === "edit") {
              let id = this.$route.params.id
              let url = "/SmartPaper/smartPaper/edit/"+id;
              putAction(url, this.testData).then((res) => {
                if (res.success) {
                  this.$elmessage({
                    type:"success",
                    message: "修改成功！",
                    duration:1000,
                    onClose:()=> {
                      //此处写提示关闭后需要执行的函数
                      window.location.href="about:blank";
                      window.close();
                      window.opener.location.reload();
                    }
                  })
                }
                else{
                  this.$elmessage({
                    type:"error",
                    message: "修改失败！",
                    duration:1000,
                  })
                }
              });
            }
            else if (this.params.opt === "addSurvey") {
              let url = "/SmartPaper/smartPaper/addTriSurvey";
              postAction(url, this.testData).then((res) => {
                if (res.success) {
                  this.randomLoading = false
                  this.$elmessage({
                    type:"success",
                    message: "添加成功！",
                    duration:500,
                    onClose:()=> {
                      //此处写提示关闭后需要执行的函数
                      window.location.href="about:blank";
                      window.close();
                      window.opener.location.reload();
                    }
                  })
                }
                else{
                  this.$elmessage({
                    type:"error",
                    message: "添加失败！",
                    duration:300,
                  })
                }
              });
            }
          }
        }


        console.log(this.testData);
      },

      //编辑试卷---获取试卷信息
      async getTestPaper() {
        let params = {
          id:this.$route.params.id,
        };
        //console.log(typeof(params.id));
        await getAction("/SmartPaper/smartPaper/getPaperById", params).then((res) => {
          //console.log("result.data ==> ", res.result);
          if (res.success) {
            var testData = res.result;
            this.$message.success(res.message);
          } else {
            this.$message.error(res.message)
          }
          //处理试卷的题目数据
          if(testData.smartTopicVoList) {
            testData.smartTopicVoList.forEach((item) => {
              //if (item.topicType == 4 || item.topicType == 3 || item.topicType == 1)
              if (item.topicType == 4 || item.topicType == 3 ||item.topicType == 1) {
                item.correctAnswer = item.correctAnswer.split(/[\n]/g);
              }
              //按换行符分割字符串
              if(item.topicType == 0 || item.topicType == 1) {
                item.choice = item.choice.split(/[\n]/g);
                //item.required = item.required === 1 ? true : false;
              }
              //item.required = item.required === 1 ? true : false;
            });
          }
          /*testData.autoMack = testData.autoMack == 1 ? true : false;
          testData.disruptOrder = testData.disruptOrder == 1 ? true : false;*/
          //testData.permitCopy = testData.permitCopy == 1 ? true : false;
          this.testData = testData;
          console.log("testData ==> ", this.testData);

          //按题目类型分类并保存
          let topics = this.testData.smartTopicVoList;
          if(topics){
            for (let i = 0; i < topics.length; i++) {
              for (let item of this.sortedTopics) {
                //     // console.log(topics[i].topicType,item.type);
                if (topics[i].topicType == item.type) {
                  item.topic_content.push(topics[i]);
                }
              }
            }
          }
          console.log(this.sortedTopics);
        });
      },

      //统一设置题目分数
      setAllScore(val, type) {
        val = parseInt(val);
        this.sortedTopics[type].topic_content.forEach((item) => {
          item.score = val;
        });
      },

      //设置当前编辑中的题目
      edit(type, index) {
        if (this.editInedx.type == type && this.editInedx.index == index) {
          console.log("拦截");
          return;
        }
        this.editInedx.type = type;
        this.editInedx.index = index;
      },

      //是否在编辑状态
      isEdit(type, index, input = -2) {
        if (
          this.editInedx.type == type &&
          this.editInedx.index == index &&
          this.editInedx.input == input
        ) {
          return true;
        } else {
          return false;
        }
      },

      //滚动事件
      handleScroll() {
        let scrollTop =
          window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop; // 滚动条偏移量
        if (scrollTop > 154) {
          this.topic_nav_style = "top:" + (scrollTop + 20) + "px";
          this.isFixed = true;
        } else {
          this.isFixed = false;
        }
      },

      //点击题号导航跳转
      topicNav(type, index) {
        let totalIndex = this.topicNavIndex_mixin(type, index) - 1;
        setTimeout(() => {
          document
            .getElementsByClassName("topic-content")
            [totalIndex].scrollIntoView({ behavior: "smooth" });
        }, 100);
        this.edit(type, index);
      },

      //新建题目
      newTopic(type) {
        if(type == 0 || type == 1){
          this.sortedTopics[type].topic_content.push({
            //u_id: this.userData.id,
            topicType: type,
            question: "",
            choice: ["", "", "", ""],
            correctAnswer: [],
            //analysis: "",
            //difficulty: "中等",
            score: 5,
            //subjectId: "1",
            //required: true
          });
        }else {
          this.sortedTopics[type].topic_content.push({
            //u_id: this.userData.id,
            topicType: type,
            question: "",
            //choice: [],
            correctAnswer: [],
            //analysis: "",
            //difficulty: "中等",
            score: 5,
            //subjectId: "1",
            //required: true
          });
        }

        let time = setTimeout(() => {
          this.topicNav(type, this.sortedTopics[type].topic_content.length - 1);
          clearInterval(time);
        }, 100);
      },

      //删除当前正在编辑的题目
      delTopic() {
        let type = this.editInedx.type;
        let index = this.editInedx.index;
        this.sortedTopics[type].topic_content.splice(index, 1);
      },

      //上移或下移当前正在编辑的题目  -1:上移   1:下移（只能在一个题型内移动）
      moveTopic(n) {
        let type = this.editInedx.type;
        let index = this.editInedx.index;

        if (index == 0 && n == -1) {
          console.log("拦截");
          return;
        }
        if (index == this.sortedTopics[type].topic_content.length - 1 && n == 1) {
          console.log("拦截");
          return;
        }

        let topic = this.sortedTopics[type].topic_content[index];
        let upTopic = this.sortedTopics[type].topic_content[index + n];

        this.sortedTopics[type].topic_content.splice(index, 1, upTopic);
        this.sortedTopics[type].topic_content.splice(index + n, 1, topic);

        let time = setTimeout(() => {
          this.topicNav(type, index + n, 10);
          clearInterval(time);
        }, 100);
      },

      //删除选项
      delRadios(type, tIndex, index) {
        this.sortedTopics[type].topic_content[tIndex].choice.splice(index, 1);
      },

      //添加选项，最多10个
      addRadios(type, tIndex) {
        let choiceLength = this.sortedTopics[type].topic_content[tIndex].choice.length + 1;
        if (choiceLength > 10) {
          this.$message({
            message: "不能再添加选项了喔!",
            type: "warning",
          });
          return;
        }
        //this.sortedTopics[type].topic_content[tIndex].choice.push("请输入选项" + choiceLength);
        this.sortedTopics[type].topic_content[tIndex].choice.push('');
      },
      //转换选项为A,B,C,D
      getOption(index){
        let option = String.fromCharCode(65+index);
        return option;
      },

      //添加填空符
      addFillSymbol(tIndex) {
        var str = this.sortedTopics[3].topic_content[tIndex].question;
        // console.log(str);
        this.sortedTopics[3].topic_content[tIndex].question = str + "___";
      },

      //添加关键字
      addKeyWord(tIndex) {
        this.sortedTopics[4].topic_content[tIndex].correctAnswer.push("");
        console.log(this.sortedTopics[4].topic_content[tIndex]);
      },
    },
  };
</script>
<style lang="less" scoped>
 .fr {
  float: right;
}
 ul {
   list-style: none;
   padding: 0;
   margin: 0;
 }
</style>
