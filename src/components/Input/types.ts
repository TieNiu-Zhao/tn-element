export interface InputProps {
    type?: string
    size?: 'large' | 'small'
    disabled?: boolean
    clearable?: boolean
    showPassword?: boolean
    modelValue: string
    placeholder?: string
    readonly?: boolean
    autocomplete?: string
    autofocus?: boolean
    form?: string
}

export interface InputEmits {
    (e: 'update:modelValue', value: string): void
    // 值有变化就触发 input
    (e: 'input', value: string): void
    // 修改了值且 blur 时触发
    (e: 'change', value: string): void
    (e: 'focus', value: FocusEvent): void
    (e: 'blur', value: FocusEvent): void
    (e: 'clear'): void
}