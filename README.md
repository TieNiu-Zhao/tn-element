# 组件封装项目

## Button 按钮组件

核心原理就是给 tn-button 动态添加类，然后新添加的样式覆盖旧样式

- **需求分析**：关注样式，无交互

- 属性列表

  | 属性名   | 功能                                                         | 类型    |
  | -------- | ------------------------------------------------------------ | ------- |
  | type     | 控制不同的样式（default, primary, danger, info, success, warning） | enum    |
  | size     | 大小（small, large）                                         | enum    |
  | plain    | 朴素形式，样式不同，背景色为白色                             | boolean |
  | round    | 圆角胶囊按钮                                                 | boolean |
  | circle   | 圆形按钮                                                     | boolean |
  | disabled | 禁用，禁止点击                                               | boolean |
  | icon     | 图标                                                         | string  |
  | loading  | 加载中                                                       | boolean |

  相关代码

  ```typescript
  // 定义字符串字面量
  export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info'
  export type ButtonSize = 'large' | 'small'
  // 这个 type 是对原生 button 的 type 的还原
  export type NativeType = 'button' | 'submit' | 'reset'
  
  export interface ButtonProps {
      type?: ButtonType
      size?: ButtonSize
      plain?: boolean
      round?: boolean
      circle?: boolean
      disabled?: boolean
      nativeType?: NativeType
      autofocus?: boolean
      icon?: string
      loading?: boolean
  }
  export interface ButtonInstance {
      ref: HTMLButtonElement
  }
  ```

- Button 组件的本质

  就是属性配置不同的类

  ```html
  class="tn-button-primary tn-button-large is-plain is-round is-disabled"
  ```

  【**动态添加类的方法**】

  ```html
  <div :class="{ active: isActive }"></div>
  ```

  active 类的存在取决于 isActive 是否为真

- **动态属性与静态属性**

  App.vue 上

  ```vue
  <Button size="large">按钮</Button>
  ```

  这样传给子组件 Button 的是静态属性，是无法改变的，子组件可以用 size: 'large' 直接使用

  而

  ```vue
  <Button :size="large">按钮</Button>
  ```

  这样传给子组件 Button 的是动态属性，会根据 App.vue 中 large 这个变量的值改变，子组件需要使用 props.size 接收到这个动态的值，还需要约束这个值的类型。
  
- 其他注意事项

  为了让其他组件使用 Button 的 DOM 使用 ref  和 defineExpose() 将组件暴露给外部

  ```vue
  <template>
      <button
          ref="_ref"
      >
          <span>
              <slot></slot>
          </span>
      </button>
  </template>
  <script setup lang="ts">
  import { ref } from 'vue'
  // 为了让使用此组件的人获取 Button 实例，声明 ref 并暴露出去
  const _ref = ref<HTMLButtonElement>()
  // 暴露组件实例
  defineExpose({
      ref: _ref
  })
  </script>
  ```

  然后就可以获取到 DOM 实例

  ```vue
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import Button from './components/Button/Button.vue'
  import type { ButtonInstance } from './components/Button/types'
  const buttonRef = ref<ButtonInstance | null>(null)
  onMounted(() => {
    if (buttonRef.value) {
      // 获取组件 DOM
      console.log('buttonRef', buttonRef.value.ref)
    }
  })
  </script>
  <template>
  	<Button ref="buttonRef">按钮</Button>
  </template>
  ```

  上面的 ButtonInstance 只是为了收窄范围，规定类型为 HTMLButtonElement 而已。

- 关于样式

  使用 PostCSS，出现了相关的类就进行覆盖，并且根据颜色进行一个混合，这部分比较复杂，可以直接去看代码。


---

## Collapse 折叠面板组件

核心是**通过 v-model 维护一个响应式数组**，代表正在打开的 items，点击 item 时判断是否存在于数组，进行添加或删除。

- 需求分析：

  简单的交互，**Provide/inject，v-model，slot，Transition**

  展示多个 item，有标题与内容两部分，点击标题可以关闭和展开内容，还有手风琴模式（点击一个 item，其他展开的 item 会关闭）。

- 使用组件的方式

  ```vue
  <Collapse v-model="openedValue">
    <CollapseItem name="a" title="标题">
      <div>
        <h1>复杂样式</h1>
        <p>内容</p>
      </div>
    </CollapseItem>
  </Collapse>
  <!-- 或者这样 -->
  <Collapse v-model="openedValue">
    <CollapseItem name="a" title="这个标题不会生效">
      <template #title>
        <h1>这个标题会生效</h1>
      </template>
      <h1>内容</h1>
      <div>内容</div>
    </CollapseItem>
  </Collapse>
  ```

  第一种 title 只是字符串，第二种 title 可以是复杂样式，使用具名插槽实现。

  实现：CollapseItem.vue 略去了很多

  ```vue
  <template>
      <div class="tn-collapse-item">
          <div class="tn-collapse-item__header">
              <slot name="title">{{ title }}</slot>
          </div>
          <div class="tn-collapse-item__content">
              <slot></slot>
          </div>
      </div>
  </template>
  ```

  如果使用了具名插槽，就是第二种，否则默认显示第一种 title。

- 属性列表

  Collapse 使用 v-model 传入数组

  | Collapse 属性名 | 功能                                                  | 类型     |
  | --------------- | ----------------------------------------------------- | -------- |
  | modelValue      | 接收一个数组，使得 CollapseItem  对应的 name 默认打开 | string[] |
  | accordion       | 是否支持手风琴模式                                    | boolean  |

  | CollapseItem 属性名 | 功能             | 类型             |
  | ------------------- | ---------------- | ---------------- |
  | name                | 独一无二的标识符 | string \| number |
  | title               | 标题             | string           |
  | disabled            | 是否禁用         | boolean          |

  相关代码：

  ```typescript
  export type NameType = string | number
  export interface CollapseProps {
      modelValue: NameType[]
      accordion?: boolean
  }
  
  export interface CollapseItemProps {
      name: NameType
      title?: string
      disabled?: boolean
  }
  ```

- 事件列表

  ```typescript
  export interface CollapseEmits {
      // 支持 v-model 的必须事件
      (e: 'update:modelValue', values: NameType[]) : void
      // 点击 item 触发 change - 为了监控事件，二者其实一样
      (e: 'change', values: NameType[]) : void
  }
  ```

---

### 难点1：参数传递

