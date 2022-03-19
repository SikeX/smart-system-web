smart-system-web
====

项目框架基于**jeecg-boot**: https://github.com/jeecgboot/jeecg-boot

#### 协作文档

本仓库目前有2个分支，master和dev。主要在dev分支上进行开发和测试，功能完善之后再合并到master。

```
├─master
└─dev
```

#### 1.1、准备工作

* 前端仓库： https://github.com/SikeX/smart-system-web
* 后端仓库： https://github.com/SikeX/smart-system-server

在github上fork（前端，后端）仓库到你自己的github，将你fork之后的远程仓库克隆到本地，并在你的本地仓库上添加上游仓库，即源仓库。fork一般是fork了仓库的master分支，所以可能还需要自己去切出dev分支然后拉取源仓库dev分支上的内容。

```
# 前端
git clone https://github.com/{你的github}/smart-system-web
# 后端
git clone https://github.om/{你的github}/smart-system-server
```
在clone完成后需要添加远程仓库

**前端**
```
# 上游的源仓库地址只需添加一次，在你的本地前端项目
git remote add upstream https://github.com/SikeX/smart-system-web.git
# 然后添加你自己的远程仓库（如果你是clone的话，就已经自动添加的，如果你是下载的zip则需要手动添加）
git remote add origin https://github.com/{你的github}/smart-system-web.git
```
**后端**
```
# 上游的源仓库地址只需添加一次，在你的本地后端项目
git remote add upstream https://github.com/SikeX/smart-system-server.git
# 然后添加你自己的远程仓库（如果你是clone的话，就已经自动添加的，如果你是下载的zip则需要手动添加）
git remote add origin https://github.com/{你的github}/smart-system-server.git
```
同步上游分支的内容
```
# 切出dev分支并拉取源仓库dev分支上的内容
git checkout -b dev
# 建议使用rebase拉取上游分支
git pull upstream dev --rebase
```

#### 1.2.1、协作方式-1

要开发某个模块的时候，在你的本地仓库创建一个分支，例如mydev。

```
git checkout -b mydev
```

切换之后你的本地仓库上就有3个分支了，如下所示。checkout之后会自动切换到mydev分支。

```
├─master
├─dev
└─mydev
```

在mydev分支上进行开发和测试，完成相应的功能或者模块，完成之后再切回到dev分支将mydev的内容合并到dev。

```
# mydev分支上提交你的更新
git add .
git commit -m "add something"
# 切换到dev分支
git checkout dev
```

由于在你开发过程中，我也可能在开发并且更新了仓库，为了避免冲突，在合并分支之前你还需要更新你本地仓库的dev分支。先在本地仓库上添加上游仓库upstream，上游仓库即我的仓库，然后使用pull命令从上游仓库拉取更新。

```
# 拉取上游的源仓库dev分支上的更新
# 建议使用rebase进行合并
git pull upstream dev --rebase
```

更新完dev之后，将mydev分支合并到dev分支并提交到你自己的远程仓库。完成之后，mydev分支就可以删除了，你也可以继续留着。

```
# 将mydev分支合并到dev，可能会有冲突需要自行解决
git merge mydev
# 推送到你自己的远程仓库，注意这里是push到origin dev，不是upstream dev
git push origin dev
# 删除mydev分支
git branch -d mydev
```

推送到自己的远程仓库后，就可以到github上面给我发Pull Request了，然后等待我合并你的代码。

#### 1.2.2、协作方式-2

嫌上面太麻烦？你也可以直接在fork之后的的dev分支上面进行开发，然后在发送PR之前先从源仓库拉取更新。

```
# 提交你的代码
git add *
git commit -m "add something"
# 拉取上游的源仓库dev分支上的更新，可能会有冲突需要自行解决
git pull upstream dev
# 推送到你自己的远程仓库，注意这里是push到origin dev，不是upstream dev
git push origin dev
```

#### 1.3、备注

所有拉取远程仓库的更新的操作请在本地仓库上使用命令行完成。

开发之前和合并分支之前从上游仓库dev分支pull一下

```
# 拉取上游的源仓库dev分支上的更新(建议使用rebase 拉去上游分支)
git pull upstream dev --rebase
```

严禁通过其他做法拉取更新（例如在GitHub网站上通过网页操作进行更新然后在本地pull origin dev），以免造成不必要的合并冲突以及多余的commit。

