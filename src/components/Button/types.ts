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