- 怎么将父组件 Collapse 的参数要传递给子组件 CollapseItem。

   Collapse.vue

   ```vue
   <template>
       <div class="tn-collapse">
           <slot></slot>
       </div>
   </template>
   <script setup lang="ts">
   import type { NameType } from './types'
   import { ref } from 'vue'
   // 在父组件处理数组变化 - 数组维护当前打开的 item
   const activeNames = ref<NameType[]>([]])
   // 这个函数要传到子组件中调用
   const handleItemClick = (item: NameType) => {
       const index = activeNames.value.indexOf(item)
       if (index > -1) {
           // 存在，删除数组中对应的项
           activeNames.value.splice(index, 1)
       } else {
           // 不存在，插入对应的 name
           activeNames.value.push(item)
       }
   }
   ```
   
   需要将 activeNames 与 handleItemClick 传递到 子组件 Item，因为子组件要判断当前 content 是否被打开，使用 Provide/inject 透传
   
   types.ts
   
   ```typescript
   export interface CollapseContent {
       activeNames: Ref<NameType[]>
       handleItemClick: (name: NameType) => void
   }
   export const collapseContentKey: InjectionKey<CollapseContent> = Symbol('collapseContentKey')
   ```

   Collapse.vue
   
   ```vue
   <script setup lang="ts">
   import { provide } from 'vue'
   import { collapseContentKey } from './types'
   // 传递给子组件
   provide(collapseContentKey, {
       activeNames,
       handleItemClick
   })
   </script>
   ```
   
   CollapseItem.vue
   
   ```vue
   <template>
       <div class="tn-collapse-item">
           <div class="tn-collapse-item__header" @click="handleClick">
               <slot name="title">{{ title }}</slot>
           </div>
           <div class="tn-collapse-item__content" v-show="isActive">
               <slot></slot>
           </div>
       </div>
   </template>
   <script setup lang="ts">
   import { inject, computed } from 'vue'
   import { collapseContentKey } from './types'
   // 拿到数组和方法
   const collapseContext = inject(collapseContentKey)
   // 包含说明状态为打开，不包含说明关闭-
   const isActive = computed(() => collapseContext?.activeNames.value.includes(props.name))
   // 处理函数需要判断是否是禁用所以包了一层
   const handleClick = () => {
       if (props.disabled) { return }
       collapseContext?.handleItemClick(props.name)
   }
   </script>
   ```

---

### 难点2：支持 v-model

- 支持 v-model

   上面已经确定好属性与事件了。即 CollapseProps 与 CollapseEmits
   
   Collapse.vue
   
   ```vue
   <script setup lang="ts">
   import type { NameType, CollapseProps, CollapseEmits } from './types'
   const props = defineProps<CollapseProps>()
   const emits = defineEmits<CollapseEmits>()
   // 使用时会在父组件上使用 v-model 传入默认打开的数组，使用 props.modelValue 接收数组
   const activeNames = ref<item: NameType[]>(props.modelValue)
   const handleItemClick = (item: NameType) => {
       if (props.accordion) {
           // 手风琴
           activeNames.value = [ activeNames.value[0] === item ? '' : item ]
       } else {
           // 非手风琴
           const index = activeNames.value.indexOf(item)
           if (index > -1) {
               activeNames.value.splice(index, 1)
           } else {
               activeNames.value.push(item)
           }
           // 主要看这，发送两个事件，一个 v-model 必须支持的事件一个为了监听弄得 change 事件
           emits('update:modelValue', activeNames.value)
           emits('change', activeNames.value)
       }
   }
   </script>
   ```
   
   这时有个问题：如果在 App.vue 中声明响应式数组添加到 v-model 上，会默认打开对应的标签，但如果设置 setTimeout() 一定时间后修改响应式数组，**无法更新**，原因出在：
   
   Collapse.vue
   
   ```typescript
   const activeNames = ref<NameType[]>(props.modelValue)
   ```
   
   activeNames 只赋值了一次，只会获取第一次 v-model 传入的值，所以要监听 activeNames
   
   ```typescript
   watch(() => props.modelValue, () => {
       activeNames.value = props.modelValue
   })
   ```
   
   以后**一旦 props 传递给本地的 ref，就要想到用 watch 解决异步 DOM 更新问题**

---

## Icon 图标组件 - 二次封装

使用 fontawesome 图标库进行二次开发，fontawesome 本身提供了属性类型

- 拷贝类型并使用

  ```typescript
  export interface IconProps {
      // ...很多，直接从 FontAwesomeIconProps 拷贝而来
  }
  ```

  Icon.vue

  ```vue
  <template>
      <i class="tn-icon" >
          <font-awesome-icon v-bind="$props"/>
      </i>
  </template>
  <script setup lang="ts">
  import type { IconProps } from './types'
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
  defineOptions({
      name: 'TnIcon',
      inheritAttrs: false
  })
  const props = defineProps<FontAwesomeIconProps>()
  </script>
  ```

  使用 $props 可以获取所有属性，但默认添加到根组件上，需要设置 inheritAttrs: false 阻止透传

  然后就可以使用 Icon 组件了

- 添加属性

  | Icon 属性名 | 功能                                           | 类型                                                      |
  | ----------- | ---------------------------------------------- | --------------------------------------------------------- |
  | type        | 类型，和 Button 类似，动态添加类以实现对应颜色 | 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' |
  | color       | 颜色                                           | string                                                    |

  因为添加了两个新类型，所以本来的 $props 需要进行过滤，滤除这两个属性，使用 lodash 的 omit

  ```vue
  <template>
      <i 
          class="tn-icon"
          :class="{[`tn-icon--${type}`] : type }"
         	:style="customStyles"
      >
          <font-awesome-icon  v-bind="filteredProps"/>
      </i>
  </template>
  <script setup lang="ts">
  import type { IconProps } from './types'
  import { omit } from 'lodash-es'
  import { computed } from 'vue'
  // 要将属性过滤一下，使用 lodash 的 omit 函数
  const props = defineProps<IconProps>()
  // 使用 computed 可以在异步修改的时候重新计算，相应式的 props 进行计算一定要用 computed 包裹
  const filteredProps = computed(() => omit(props, ['type', 'color']))
  // 根据 color 属性添加颜色
  const customStyles = computed(() => {
      return props.color ? { color: props.color } : {}
  })
  </script>
  ```

  注意 computed 包裹 props

---

## Alert 组件

---

## Tooltip 通用浮层组件

Tooltip 组件是通用组件，后面的 Dropdown、Select 等组件都基于此组件二次开发

- 需求分析：

  触发区与展示区，触发方式有 hover、点击、手动

  即触发区发生特定事件时，展示区显示或隐藏

- 使用组件的方式

  ```vue
  <Tooltip content="展示文本内容">
    <Button size="large">触发区</Button>
  </Tooltip>
  <!-- 或者这样 -->
  <Tooltip>
    <Button size="large">触发区</Button>
    <template #content>
      <h1>这是展示内容</h1>
      <div>展示复杂结构</div>
    </template>
  </Tooltip>
  ```

  和 Collapse 的感觉很像，可以用属性传简单结构或者用插槽传复杂结构

- 属性列表

  | Tooltip       | 功能                                       | 类型                        |
  | ------------- | ------------------------------------------ | --------------------------- |
  | content       | 内容区域                                   | string                      |
  | trigger       | 触发方式                                   | 'hover' \| 'click'          |
  | placement     | 展示区展示的位置                           | popper 给的类型 Placement   |
  | manual        | 触发手动，设置为 true 的话 trgger 就不生效 | boolean                     |
  | popperOptions | popper 原生的一些选项                      | popper 给的选项类型 Options |
  | transition    | 动画的方式                                 | string                      |
  | openDelay     | 延时展开时间                               | number                      |
  | closeDelay    | 延时关闭时间                               | number                      |

