# 批量构建工具

本项目使用 Cocos Creator 3.8.7 自带的扩展插件模板（Vite + Vue3 + Element-Plus + Cocos）来创建。

## 功能

- [x] 自动定位项目引擎路径
- [x] 快捷打开构建窗口界面
- [ ] 构建模版可视化创建
- [x] 支持 `单独构建` 和 `合并构建` 两种构建方式
- [x] 快捷打开 `构建目录` 和 `日志目录`
- [x] 构建失败与重试
- [ ] 扩展插件更新检测
- [x] 自定义导出路径
- [x] 构建场景选择

## 快速使用

1. 在 [Releases](https://github.com/CosmoLau/batch-builder/releases/latest) 发布页面中下载扩展插件 `batch-builder.zip
` 压缩包。
2. 在 Cocos Creator 编辑器中，点击 `扩展` -> `扩展管理器`，点击 `导入扩展文件(.zip)` 图标按钮，选择下载好的 `batch-builder` 扩展插件进行安装。
3. 安装完成后，在扩展管理器的 `已安装扩展` 中应该会自动启用扩展，此时可以在 Cocos Creator 编辑器中依次点击 `扩展` -> `批量构建工具` 来打开可视化面板。

## 开发命令

常用命令如下

```bash
# 安装依赖
npm install
# 启动开发服务
npm run dev
# 构建项目
npm run build
```

## 项目结构

核心模块：`src/panels/components/Bulk.vue`

## 二次开发

如需进行二次开发，可以先 Fork 本仓库，再 Clone 到本地，或者使用以下命令直接 Clone 本仓库：

```bash
git clone https://github.com/CosmoLau/batch-builder.git
```

在项目目录下，使用命令先安装依赖并进行一次构建：

```bash
# 安装依赖
npm install
# 构建项目
npm run build
```

然后在扩展管理器中点击 `导入扩展文件(.zip)` 图标**旁边的下拉按钮**，点击 `开发者导入`，这样会在 Cocos 项目的扩展目录下创建一个本扩展插件项目的软链接，用于开发调试。

> 注意：如果将本扩展插件用于多个项目，使用这个方法导入，只维护一个扩展插件的版本仓库即可，记得将扩展插件文件夹添加到 Cocos 项目版本控制的忽略文件中。
> 
> 如果扩展插件只用于单一的项目，也可以在克隆时，直接将整个仓库放在 `extensions` 目录下，可以不用添加到版本控制的忽略文件中，随 Cocos 项目进行版本提交即可。或者如果想减小仓库体积，可以忽略 `node_modules` 文件夹。

开发时主要修改 `src/panels/components/Bulk.vue` 文件中的内容。

调试时使用 `npm run dev` 监听代码变化，修改代码后会执行 `npm run build --development` 构建成 `development` 模式的代码，存放于 `dist` 目录下。

先确保在 `扩展` -> `扩展管理器` -> `已安装扩展` 中打开 `batch-builder` 扩展插件。

在 Cocos Creator 编辑器中依次点击 `扩展` -> `批量构建工具` 来打开可视化面板进行预览，修改代码后如果面板显示异常，需要重新打开面板（建议不管面板是否异常，每次都重新打开）。

`package.json` 中的一些扩展设置可能需要在 `扩展编辑器` 中重启扩展插件才会生效。

## i18n

本项目支持国际化，将文本写入 `i18n` 对应的语言文件中即可。
