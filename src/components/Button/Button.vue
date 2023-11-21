<!-- 动态添加属性，boolean 为真就添加 -->
<!-- tn-button 那一行的意思是：type是什么，就动态添加到属性名上 -->
<template>
    <button
        ref="_ref"
        class="tn-button"
        :class="{
            [`tn-button--${type}`]: type,
            [`tn-button--${size}`]: size,
            'is-plain': plain,
            'is-round': round,
            'is-circle': circle,
            'is-disabled': disabled,
            'is-loading': loading
        }"
        :disabled="disabled || loading"
        :autofocus="autofocus"
        :type="nativeType"
    >
        <Icon icon="spinner" spin v-if="loading" />
        <Icon :icon="icon" v-if="icon" />
        <span>
            <slot></slot>
        </span>
    </button>
</template>

<script setup lang="ts">
import type { ButtonProps } from './types'
import { ref } from 'vue'
import Icon from '../Icon/Icon.vue'
// 是为了让 Button 组件不和传统的 Button 重名
defineOptions({
    name: 'TnButton'
})
// 使用泛型进行标识 - withDefaults 设置属性的默认值
withDefaults(defineProps<ButtonProps>(), {
    nativeType: 'button'
})
// 为了让使用此组件的人获取 Button 实例，声明 ref 并暴露出去
const _ref = ref<HTMLButtonElement>()
// 暴露组件实例
defineExpose({
    ref: _ref
})
</script>

<style>

</style>