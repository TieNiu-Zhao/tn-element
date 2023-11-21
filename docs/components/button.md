---
title: Button | Tn-Element
description: Button 组件的文档
---
# Button 按钮
常用操作按钮

## 基础用法
使用 `type`、`plain`、`round` 和 `circle` 来定义按钮的样式。

<preview path="../demo/Button/Basic.vue" title="基础用法" description="Button 组件的基础用法"></preview>

### Button 属性列表
| 属性名    | 功能                                                         | 类型    |
| -------- | ------------------------------------------------------------ | ------- |
| type     | 控制不同的样式（default, primary, danger, info, success, warning） | enum    |
| size     | 大小（small, large）                                         | enum    |
| plain    | 朴素形式，样式不同，背景色为白色                             | boolean |
| round    | 圆角胶囊按钮                                                 | boolean |
| circle   | 圆形按钮                                                     | boolean |
| disabled | 禁用，禁止点击                                               | boolean |
| icon     | 图标                                                         | string  |
| loading  | 加载中                                                       | boolean |