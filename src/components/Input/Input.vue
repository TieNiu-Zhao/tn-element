<template>
    <!-- 可以通过 $slots.属性访问对应的 slot -->
    <div 
        class="tn-input"
        :class="{
            [`vk-input--${type}`]: type,
            [`vk-input--${size}`]: size,
            'is-disabled': disabled,
            'is-prepend': $slots.prepend,
            'is-append': $slots.append,
            'is-prefix': $slots.prefix,
            'is-suffix': $slots.suffix,
            'is-focus': isFocus
        }"
    >
        <!-- input -->
        <template v-if="type !== 'textarea'">
            <!-- prepend slot -->
            <div v-if="$slots.prepend" class="tn-input__prepend">
                <slot name="prepend"></slot>
            </div>
            <div class="tn-input__wrapper">
                <!-- prefix slot -->
                <span v-if="$slots.prefix" class="tn-input__prefix">
                    <slot name="prefix"></slot>
                </span>
                <input
                    class="tn-input__inner"
                    :type="showPassword ? (passwordVisible ? 'text' : 'password') : type"
                    ref="inputRef"
                    v-bind="attrs"
                    :disabled="disabled"
                    :readonly="readonly"
                    :autocomplete="autocomplete"
                    :placeholder="placeholder"
                    :autofocus="autofocus"
                    :form="form"
                    v-model="innerValue"
                    @input="handleInput"
                    @change="handleChange"
                    @focus="handleFocus"
                    @blur="handleBlur"
                />
                <!-- suffix slot -->
                <span v-if="$slots.suffix || showClear || showPasswordArea" class="tn-input__suffix" @click="keepFocus">
                    <slot name="suffix"></slot>
                    <Icon icon="circle-xmark" v-if="showClear" class="tn-input__clear" @click="clear" @mousedown.prevent="NOOP"></Icon>
                    <Icon icon="eye" v-if="showPasswordArea && passwordVisible" class="tn-input__password" @click="togglePasswordVisible"></Icon>
                    <Icon icon="eye-slash" v-if="showPasswordArea && !passwordVisible" class="tn-input__password" @click="togglePasswordVisible"></Icon>
                </span>
            </div>
            <!-- append slot -->
            <div v-if="$slots.append" class="tn-input__append">
                <slot name="sppend"></slot>
            </div>
        </template>
        <!-- textarea -->
        <template v-else>
            <textarea 
                class="tn-textarea__wrapper"
                v-bind="attrs"
                ref="inputRef"
                :disabled="disabled"
                :readonly="readonly"
                :autocomplete="autocomplete"
                :placeholder="placeholder"
                :autofocus="autofocus"
                :form="form"
                v-model="innerValue"
                @input="handleInput"
                @change="handleChange"
                @focus="handleFocus"
                @blur="handleBlur"
            >
            </textarea>
        </template>
    </div>
</template>

<script setup lang="ts">
import type { InputProps, InputEmits } from './types'
import type { Ref } from 'vue'
import { ref, watch, computed, useAttrs, nextTick } from 'vue'
import Icon from '../Icon/Icon.vue'
defineOptions({
    name: 'TnInput',
    inheritAttrs: false
})
const props = withDefaults(defineProps<InputProps>(), { type: 'text', autocomplete: 'off' })
const innerValue = ref(props.modelValue)
const emits = defineEmits<InputEmits>()
const attrs = useAttrs()
const isFocus = ref(false)
const passwordVisible = ref(false)
const inputRef = ref() as Ref<HTMLInputElement>
// !! 可以转化为布尔值
const showClear = computed(() => props.clearable && !props.disabled && !!innerValue.value && isFocus.value )
const showPasswordArea = computed(() => props.showPassword && !props.disabled && !!innerValue.value )
const togglePasswordVisible = () => {
    passwordVisible.value = !passwordVisible.value
}
const NOOP = () => {}
const keepFocus = async () => {
    await nextTick()
    inputRef.value.focus()
}
const handleInput = () => {
    emits('update:modelValue', innerValue.value)
    emits('input', innerValue.value)
}
const handleChange = () => {
    emits('change', innerValue.value)
}
const handleFocus = (event: FocusEvent) => {
    isFocus.value = true
    emits('focus', event)
}
const handleBlur = (event: FocusEvent) => {
    isFocus.value = false
    emits('blur', event)
}
const clear = () => {
    innerValue.value = ''
    emits('update:modelValue', '')
    emits('clear')
    emits('input', '')
    emits('change', '')
}
watch(() => props.modelValue, (newValue) => {
    innerValue.value = newValue
})
defineExpose({
    ref: inputRef
})
</script>