- 事件列表

  ```typescript
  interface TooltioEmits {
      // 标识浮层是否展示或隐藏
      (e: 'visible-change', value: boolean) : void
  }
  ```

- 实例：为手动方式 manual 服务

  ```typescript
  interface TooltipInstance {
  	show: () => void
      hide: () => void
  }
  ```

---

### 安装与使用 popper.js

Element-plus 浮层也基于此库实现

- 安装

  ```bash
  npm i @popperjs/core
  ```

- 使用

  ```vue
  <script>
  // Instance 为 createPopper 返回的实例
  import type { Instance } from '@popperjs/core'
  import { createPropper } from '@popperjs/core'
  import { ref, onMounted } from 'vue'
  import Button from './components/Button/Button.vue'
  // 初始化触发区与相应区
  const triggerNode = ref<HTMLElement>()
  const overlayNode = ref<HTMLElement>()
  // 初始化 popper 实例
  let popperInstance: Instance | null = null
  onMounted(() => {
    if (triggerNode.value && overlayNode.value) {
      // 形成一个 popper， 展示区会展示在触发区的右侧
      // createPopper 会返回一个实例，实例有其他方法
      popperInstance = createPopper(triggerNode.value, overlayNode.value, { placement: 'right' })
    }
  })
  setTimeout(() => {
    // 两秒后展示区从右侧转为底部，使用实例的 setOptions()
    popperInstance?.setOptions({ placement: 'bottom' })
  }, 2000)
  </script>
  <template>
  	<Button type="primary" ref="triggerNode">触发区</Button>
  	<div ref="overlayNode"><h1>展示区</h1></div>
  </template>
  ```

---

### click 与 hover 展示/隐藏实现

- 先实现点击显示/隐藏

  显示和隐藏的同时创建 Popper 实例，为了使用实例上的方法，比如根据传入的 placement 改变展示的位置

  使用 watch 监听 isOpen 的变化，即监听展示区的变化

  ```vue
  <template>
      <div class="tn-tooltip">
          <!-- 点击触发区对 isOpen 取反，控制显示与隐藏 -->
          <div class="tn-tooltip__trigger" ref="triggerNode" @click="togglePopper">
              <slot></slot>
          </div>
          <div
               class="tn-tooltip__popper" 
               ref="popperNode"
               v-if="isOpen"
           >
              <slot name="content">{{ content }}</slot>
      	</div>
      </div>
  </template>
  <script setup lang="ts">
  import type { TooltipProps } from './types'
  import type { Instance } from '@popperjs/core'
  import { createPopper } from '@popperjs/core'
  import { ref, watch } from 'vue'
  const props = withDefaults(defineProps<TooltipProps>(), {
      // 设置默认值 bottom
      placement: 'bottom'
  })
  const isOpen = ref(false)
  const triggerNode = ref<HTMLElement>()
  const popperNode = ref<HTMLElement>()
  // 初始化 popper 实例
  let popperInstance: Instance | null = null
  const togglePopper = () => {
      isOpen.value = !isOpen.value
      emits('visible-change', isOpen.value)	// 广播事件
  }
  // 监听 isOpen
  watch(isOpen, (newValue) => {
      if (newValue) {
          // 显示展示区时，创建 popper 实例
          if (triggerNode.value && popperNode.value) {
              popperInstance = createPopper(triggerNode.value, popperNode.value, { placement: props.placement })
          } else {
              // 隐藏展示区时，销毁 popper 实例
              popperInstance?.destroy()
          }
      }
  }, { flush: 'post' }) // 注意这个 flush，在 DOM 生成后再调用
  </script>
  ```

- 实现 click 与 hover

  v-on 可以接受一个 object，对 object 的每一项都可以作为事件的回调，就像这样：

  ```vue
  <div v-on="events"></div>
  <script>
      const events = { 'click': callback, 'mouseenter': callback }
  </script>
  ```

  改写上面写死的内容，注意两点：

1. 事件绑定在了触发节点上，这会导致鼠标移到展示区，展示区会消失。

   所以要**把触发鼠标离开的事件**放到触发区与展示区的**父节点上监听**

2. 假如是点击触发，要实现点击区域外隐藏展示区

   实现一个 hook：传入响应式 DOM和一个回调，点击 DOM 外部的区域触发回调，借助 DOM 的 contains( ) **判断点击的 DOM 包不包含展示区的 DOM**

   hooks / useClickOutside.ts

   ```typescript
   import { onMounted, onUnmounted } from 'vue'
   import type { Ref } from 'vue'
   // 获取点击一个元素外侧触发相应回调的功能
   const useClickOutside = (elementRef: Ref<undefined | HTMLElement>, callback: (e: MouseEvent) => void) => {
     const handler = (e: MouseEvent) => {
       if (elementRef.value && e.target) {
         // 使用 contains() 判断点击的节点包不包含传入的 DOM
         if (!elementRef.value.contains(e.target as HTMLElement)) {
           callback(e)		// 点到 DOM 外侧出发回调
         }
       }
     }
     // 在 document 上监听 click，记得卸载时取消监听
     onMounted(() => {
       document.addEventListener('click', handler)
     })
     onUnmounted(() => {
       document.removeEventListener('click', handler)
     })
   }
   
   export default useClickOutside
   ```

   Tooltip.vue 只看非注释的部分就好

   ```vue
   <template>
       <div class="tn-tooltip" v-on="outerEvents" ref="popperContainerNode">
           <!-- 添加 v-on="events" -->
           <div class="tn-tooltip__trigger" ref="triggerNode" v-on="events">
               <slot></slot>
           </div>
           <div class="tn-tooltip__popper" ref="popperNode" v-if="isOpen">
               <slot name="content">{{ content }}</slot>
       	</div>
       </div>
   </template>
   <script setup lang="ts">
   /*
   import type { TooltipProps } from './types'
   import type { Instance } from '@popperjs/core'
   import { createPopper } from '@popperjs/core' */
   import { ref, watch, reactive } from 'vue'
   import useClickOutside from '../../hooks/useClickOutside'
   /*
   const props = withDefaults(defineProps<TooltipProps>(), {
       // 设置默认触发方式 hover
       placement: 'bottom',
       trigger: 'hover',
   })
   const isOpen = ref(false)
   const triggerNode = ref<HTMLElement>()
   const popperNode = ref<HTMLElement>()
   let popperInstance: Instance | null = null
   const togglePopper = () => {
       isOpen.value = !isOpen.value
       emits('visible-change', isOpen.value)
   }
   */
   let events: Record<string, any> = reactive({})
   let outerEvents: Record<string, any> = reactive({})
   const open = () => {
       isOpen.value = true
       emits('visible-change', true)
   }
   const close = () => {
       isOpen.value = false
       emits('visible-change', false)
   }
   const attachEvents = () => {
       // 根据设置的不同的 trigger 在 events 里加不同的回调
       if (props.trigger === 'hover') {
           events['mouseenter'] = open
           outerEvents['mouseleave'] = close	// 这里鼠标离开要绑在父节点上
       } else if (props.trigger === 'click') {
           events['click'] = togglePoper
       }
   }
   // setup 执行时要执行一次
   attachEvents()
   // 监听 trigger 属性
   watch(() => props.trigger, (newTrigger, oldTrigger) => {
       if (newTrigger !== oldTrigger) {
           events = {}
           outerEvents = {}
           attachEvents()
       }
   })
   // 用 hook 实现点击外侧隐藏
   useClickOutside(popperContainerNode, () => {
       if (props.trigger === 'click' && isOpen.value) {
           close()
       }
   })
   /*
   watch(isOpen, (newValue) => {
       if (newValue) {
           // 显示展示区时，创建 popper 实例
           if (triggerNode.value && popperNode.value) {
               popperInstance = createPopper(triggerNode.value, popperNode.value, { placement: props.placement })
           } else {
               // 隐藏展示区时，销毁 popper 实例
               popperInstance?.destroy()
           }
       }
   }, { flush: 'post' }) // 注意这个 flush，在 DOM 生成后再调用 */
   ```

