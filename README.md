# `批量构建工具` 项目介绍

本项目使用 Cocos Creator 3.8.7 自带的扩展插件模板（Vite + Vue3 + Element-Plus + Cocos）来创建。

## 使用

1. 打开 Cocos Creator 3.8.7 编辑器。
2. 点击 `扩展` -> `扩展管理器` -> `已安装扩展` 中打开 `batch-builder` 扩展插件。
3. 在 Cocos Creator 编辑器中依次点击 `扩展` -> `批量构建工具` 来打开可视化面板。

## 命令

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

## 开发

开发时主要修改 `src/panels/components/Bulk.vue` 文件中的内容。

调试时使用 `npm run dev` 监听代码变化，修改代码后会执行 `npm run build --development` 构建成 `development` 模式的代码，存放于 `dist` 目录下。

先确保在 `扩展` -> `扩展管理器` -> `已安装扩展` 中打开 `batch-builder` 扩展插件。

在 Cocos Creator 编辑器中依次点击 `扩展` -> `批量构建工具` 来打开可视化面板进行预览，修改代码后如果面板显示异常，需要重新打开面板（建议不管面板是否异常，每次都重新打开）。

`package.json` 中的一些扩展设置可能需要在 `扩展编辑器` 中重启扩展插件才会生效。

## i18n

本项目支持国际化，将文本写入 `i18n` 对应的语言文件中即可。
