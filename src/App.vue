<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import Collapse from './components/Collapse/Collapse.vue'
import Item from './components/Collapse/CollapseItem.vue'
import Button from './components/Button/Button.vue'
import Icon from './components/Icon/Icon.vue'
import { createPopper, hide } from '@popperjs/core'
import type { Instance } from '@popperjs/core'
import type { ButtonInstance } from './components/Button/types'
import type { TooltipInstance } from './components/Tooltip/types'
import type { Options } from '@popperjs/core'
import Tooltip from './components/Tooltip/Tooltip.vue'
import Dropdown from './components/Dropdown/Dropdown'
import type { MenuOption } from './components/Dropdown/types'
import { createMessage } from './components/Message/method'
import { create } from 'domain'
import Input from './components/Input/Input.vue'
import Switch from './components/Switch/Switch.vue'
const buttonRef = ref<ButtonInstance | null>(null)
const tooltipRef = ref<TooltipInstance | null>(null)
const overlayNode = ref<HTMLElement>()
const triggerNode = ref<HTMLElement>()
let popperInstance: Instance | null = null
const openedValue = ref(['a'])
const trigger = ref<any>('click')
const open = () => {
  tooltipRef.value?.show()
}
const options: MenuOption[] = [
  {key: 1, label: h('b', '粗体item1') },
  {key: 2, label: 'item2', disabled: true},
  {key: 3, label: 'item3', divided: true},
  {key: 4, label: 'item4'}
]
const close = () => {
  tooltipRef.value?.hide()
}
onMounted(() => {
  const instance = createMessage({message: 'hello world', showClose: true})
  createMessage({message: 'hello world2', duration: 0})
  createMessage({message: 'hello world3', duration: 0})
  if (buttonRef.value) {
    // 获取组件 DOM
    console.log('buttonRef', buttonRef.value.ref)
  }
  if(overlayNode.value && triggerNode.value) {
    popperInstance = createPopper(triggerNode.value, overlayNode.value, {placement: 'right'})
  }
  setTimeout(() => {
    popperInstance?.setOptions({ placement: 'bottom'})
  }, 2000)
})
const test = ref(true)
</script>

<template>
  <Switch v-model="test" active-text="被打开了"></Switch>
  <Input model-value="" show-password clearable placeholder="请输入"></Input>
  <Button type="primary" ref="triggerNode">触发区</Button>
  <div ref="overlayNode"><h1>展示区</h1></div>
  <header>
    <Dropdown placement="bottom" :trigger="trigger" :menu-options="options" @visible-change="e => console.log('visible-change', e)" @select="e => console.log('select', e)">
      <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" ref="triggerNode" />
    </Dropdown>
  </header>
  <Icon icon="arrow-up" size="2xl" type="primary" />
  <br/>
  <Button size="large" @click="open">open</Button>
  <Button size="large" icon='arrow-up' @click="close">close</Button>
  <main>
    <Collapse v-model="openedValue">
      <Item name="a" title="测试">
        <template #title>
          <h1>测试2</h1>
        </template>
        <h1>headline title</h1>
        <div>contentaaaaaaaaaaa</div>
      </Item>
      <Item name="b" title="title b">
        <div>bbb test</div>
      </Item>
      <Item name="c" title="title c" disabled>
        <div>ccc test</div>
      </Item>
    </Collapse>
    <Tooltip content="展示文本内容">
      <Button size="large">触发区</Button>
    </Tooltip>
    <Tooltip>
      <Button size="large">触发区</Button>
      <template #content>
        <h1>这是展示内容</h1>
        <div>展示复杂结构</div>
      </template>
    </Tooltip>
  </main>
  
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