---

### 支持手动触发与 popper 参数

- 把实例暴露出方法，可以手动触发展示区打开与关闭

  属性值为 manual

  ```typescript
  export interface TooltipProps {
  	// ...
      manual?: boolean
  }
  
  export interface TooltipInstance {
      show: () => void
      hide: () => void
  }
  ```

  Tooltip.vue

  支持手动触发要做的就是：先解除事件绑定，新建对应实例（TooltipInstance），最后暴露出去即可

  ```vue
  <template>
      <div class="tn-tooltip" v-on="outerEvents" ref="popperContainerNode">
          <!-- 添加 v-on="events" -->
          <div class="tn-tooltip__trigger" ref="triggerNode" v-on="events">
              <slot></slot>
          </div>
          <div class="tn-tooltip__popper" ref="popperNode" v-if="isOpen">
              <slot name="content">{{ content }}</slot>
      	</div>
      </div>
  </template>
  
  <script setup lang="ts">
  import type { TooltipProps, TooltipEmits, TooltipInstance } from './types'
  /*
  // ...
  const attachEvents = () => {
      if (props.trigger === 'hover') {
          events['mouseenter'] = open
          outerEvents['mouseleave'] = close
      } else if (props.trigger === 'click') {
          events['click'] = togglePoper
      }
  }
  useClickOutside(popperContainerNode, () => { */
      // 非 manual 模式才处理
      if (props.trigger === 'click' && isOpen.value && !props.manual) {
  /*      close()
      }
  })
  */
  
  if (!props.manual) {
      attachEvents()
  }
  watch(() => props.manual, (isManual) => {
      if (isManual) {	// 是 manual 的话，清空事件
          events = {}
          outerEvents = {}
      } else {
          attachEvents()
      }
  })
  // 优化：卸载时销毁实例
  onUnmounted(() => {
      popperInstance?.destroy()
  })
  // 暴露出去
  defineExpose<TooltipInstance>({
      'show': open,
      'hide': close
  })
  </script>
  ```

  做了以上就可以使用暴露出来的 show 与 hide 手动触发展示区了

  ```vue
  <script>
  import Tooltip from './components/Tooltip/Tooltip.vue'
  import type { TooltipInstance } from './components/Tooltip/types'
  const tooltipRef = ref<TooltipInstance | null>(null)
  // 使用暴露出来的方法
  const open = () => {
    tooltipRef.value?.show()
  }
  const close = () => {
    tooltipRef.value?.hide()
  }
  </script>
  <template>
  	<Tooltip ref="tooltipRef" manual>
        <Button size="large">触发区</Button>
        <template #content>
          <div>展示区：复杂结构</div>
        </template>
      </Tooltip>
  	<Button @click="open">打开展示区</Button>
  	<Button @click="close">关闭展示区</Button>
  </template>
  ```

- 支持 Popper 参数

  popper 本身支持一些参数，即原生选项

  ```typescript
  import type { Placement, Options } from '@popperjs/core'
  export interface TooltipProps {
  	// ...
      placement: Placement
      popperOptions?: Partial<Options>		// Partial 将必选类型变为可选类型
  }
  ```

  定义中的 placement 是 Popper 自带的类型的快捷方式，所以下面的 popperOptions 优先级更高，所以要做一些调整：

  ```vue
  <script setup lang="ts">
  const popperOptions = computed(() => {
      return {
          // 这样让定义的 placement 优先级更高
          placement: props.placement,
          ...props.popperOptions
      }
  })
  /*
  watch(isOpen, (newValue) => {
      if (newValue) {
          // 创建或销毁
          if (triggerNode.value && popperNode.value) { */
              popperInstance = createPopper(triggerNode.value, popperNode.value, popperOptions.value)
  /*      } else {
              popperInstance?.destroy()
          }
      }
  }, { flush: 'post' }) */
  </script>
  ```

---

### 动画与延时显示(防抖)

- 动画就是用 Transition 标签包裹即可

  ```typescript
  export interface TooltipProps {
      // ...
      transition?: string
  }
  ```

  Tooltip.vue

  ```vue
  <template>
      <div class="tn-tooltip" v-on="outerEvents" ref="popperContainerNode">
          <div class="tn-tooltip__trigger" ref="triggerNode" v-on="events">
              <slot></slot>
          </div>
          <!-- 用 Transition 包裹，默认效果为 fade -->
          <Transition :name="transition">
              <div class="tn-tooltip__popper" ref="popperNode" v-if="isOpen">
                  <slot name="content">{{ content }}</slot>
              </div>
          </Transition>
      </div>
  </template>
  <script>
  // ...
  const props = withDefaults(defineProps<TooltipProps>(), {
      // ...设置默认值: 渐隐渐显
      tiansition: 'fade'
  })
  </script>
  ```

  添加 css 并在 index.css 中全局导入

  ```scss
  .tn-tooltip {
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity var(--vk-transition-duration);
    }
  
    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;		// 动画开始时 opacity 为 0
    }
  }
  ```

