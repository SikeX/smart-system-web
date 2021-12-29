import { UserLayout, TabLayout, RouteView, BlankLayout, PageView } from '@/components/layouts'

/**
 * 走菜单，走权限控制
 * @type {[null,null]}
 */


export const asyncRouterMap = [
 /* {
    path:'/InsertReportingInformation',
    name:'InsertReportInformationDetail',
    component:UserLayout,
    meta:{title:'二维码扫描跳转'},
    redirect:'/InsertReportingInformation/InsertReportingInformationDetail'

  },*/

  // {
  //   path: '/',
  //   name: 'dashboard',
  //   component: TabLayout,
  //   meta: { title: '首页' },
  //   // redirect: '/dashboard/analysis',
  //   children: [
  //
  //     // // dashboard
  //     // {
  //     //   path: '/dashboard',
  //     //   name: 'dashboard',
  //     //   redirect: '/dashboard/workplace',
  //     //   component: RouteView,
  //     //   meta: { title: '仪表盘', icon: 'dashboard', permission: [ 'dashboard' ] },
  //     //   children: [
  //     //     {
  //     //       path: '/dashboard/analysis',
  //     //       name: 'Analysis',
  //     //       component: () => import('@/views/dashboard/Analysis'),
  //     //       meta: { title: '分析页', permission: [ 'dashboard' ] }
  //     //     },
  //     //     {
  //     //       path: '/dashboard/monitor',
  //     //       name: 'Monitor',
  //     //       hidden: true,
  //     //       component: () => import('@/views/dashboard/Monitor'),
  //     //       meta: { title: '监控页', permission: [ 'dashboard' ] }
  //     //     },
  //     //     {
  //     //       path: '/dashboard/workplace',
  //     //       name: 'Workplace',
  //     //       component: () => import('@/views/dashboard/Workplace'),
  //     //       meta: { title: '工作台', permission: [ 'dashboard' ] }
  //     //     }
  //     //   ]
  //     // },
  //     //
  //     // // forms
  //     // {
  //     //   path: '/form',
  //     //   redirect: '/form/basic-form',
  //     //   component: PageView,
  //     //   meta: { title: '表单页', icon: 'form', permission: [ 'form' ] },
  //     //   children: [
  //     //     {
  //     //       path: '/form/base-form',
  //     //       name: 'BaseForm',
  //     //       component: () => import('@/views/form/BasicForm'),
  //     //       meta: { title: '基础表单', permission: [ 'form' ] }
  //     //     },
  //     //     {
  //     //       path: '/form/step-form',
  //     //       name: 'StepForm',
  //     //       component: () => import('@/views/form/stepForm/StepForm'),
  //     //       meta: { title: '分步表单', permission: [ 'form' ] }
  //     //     },
  //     //     {
  //     //       path: '/form/advanced-form',
  //     //       name: 'AdvanceForm',
  //     //       component: () => import('@/views/form/advancedForm/AdvancedForm'),
  //     //       meta: { title: '高级表单', permission: [ 'form' ] }
  //     //     }
  //     //   ]
  //     // },
  //     //
  //     // // list
  //     // {
  //     //   path: '/list',
  //     //   name: 'list',
  //     //   component: PageView,
  //     //   redirect: '/list/query-list',
  //     //   meta: { title: '列表页', icon: 'table', permission: [ 'table' ] },
  //     //   children: [
  //     //     {
  //     //       path: '/list/query-list',
  //     //       name: 'QueryList',
  //     //       component: () => import('@/views/list/TableList'),
  //     //       meta: { title: '查询表格', permission: [ 'table' ] }
  //     //     },
  //     //     {
  //     //       path: '/list/edit-table',
  //     //       name: 'EditList',
  //     //       component: () => import('@/views/list/TableInnerEditList'),
  //     //       meta: { title: '内联编辑表格', permission: [ 'table' ] }
  //     //     },
  //     //     {
  //     //       path: '/list/user-list',
  //     //       name: 'UserList',
  //     //       component: () => import('@/views/list/UserList'),
  //     //       meta: { title: '用户列表', permission: [ 'table' ] }
  //     //     },
  //     //     {
  //     //       path: '/list/role-list',
  //     //       name: 'RoleList',
  //     //       component: () => import('@/views/list/RoleList'),
  //     //       meta: { title: '角色列表', permission: [ 'table' ] }
  //     //     },
  //     //     {
  //     //       path: '/list/permission-list',
  //     //       name: 'PermissionList',
  //     //       component: () => import('@/views/list/PermissionList'),
  //     //       meta: { title: '权限列表', permission: [ 'table' ] }
  //     //     },
  //     //     {
  //     //       path: '/list/basic-list',
  //     //       name: 'BasicList',
  //     //       component: () => import('@/views/list/StandardList'),
  //     //       meta: { title: '标准列表', permission: [ 'table' ] }
  //     //     },
  //     //     {
  //     //       path: '/list/card',
  //     //       name: 'CardList',
  //     //       component: () => import('@/views/list/CardList'),
  //     //       meta: { title: '卡片列表', permission: [ 'table' ] }
  //     //     },
  //     //     {
  //     //       path: '/list/search',
  //     //       name: 'SearchList',
  //     //       component: () => import('@/views/list/search/SearchLayout'),
  //     //       redirect: '/list/search/article',
  //     //       meta: { title: '搜索列表', permission: [ 'table' ] },
  //     //       children: [
  //     //         {
  //     //           path: '/list/search/article',
  //     //           name: 'SearchArticles',
  //     //           component: () => import('../views/list/TableList'),
  //     //           meta: { title: '搜索列表（文章）', permission: [ 'table' ] }
  //     //         },
  //     //         {
  //     //           path: '/list/search/project',
  //     //           name: 'SearchProjects',
  //     //           component: () => import('../views/list/TableList'),
  //     //           meta: { title: '搜索列表（项目）', permission: [ 'table' ] }
  //     //         },
  //     //         {
  //     //           path: '/list/search/application',
  //     //           name: 'SearchApplications',
  //     //           component: () => import('../views/list/TableList'),
  //     //           meta: { title: '搜索列表（应用）', permission: [ 'table' ] }
  //     //         },
  //     //       ]
  //     //     },
  //     //   ]
  //     // },
  //     //
  //     // // profile
  //     // {
  //     //   path: '/profile',
  //     //   name: 'profile',
  //     //   component: RouteView,
  //     //   redirect: '/profile/basic',
  //     //   meta: { title: '详情页', icon: 'profile', permission: [ 'profile' ] },
  //     //   children: [
  //     //     {
  //     //       path: '/profile/basic',
  //     //       name: 'ProfileBasic',
  //     //       component: () => import('@/views/profile/basic/Index'),
  //     //       meta: { title: '基础详情页', permission: [ 'profile' ] }
  //     //     },
  //     //     {
  //     //       path: '/profile/advanced',
  //     //       name: 'ProfileAdvanced',
  //     //       component: () => import('@/views/profile/advanced/Advanced'),
  //     //       meta: { title: '高级详情页', permission: [ 'profile' ] }
  //     //     }
  //     //   ]
  //     // },
  //     //
  //     // // result
  //     // {
  //     //   path: '/result',
  //     //   name: 'result',
  //     //   component: PageView,
  //     //   redirect: '/result/success',
  //     //   meta: { title: '结果页', icon: 'check-circle-o', permission: [ 'result' ] },
  //     //   children: [
  //     //     {
  //     //       path: '/result/success',
  //     //       name: 'ResultSuccess',
  //     //       component: () => import(/* webpackChunkName: "result" */ '@/views/result/Success'),
  //     //       meta: { title: '成功', hiddenHeaderContent: true, permission: [ 'result' ] }
  //     //     },
  //     //     {
  //     //       path: '/result/fail',
  //     //       name: 'ResultFail',
  //     //       component: () => import(/* webpackChunkName: "result" */ '@/views/result/Error'),
  //     //       meta: { title: '失败', hiddenHeaderContent: true, permission: [ 'result' ] }
  //     //     }
  //     //   ]
  //     // },
  //     //
  //     // // Exception
  //     // {
  //     //   path: '/exception',
  //     //   name: 'exception',
  //     //   component: RouteView,
  //     //   redirect: '/exception/403',
  //     //   meta: { title: '异常页', icon: 'warning', permission: [ 'exception' ] },
  //     //   children: [
  //     //     {
  //     //       path: '/exception/403',
  //     //       name: 'Exception403',
  //     //       component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/403'),
  //     //       meta: { title: '403', permission: [ 'exception' ] }
  //     //     },
  //     //     {
  //     //       path: '/exception/404',
  //     //       name: 'Exception404',
  //     //       component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
  //     //       meta: { title: '404', permission: [ 'exception' ] }
  //     //     },
  //     //     {
  //     //       path: '/exception/500',
  //     //       name: 'Exception500',
  //     //       component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500'),
  //     //       meta: { title: '500', permission: [ 'exception' ] }
  //     //     }
  //     //   ]
  //     // },
  //     //
  //     // // account
  //     // {
  //     //   path: '/account',
  //     //   component: RouteView,
  //     //   name: 'account',
  //     //   meta: { title: '个人页', icon: 'user', keepAlive: true, permission: [ 'user' ] },
  //     //   children: [
  //     //     {
  //     //       path: '/account/center',
  //     //       name: 'center',
  //     //       component: () => import('@/views/account/center/Index'),
  //     //       meta: { title: '个人中心', keepAlive: true, permission: [ 'user' ] }
  //     //     },
  //     //     {
  //     //       path: '/account/settings',
  //     //       name: 'settings',
  //     //       component: () => import('@/views/account/settings/Index'),
  //     //       meta: { title: '个人设置', hideHeader: true, keepAlive: true, permission: [ 'user' ]  },
  //     //       redirect: '/account/settings/base',
  //     //       alwaysShow: true,
  //     //       children: [
  //     //         {
  //     //           path: '/account/settings/base',
  //     //           name: 'BaseSettings',
  //     //           component: () => import('@/views/account/settings/BaseSetting'),
  //     //           meta: { title: '基本设置', hidden: true, keepAlive: true, permission: [ 'user' ]  }
  //     //         },
  //     //         {
  //     //           path: '/account/settings/security',
  //     //           name: 'SecuritySettings',
  //     //           component: () => import('@/views/account/settings/Security'),
  //     //           meta: { title: '安全设置', hidden: true, keepAlive: true, permission: [ 'user' ]  }
  //     //         },
  //     //         {
  //     //           path: '/account/settings/custom',
  //     //           name: 'CustomSettings',
  //     //           component: () => import('@/views/account/settings/Custom'),
  //     //           meta: { title: '个性化设置', hidden: true, keepAlive: true, permission: [ 'user' ]  }
  //     //         },
  //     //         {
  //     //           path: '/account/settings/binding',
  //     //           name: 'BindingSettings',
  //     //           component: () => import('@/views/account/settings/Binding'),
  //     //           meta: { title: '账户绑定', hidden: true, keepAlive: true, permission: [ 'user' ]  }
  //     //         },
  //     //         {
  //     //           path: '/account/settings/notification',
  //     //           name: 'NotificationSettings',
  //     //           component: () => import('@/views/account/settings/Notification'),
  //     //           meta: { title: '新消息通知', hidden: true, keepAlive: true, permission: [ 'user' ]  }
  //     //         },
  //     //       ]
  //     //     },
  //     //   ]
  //     // }
  //   ]
  // },
  // {
  //   path: '*', redirect: '/404', hidden: true
  // }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/register/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/register/RegisterResult')
      },
      {
        path: 'alteration',
        name: 'alteration',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/alteration/Alteration')
      },
      {
        path: 'verify',
        name: 'verify',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/verification/Verification')
      },
    ]
  },

  // {
  //   path: '/',
  //   name: 'index',
  //   component: TabLayout,
  //   meta: {title: '首页'},
  //   redirect: '/dashboard/workplace',
  //   children: [
  //     {
  //       path: '/online',
  //       name: 'online',
  //       redirect: '/online',
  //       component: RouteView,
  //       meta: {title: '在线开发', icon: 'dashboard', permission: ['dashboard']},
  //       children: [
  //         {
  //           path: '/online/auto/:code',
  //           name: 'report',
  //           component: () => import('@/views/modules/online/cgreport/OnlCgreportAutoList')
  //         },
  //       ]
  //     },
  //   ]
  // },

  {
    // OAuth2 APP页面路由
    path: '/oauth2-app',
    component: BlankLayout,
    redirect: '/oauth2-app/login',
    children: [
      {
        // OAuth2 登录路由
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "oauth2-app.login" */ '@/views/user/oauth2/OAuth2Login')
      },
    ]
  },

  {
    path: '/test',
    component: BlankLayout,
    redirect: '/test/home',
    children: [
      {
        path: 'home',
        name: 'TestHome',
        component: () => import('@/views/Home')
      }
    ]
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  },
  {
    path: '/createPaper/:opt',
    name: 'createPaper',
    component: () => import( '@/views/SmartPaper/createPaper.vue'),
    meta:{
      title:'新建试卷'
    },
  },
  {
    path: '/createPaper/:opt/:id',
    name: 'editPaper',
    component: () => import( '@/views/SmartPaper/createPaper.vue'),
    meta: {
      title: '修改试卷'
    }
  },
  {
    path: '/myExam',
    name: 'myExam',
    component: () => import( '@/views/SmartPaper/myExam.vue'),
    meta: {
      title: '考试页面'
    }
  },
  {
    path: '/myExamAdaptive',
    name: 'myExamAdaptive',
    component: () => import( '@/views/SmartPaper/myExamAdaptive.vue'),
    meta: {
      title: '小程序考试页面'
    }
  },

  {
    path: '/createSurvey/:opt',
    name: 'createSurvey',
    component: () => import( '@/views/SmartSurvey/createSurvey.vue'),
    meta:{
      title:'新建调查问卷'
    },
  },
  {
    path: '/createSurvey/:opt/:id',
    name: 'editSurvey',
    component: () => import( '@/views/SmartSurvey/createSurvey.vue'),
    meta: {
      title: '修改调查问卷'
    }
  },
  {
    path: '/mySurvey',
    name: 'mySurvey',
    component: () => import( '@/views/SmartSurvey/mySurvey.vue'),
    meta: {
      title: '调查问卷页面'
    }
  },
  {
    path: '/mySurveyAdaptive',
    name: 'mySurveyAdaptive',
    component: () => import( '@/views/SmartSurvey/mySurveyAdaptive.vue'),
    meta: {
      title: '小程序调查问卷页面'
    }
  },

  {
    path: '/createTriPrePlusSurvey/:opt',
    name: 'createTriPrePlusSurvey',
    component: () => import( '@/views/SmartTriPrePlusSurvey/createTriPrePlusSurvey.vue'),
    meta:{
      title:'新建三员+调查问卷'
    },
  },
  {
    path: '/createTriPrePlusSurvey/:opt/:id',
    name: 'editTriPrePlusSurvey',
    component: () => import( '@/views/SmartTriPrePlusSurvey/createTriPrePlusSurvey.vue'),
    meta: {
      title: '修改三员+调查问卷'
    }
  },
  {
    path: '/myTriPrePlusSurvey',
    name: 'myTriPrePlusSurvey',
    component: () => import( '@/views/SmartTriPrePlusSurvey/myTriPrePlusSurvey.vue'),
    meta: {
      title: '三员+调查问卷页面'
    }
  },
  {
    path: '/myTriPrePlusAppSurvey',
    name: 'myTriPrePlusAppSurvey',
    component: () => import( '@/views/SmartTriPrePlusSurvey/myTriPrePlusAppSurvey.vue'),
    meta: {
      title: '三员+调查问卷小程序页面'
    }
  },

  //纠治四风扫描二维码之前以及扫码后页面
  {
    path:'/InsertReportingInformation/InsertReportingInformationDetail',
    name:'InsertReportingInformation',
    component: () => import('@views/InsertReportingInformation/InsertReportingInformationDetail'),
    meta:{
      title:'填写举报信息'
    }
  },

  //纠治四风扫描二维码填写信息后（跳转中）
  {
    path:'/InsertReportingInformation/Success',
    name:'success',
    component: () => import('@views/InsertReportingInformation/Success'),
    meta:{
      title:'跳转成功'
    }

  },


  /**
   * 下面代码为了简化APP端访问后台，取消侧边栏
   */
  // 通知公告
  {
    path: '/webview/notify',
    component: () => import('@/views/message/MyMsgMobile')
  },
  // @TODO 信息公示
  // {
  //   path: '/webview/msg',
  //   component: () => import('@/views/system/UserAnnouncementList')
  // },
  // 调查问卷
  {
    path: '/webview/survey/statistics',
    component: () => import('@/views/SmartSurvey/SmartSurveyList')
  },
  {
    path: '/webview/survey',
    component: () => import('@/views/SmartTriPrePlusSurvey/SmartSurveyAppList')
  },
  // 阳光评廉
  {
    path: '/SmartEvaluate/modules/SmartEvaluateForm',
    component: () => import('@/views/SmartEvaluate/modules/SmartEvaluateForm')
  },
  {
    path: '/webview/success',
    component: () => import('@/views/SmartEvaluate/modules/Success')
  },
  {
    path: '/webview/sun/statistics',
    component: () => import('@/views/SmartEvaluate/SmartPeopleAvgList')
  },
  {
    path: '/webview/sun/report',
    component: () => import('@/views/InsertReportingInformation/InsertReportingInformationDetail')
  },

  // 政策查询
  {
    path: '/webview/search',
    component: () => import('@/views/smart_data_sheet_new/SmartDataSheetNewPAPList')
  },
  // 村情互动
  {
    path: '/webview/village',
    component: () => import('@/views/interaction/Home1')
  },
  // 学习园地
  {
    path: '/webview/study/exam',
    component: () => import('@/views/SmartPaper/SmartMyExamAppList')
  },
  {
    path: '/webview/study',
    component: () => import('@/views/courcopy/learning/wxIndex')
  },
  {
    path: '/webview/study/statistics',
    component: () => import('@/views/SmartPaper/SmartExamAppList')
  },
  // 课程列表
  {
    path: '/webview/class/list/:id',
    component: () => import('@/views/courcopy/learning/_id')
  },
  {
    path: '/webview/study/statistics',
    component: () => import('@/views/MyExam/GradeList')
  },
  // 日历
  {
    path: '/webview/calendar',
    component: () => import('@/views/calendar/fullcalendar')
  },
  // 视频播放
  {
    path: '/webview/player',
    component: () => import('@/views/courcopy/learning/player/SmartVideoText')
  },
  {
    path: '/player',
    component: () => import('@/views/courcopy/learning/player/SmartVideoText')
  },
  {
    path: 'webview/edu/upload',
    component: () => import('@/views/SmartPublicityEducation/AddSmartPublicityEducation')
  },
]