- 延迟显示

  添加新类型：打开延时和关闭延时

  ```typescript
  export interface TooltipProps {
  	// ...
      openDelay?: number
      closeDelay?: number
  }
  ```

  Tooltip.vue

  以下代码有问题

  ```vue
  <template>
      <div class="tn-tooltip" v-on="outerEvents" ref="popperContainerNode">
          <div class="tn-tooltip__trigger" ref="triggerNode" v-on="events">
              <slot></slot>
          </div>
          <Transition :name="transition">
              <div class="tn-tooltip__popper" ref="popperNode" v-if="isOpen">
                  <slot name="content">{{ content }}</slot>
              </div>
          </Transition>
      </div>
  </template>
  <script setup lang="ts">
  const props = withDefaults(defineProps<TooltipProps>(), {
      // ...设置默认值
      openDelay: 0,
      closeDelay: 0
  })
  const open = () => {
      setTimeout(() => {
          isOpen.value = true
      	emits('visible-change', true)
      }, props.openDelay)
  }
  const close = () => {
  	setTimeout(() => {
          isOpen.value = false
          emits('visible-change', false)
      }, props.closeDelay)
  }
  const togglePoper = () => {
      if (isOpen.value) {
          close()
      } else {
          open()
      }
  }
  </script>
  ```

  上面的代码没有做防抖，如果触发方式为 hover，反复进入会导致频繁触发，要使用 lodash 的 debounce，并修改代码

  ```vue
  <template>
      <div class="tn-tooltip" v-on="outerEvents" ref="popperContainerNode">
          <div class="tn-tooltip__trigger" ref="triggerNode" v-on="events">
              <slot></slot>
          </div>
          <Transition :name="transition">
              <div class="tn-tooltip__popper" ref="popperNode" v-if="isOpen">
                  <slot name="content">{{ content }}</slot>
              </div>
          </Transition>
      </div>
  </template>
  <script setup lang="ts">
  import { debounce } from 'lodash-es'
  const props = withDefaults(defineProps<TooltipProps>(), {
      // ...
      openDelay: 0,
      closeDelay: 0
  })
  const openDebounce = debounce() => {
      setTimeout(() => {
          isOpen.value = true
      	emits('visible-change', true)
      }, props.openDelay)
  }
  const close = () => {
  	setTimeout(() => {
          isOpen.value = false
          emits('visible-change', false)
      }, props.closeDelay)
  }
  // 添加防抖版的 open 与 close
  const openDebounce = debounce(open, props.openDelay)
  const closeDebounce = debounce(close, props.closeDelay)
  // 下面所有原先使用 open 的函数都改成 openDebounce
  const openFinal = () => {
      // 假如频繁触发，最后鼠标落在了触发区，此时延时的 close 就不应触发，使用 cancel 方法
      closeDebounce.cancel()
      openDebounce()
  }
  const closeFinal = () => {
      openDebounce.cancel()
      closeDebounce()
  }
  // 暴露出去的 hide 与 show 改为 openFimal 与 closeFinal
  </script>
  ```

  添加防抖，注意**频繁触发时最后鼠标落在了触发区，此时延时的 close 就不应触发**，debounce 函数的实例上有 **cancel()**，可以清除掉还没触发的防抖函数。

---

Tooltip 的样式略，对话框的样式是用正方形旋转 45 度与定位实现的。

---

## Dropdown 下拉菜单组件

- 需求分析：

  显示 / 隐藏一个具体的有多个选项的菜单，组件基于 Tooltip 二次封装

- 使用方式

  和 Collapse 很像，为了不重复，**采用 js 数据结构的方式**，而不是语义化结构

  ```vue
  <Dropdown :menu-options="options">
  	<Button size="large">下拉菜单</Button>
  </Dropdown>
  ```

  传入 options 就可以展示一系列菜单

- 属性列表

  完全集成 Tooltip

  | Dropdown extends Tooltip | 功能                       | 类型         |
  | ------------------------ | -------------------------- | ------------ |
  | menuOptions              | 传入数组，每一项都是展示项 | MenuOption[] |
  | hideAfterClick           | 点击选项后是否关闭下拉菜单 | boolean      |

  因为这次不用插槽，怎么用 label 传入展示结构是个问题

  | MenuOption | 功能       | 类型                        |
  | ---------- | ---------- | --------------------------- |
  | label      | 展示的结构 | string \| VNode（复杂 DOM） |
  | key        | 唯一标识符 | string \| number            |
  | disabled   | 禁用       | boolean                     |
  | divided    | 有无分隔符 | boolean                     |

- 事件

  ```typescript
  export interface DropdownEmits {
      (e: 'visable-change', value: boolean) : void
      // 点击下拉选项触发事件 - 把 key 传播出去
      (e: 'select', value: MenuOption) : void
  }
  ```

- 实例：暴露出去的方法

  ```typescript
  export interface DropdownInstance {
      show: () => void
      hide: () => void
  }
  ```

---

### 基础雏形与 VNode 支持

- 基础结构

  ```vue
  <template>
      <div
          class="tn-dropdown"
      >
          <!-- 支持 Tooltip 的所有属性 -->
          <Tooltip :trigger="trigger" :placement="placement" :popper-options="popperOptions"
              :open-delay="openDelay" :close-delay="closeDelay" @visable-change="visibleChange"
              ref="tooltipRef"
          >
              <!-- 作为 Tooltip 的触发区插槽 -->
              <slot></slot>
              <!-- 作为 Tooltip 的展示区插槽 -->
              <template #content>
                  <ul class="tn-dropdown__menu">
                      <template v-for="item in menuOptions" :key="item.key">
                          <!-- 如果设置了 divided 标签间会有条线 -->
                          <li
                              v-if="item.divided"
                              role="separator"
                              class="divided-placeholder"
                          >
                          </li>
                          <!-- 下拉选项结构 -->
                          <li 
                              class="tn-dropdown__item"
                              @click="itemClick(item)"
                              :class="{'is-disabled': item.disabled, 'is-divided': item.disabled}"
                              :id="`dropdown-item-${item.key}`"
                          >
                              {{ item.label }}
                          </li>
                      </template>
                  </ul>
              </template>
          </Tooltip>
      </div>
  </template>
  
  <script setup lang="ts">
  import type { DropdownProps, DropdownEmits, DropdownInstance, MenuOption } from './types'
  import type { Ref } from 'vue'
  import type { TooltipInstance } from '../Tooltip/types'
  import Tooltip from '../Tooltip/Tooltip.vue'
  defineOptions({
      name: 'TnDropdown'
  })
  // 默认点击选项后关闭菜单
  const props = withDefaults(defineProps<DropdownProps>(), { hideAfterClick: true })
  const emits = defineEmits<DropdownEmits>()
  // visible-change 是 Tooltip 的事件：标识展示区显示还是隐藏
  const visibleChange = (e: boolean) => {
      emits('visable-change', e)
  }
  // 获取 Tooltip 实例 - 类型断言
  const tooltipRef = ref() as Ref<TooltipInstance>
  const itemClick = (e: MenuOption) => {
      if (e.disabled) return
      emits('select', e)
      // 点击后关闭菜单
      if (props.hideAfterClick) {
          tooltipRef.value.hide()
      }
  }
  // 暴露 show 与 hide - 外部触发
  defineExpose({
      show: tooltipRef.value?.show,
      hide: tooltipRef.value?.hide
  })
  </script>
  ```

  然后就可以使用 Dropdown 了

  ```vue
  <script>
  import Dropdown from './components/Dropdown/Dropdown.vue'
  import type { MenuOption } from './components/Dropdown/types'
  // 定义下拉选项
  const options: MenuOption[] = [
    {key: 1, label: 'item1' },
    {key: 2, label: 'item2', disabled: true},
    {key: 3, label: 'item3', divided: true},
    {key: 4, label: 'item4'}
  ]
  </script>
  <template>
    <Dropdown :menu-options="options" placement="bottom" trigger="click">
      <Button>下拉菜单</Button>
    </Dropdown>
  </template>
  ```

- 支持VNode复杂结构

  上面的只支持简单的 label 文本，要在不使用插槽传入复杂结构的情况下传入复杂结构

  使用时：

  ```vue
  <script>
  import Dropdown from './components/Dropdown/Dropdown.vue'
  import type { MenuOption } from './components/Dropdown/types'
  import { h } from 'vue'
  const options: MenuOption[] = [
    // 传入复杂结构
    {key: 1, label: h('b', '粗体item1') },
    {key: 2, label: 'item2', disabled: true},
    {key: 3, label: 'item3', divided: true},
    {key: 4, label: 'item4'}
  ]
  </script>
  <template>
    <Dropdown :menu-options="options" placement="bottom" trigger="click">
      <Button>下拉菜单</Button>
    </Dropdown>
  </template>
  ```

  h 函数接收三个参数：h(type, string, children?)

  第一个参数为 html 标签或组件，第二个参数为字符串，第三参数应该是子结构（大概），h函数返回 VNode
  
  会发现展示不出复杂结构，而是一个复杂对象。原因在于：
  
  ```vue
  <li class="tn-dropdown__item">{{ item.label }}</li>
  ```
  
  **解决办法 Render function**
  
  在 components 下新建 Common / RenderVnode.ts 中介组件
  
  此组件将自动解析 VNode 节点
  
  ```typescript
  import { defineComponent } from 'vue'
  const RenderVnode = defineComponent({
      props: {
          vNode: {
              type: [String, Object],
              required: true      // 必选
          }
      },
      setup(props) {
          return () => props.vNode		// 返回 function
      }
  })
  
  export default RenderVnode
  ```
  
  然后导入使用即可
  
  ```vue
  <template>
    <!-- ... -->
    <!-- <li class="tn-dropdown__item">{{ item.label }}</li> -->
    <li class="tn-dropdown__item">
      <RenderVnode :vNode="item.label"></RenderVnode>
    </li>
  </template>
  <script setup lang="ts">
  import RenderVnode from '../Common/RenderVnode'
  // ,,,
  </script>
  ```

---

### tsx 的组件写法

- 学习使用 Rednerfunction 写整个组件的方法：

  jsx 本质是 h 函数的语法糖

  注意几处：

  原本的 v-if  

  ```vue
  <li v-if="item.divided" role="separator" class="divided-placeholder">
  ```

  变为

  ```tsx
  { item.divided ? <li role="separator" class="divided-placeholder"/> : '' }
  ```

  原本的 v-for

  ```vue
  <ul class="tn-dropdown__menu">
      <template v-for="item in menuOptions" :key="item.key">
          <!-- ... -->
      </template>
  </ul>
  ```

  变为

  ```tsx
  { items.map(item => <li>{item}</li>) }
  ```

  原本的 @click 变为

  ```tsx
  onClick={() => {itemClick(item)}}
  ```

  原本的 slot

  ```vue
  <slot></slot>
  <slot name="footer"></slot>
  ```
  
  变为
  
  ```
  { slots.default() }
  { slots.footer() }
  ```
  
  完整的代码：
  
  ```tsx
  import { computed, defineComponent, Fragment, ref } from 'vue'
  import Tooltip from '../Tooltip/Tooltip.vue'
  import type { PropType } from 'vue'
  import type { Placement, Options } from '@popperjs/core'
  import type { MenuOption } from './types'
  import type { TooltipInstance } from '../Tooltip/types'
  export default defineComponent({
    name: 'TnDropdown',
    // jsx 不支持泛型，使用属性定义
    props: {
      placement: {
        type: String as PropType<Placement>,
        default: 'bottom'
      },
      trigger: {
        type: String as PropType<'hover' | 'click'>,
        default: 'hover'
      },
      transition: {
        type: String,
        default: 'fade'
      },
      openDelay: {
        type: Number,
        default: 0
      },
      closeDelay: {
        type: Number,
        default: 0,
      },
      popperOptions: {
        type: Object as PropType<Options>,
      },
      menuOptions: {
        type: Array as PropType<MenuOption[]>,
        required: true
      },
      hideAfterClick: {
        type: Boolean,
        default: true
      },
      manual: {
        type: Boolean
      }
    },
    emits: ['visible-change', 'select'],
    setup(props, { slots, emit, expose }) {
      const tooltipRef = ref<TooltipInstance | null>(null)
      const itemClick = (e: MenuOption) => {
        if (e.disabled) {
          return
        }
        emit('select', e)
        if (props.hideAfterClick) {
          tooltipRef.value?.hide()
        }
      }
      const visibleChange = (e:boolean) => {
        emit('visible-change', e)
      }
      const options = computed(() => {
        return props.menuOptions.map(item => {
          return (
            // 空节点 Fragment
            <Fragment key={item.key}>
              { item.divided ? <li role="separator" class="divided-placeholder"/> : '' }
              <li // 动态 class：静态设置为永久为 true
                class={{'tn-dropdown__item': true, 'is-disabled': item.disabled, 'is-divided': item.divided }}
                id={`dropdown-item-${item.key}`}
                onClick={() => itemClick(item)}
              >
                { item.label }
              </li>
            </Fragment>
          )
        })
      })
      // 暴露实例
      expose({
        // expose 暴露出去时比 setup 执行要早，使用闭包，使得再次调用时触发
        show: () => tooltipRef.value?.show(),
        hide: () => tooltipRef.value?.hide()
      })
      return () => (
        <div
          class="tn-dropdown"
        >
          <Tooltip 
            trigger={props.trigger} 
            placement={props.placement}
            popperOptions={props.popperOptions}
            openDelay={props.openDelay}
            closeDelay={props.closeDelay}
            manual={props.manual}
            ref={tooltipRef}
            onVisibleChange={visibleChange}
          >
            {{
              // 插槽
              default: () => slots.default && slots.default(),
              // 具名插槽
              content: () => (
                <ul class="tn-dropdown__menu">
                  { options.value }
                </ul>
              )
            }}
          </Tooltip>
        </div>
      )
    }
  })
  ```

---

## Message 组件[难]

- 需求分析：

  函数式组件——**使用 render 函数把 VNode 加在 DOM 节点上**：render(vNode, DOM 节点)，其中 vNode **使用 h 函数创建 VNode**：(message组件, 传入的参数)

  提示一定时间后消失——使用 setTimeout

  且可手动关闭——使用 render(null, DOM) 摧毁节点，并把此方法加到属性里，用 Omit 忽略用户没传这个属性的错误

  **可弹出多个提示，自动定位——维护 instances 数组，数组为 shallowReactive 响应式**

- 使用方式

  本组件为函数式组件，调用一次出现一次0000

  ```vue
  <template>
  	<Button type="primary" @click="open">弹出消息</Button>
  	<Button type="primary" @click="openVn">弹出VNode消息</Button>
  </template>
  <script>
  import { h } from 'vue'
  import Button from './components/Button/Button.vue'
  import { createMessage } from './components/Message/method'
  const open = () => {
      // 组件会返回实例，实例上有 close 方法可以关闭组件
      const instance = createMessage({message: 'hello world', duration: 0})
      instance。close()
  }
  const openVn = () => {
      createMessage({message: 'hello world', duration: 0})
  }
  </script>
  ```

- 属性列表

  | MessageProps | 功能                        | 类型                             |
  | ------------ | --------------------------- | -------------------------------- |
  | message      | 内容                        | string \| VNode                  |
  | duration     | 关闭时长                    | number                           |
  | showClose    | 是否出现关闭按钮            | boolean                          |
  | type         | 类型                        | primary \| danger \| default ... |
  | onDestroy    | 组件隐藏时销毁的方法        | () => void                       |
  | id           | 标识 - 用来查询             | string                           |
  | zIndex       |                             | number                           |
  | offset       | 组件间距（第一个为 top 值） | number                           |

  | instances 数组中的 MessageContext | 功能                                                         | 类型                      |
  | --------------------------------- | ------------------------------------------------------------ | ------------------------- |
  | id                                | 实例 id                                                      | string                    |
  | vnode                             | 组件的 VNode                                                 | VNode                     |
  | vm                                | 是 vnode 的组件实例，下面有 exposed 属性为组件暴露出的方法，要用这个属性获取上个实例的底部高度 | ComponentInternalInstance |
  | props                             | 组件本身的属性                                               | MessageProps              |
  | destroy                           | 实例自导的销毁方法                                           | () => void                |

- 组件以函数方式创建组件，无法明确有哪些对应事件与实例

---

### 基本雏形与 RenderDOM

- 基本结构

  ```vue
  <template>
      <div
          class="tn-message"
          role="alert"
          :class="{
              [`tn-message--${type}`]: type,
              'is-close': showClose
          }"
          v-show="visible"
      >
          <div class="tn-message__content">
              <slot>
                  <RenderVNode v-if="message" :vNode="message"></RenderVNode>
              </slot>
          </div>
          <div class="tn-message__close" v-if="showClose">
              <Icon icon="xmark" @click.stop="visible = false"></Icon>
          </div>
      </div>
  </template>
  
  <script setup lang="ts">
  import type { MessageProps } from './types'
  import RenderVNode from '../Common/RenderVnode'
  import Icon from '../Icon/Icon.vue'
  import { onMounted, ref } from 'vue'
  const props = withDefaults(defineProps<MessageProps>(), {
      type: 'info',
      duration: 3000
  })
  const visible = ref(false)
  function startTimer() {
      // 实现一定时间后隐藏 - 更改 visible
      if (props.duration === 0) return // 计时器设置为 0 永远不关闭
      setTimeout(() => {
          visible.value = false
      }, props.duration)
  }
  onMounted(() => {
      visible.value = true
      startTimer()
  })
  </script>
  
  <style scoped>
  .tn-message {
      width: max-content;
      position: fixed;
      left: 50%;
      top: 20px;
      transform: translateX(-50%);
      border: 1px solid blue;
  }
  </style>
  ```

- render 函数

  render 是 vue 的函数，负责将 vue 渲染到 DOM 节点上，比 createApp 更加轻量

  ```typescript
  import { render } from 'vue'
  render(VNode, DOM节点)		// 将 vnode 渲染到 dom 中
  ```

  创建一个方法

  ```typescript
  import { render, h } from 'vue'
  import type { MessageProps } from './types'
  import MessageConstructor from './Message.vue'
  export const createMessage = (props: MessageProps) => {
      const container = document.createElement('div')  // 容器
      const vnode = h(MessageConstructor, props)       // VNode
      render(vnode, container)    // 把 vnode渲染到 div 中
      // 再把 div 内的内容加到 body 上
      document.body.appendChild(container.firstElementChild!) // !表示此变量不为 null 或 undefined
  }
  ```

  这样只要引入此方法，就可以函数式多次创建节点了

  ```vue
  <script>
  import { onMounted } from 'vue'
  import Message from './components/Message/Message.vue'
  import { createMessage } from './components/Message/method'
  onMounted(() => {
      createMessage({message: 'hello world1', duration: 0})
      createMessage({message: 'hello world2', duration: 0})
  }
  </script>
  ```

  但目前通过 v-show 控制，dom 节点还在，希望销毁掉 DOM，**使用 render(null, container) 销毁**

  type.ts

  ```typescript
  import type { VNode } from 'vue'
  export interface MessageProps {
  	// ...
      onDestroy: () => void		// 销毁方法加到属性上
  }
  // 忽略用户没传 onDestroy 属性的报错
  export type CreateMessageProps = Omit<MessageProps, 'onDestroy'>
  ```

  onDestroy 是必须属性，而不想让用户自己手写再组件上，所以使用 Omit 忽略没传 onDestroy 的报错并导出

  并在 method.ts 中引入

  ```typescript
  /*
  import { render, h } from 'vue'
  import MessageConstructor from './Message.vue' */
  import type { CreateMessageProps } from './types'
  export const createMessage = (props: CreateMessageProps) => {
  /*  const container = document.createElement('div') */
      // 销毁实例方法
      const destroy = () => {
          render(null, container)
      } 
      const newProps = {
          ...props,
          onDestroy: destroy
      }
      const vnode = h(MessageConstructor, newProps)
  /*  render(vnode, container)
      document.body.appendChild(container.firstElementChild!)
  } */
  ```

  这样时间一到或者点击关闭的时候，组件会隐藏并销毁

---

### 多个组件上下位置

- instances 数组

  思路：将 method.ts 作为中枢，维护一个数组 - 控制多个组件

  types.ts 新建类型

  ```typescript
  export interface MessageContext {
      id: string
      vnode: VNode
      props: MessageProps
  }
  ```

  method.ts

  ```typescript
  /*899
  import { render, h } from 'vue'
  import MessageConstructor from './Message.vue' */
  
  import type { CreateMessageProps, MessageContext } from './types'
  let seed = 1
  const instances: MessageContext[] = []      // 中枢 instances
  /*
  export const createMessage = (props: CreateMessageProps) => {
      const container = document.createElement('div')    */
  	const id = `message_${seed++}`      // 每次新建 Message 计数器就加一
      const destroy = () => {		
          // 删除数组中的实例
          const idx = instances.findIndex(instance => instance.id === id)
          if (idx === -1) return
          instances.splice(idx, 1)
          render(null, container)             // 销毁 DOM
      }
  /*  const newProps = {
          ...props,
          onDestroy: destroy
      }
      const vnode = h(MessageConstructor, newProps)       
      render(vnode, container)    
      document.body.appendChild(container.firstElementChild!)		*/
      const instance = {
          id,
          vnode,
          props: newProps
      }
      instances.push(instance)
      return instance
  }
  // 暴露一个方法 - 拿到 instances 数组最后一项
  export const getLastInstance = () => {
      return instances.at(-1)
  }
  ```

  之后就可以使用 getLastInstance 拿到上一个实例了。

- 修改定位

  核心为：设一个 offset 属性，为第一个组件的 top，那么第二个组件的 top 为：组件1底部到 top 的值 + 组件2的 offset

  types.ts

  ```typescript
  import type { VNode, ComponentInternalInstance } from 'vue'
  export interface MessageProps {
  	// ...
      id: string
      offset?: number
  }
  export interface MessageContext {
  	// ...
      vm: ComponentInternalInstance
  }
  // id 是系统自动传递的参数
  export type CreateMessageProps = Omit<MessageProps, 'id'>
  ```

  method.ts

  ```typescript
  // shallowReactive 不会递归把数组转化成响应式，数组增删改查时会更新视图
  import { render, h, shallowReactive } from 'vue'
  let seed = 1        // id 计数器
  const instances: MessageContext[] = shallowReactive([])		
  export const createMessage = (props: CreateMessageProps) => {
      const id = `message_${seed++}`
  	// ...
      const newProps = {
          ...props,
          id,				// 自动添加 id
          onDestroy: destroy
      }
      const instance = {
          id,
          vnode,
          vm,
          props: newProps
      }
      instances.push(instance)
      return instance
  }
  // 计算上一个组件底部的 top
  export const getLastBottomOffset = () => {
      return 0
  }
  ```
  
  Message.vue 添加相关高度逻辑，给每个 Message 添加定位
  
  ```vue
  <template>
      <div ref="messageRef" :style="cssStyle">
   		<!-- ... -->
      </div>
  </template>
  <script setup lang="ts">
  // ...
  import { onMounted, ref, watch, computed, nextTick } from 'vue'
  import { getLastBottomOffset } from './method'
  const props = withDefaults(defineProps<MessageProps>(), {
  	// ...
      offset: 20
  })
  // Message 的 DOM
  const messageRef = ref<HTMLElement>()
  // 计算偏移高度 - div 的高度
  const height = ref(0)
  // 上一个实例底部坐标（第一个是0）
  const lastBottomOffset = computed(() => getLastBottomOffset(props.id))
  // 这个元素应该使用的 top
  const topOffset = computed(() => props.offset + lastBottomOffset.value)
  // 为下一个元素预留的 offset, 即它的 bottom 值
  const bottomOffset = computed(() => height.value + topOffset.value)
  const cssStyle = computed(() => ({
      top: topOffset.value + 'px'
  }))
  
  onMounted(async () => {
  	// ...
      // 在 DOM 更新完立刻计算此组件的高度
      await nextTick()
      // ! 表示不为 null 或 undefined
      height.value = messageRef.value!.getBoundingClientRect().height // 拿到 div 的高度
  })
  
  defineExpose({
      bottomOffset
  })
  </script>
  ```
  

---

## VitePress

- 安装

  ```bash
  npm install -D vitepress
  ```

- 初始化 - 设置在 .docs 文件夹下

  ```bash
  npx vitepress init
  ```

- 运行项目：

  ```
  npm run docs:dev
  ```


---

## Input 组件

Input 组件是 Form 表单组件的一部分

- 需求分析：
1. 支持 Input、textarea

2. 支持 v-model：定义 modelValue 属性与 update:modelValue 事件，input 输入事件时触发 update:modelValue 事件，并监听 props.modelValue，实时更新。

3. 支持点击清空：只有 Input 支持，Textarea 不支持，input 为 foucs 时，在 suffix 区域显示一个图标

   写两个函数 handleFocus 和 handleBlur 为 input 上的触发函数，触发时修改响应式 isFocus，这个 isFocus 用于 v-if 控制显示清空图标，点击图标时，清空响应式 innerValue.value 即可，并广播 update:modelValue 事件，值为空字符串。

4. 支持切换密码显示：

   根据 props.showPassword 计算出新变量 showPasswordArea，控制 suffix 区的显示。声明响应式变量 passwordVisible，此变量在 input 上动态修改 type 类型，并与 showPasswordArea 共同作用显示密码眼睛打开/关闭的图标，点击图标触发函数 togglePasswordVisible，此函数对 passwordVisible 取反。

   ```vue
   <input
       class="tn-input__inner"
       :type="showPassword ? (passwordVisible ? 'text' : 'password') : type"
   />
   ```

5. 支持原生属性：定义属性并添加在原生 input 上，还有一些其他操作，去看源码。


- 使用方式

  ```vue
  <script>
  import Input from '@/components/Input/Input.vue'
  const test = ref('')
  </script>
  <template>
  	<Input v-model="test" placeholder="基础文本框，请输入" />
  	<Input v-model="test" clearable placeholder="输入字符以后可以点击清空"/>
  </template>
  ```

- 属性列表

  | Input        | 功能                 | 类型                               |
  | ------------ | -------------------- | ---------------------------------- |
  | type         | 输入框类型           | 'text' \| 'textarea' \| 'password' |
  | size         | 大小                 | 'large' \| 'small'                 |
  | clearable    | 是否开启一键清空     | boolean                            |
  | showPassword | 是否开启切换密码显示 | boolean                            |
  | disabled     | 禁用                 | boolean                            |

  | 支持原生属性 | 功能                                          | 类型    |
  | ------------ | --------------------------------------------- | ------- |
  | placeholder  | 没有值设定时，出现在表单控件上的文字          | string  |
  | readonly     | 只读，其中的值将不可编辑                      | boolean |
  | autocomplete | 表单自动填充特性提示                          | string  |
  | autofocus    | 存在表示页面加载完毕时，该 input 自动拥有焦点 | boolean |
  | form         | 指定输入与之相关的表单元素                    | string  |

- 事件列表

  ```typescript
  interface InputEmits {
    (e: 'update:modelValue', value: string) : void;
    // input 的 input事件指的是值有变化就算    
    (e: 'input', value: string): void;
    // input 的 change事件指的是修改了值，并且失去了 focus
    (e: 'change', value: string): void;
    // 原生 input 事件
    (e: 'focus', value: FocusEvent): void;
    (e: 'blur', value: FocusEvent): void;
    // 自定义清空事件
    (e: 'clear'): void;
  }
  ```

- slots

  对应输入框的前置区域，前缀，后缀，后置区域

  ```
  prepend，prefix，suffix，append
  ```

---

## Switch 组件

- 需求分析：开关，本质就是套皮的 checkbox，包裹几个 div 在有 is-checked 时交互。最后把 checked 的 opacity 等设置为 0。

- 属性列表

  | Switch        | 功能            | 类型                        |
  | ------------- | --------------- | --------------------------- |
  | modelValue    | 支持 v-model    | boolean \| string\| number  |
  | disabled      | 禁用            | boolean                     |
  | activeText    | 添加文本 - 开   | string                      |
  | inactiveText  | 添加文本 - 关   | string                      |
  | activeValue   | 指示 on 的状态  | boolean \| string \| number |
  | inactiveValue | 指示 off 的状态 | boolean \| string \| number |
  | name          | 表单属性 name   | string                      |
  | id            | 标识            | string                      |
  | size          | 大小            | 'small' \| 'large'          |

- 事件列表

  ```typescript
  interface SwitchEvents {
      (e: 'update:modelValue', value: boolean) : void;
  	(e:'change', value: boolean) : void
  }
  ```

---

## Select 组件

