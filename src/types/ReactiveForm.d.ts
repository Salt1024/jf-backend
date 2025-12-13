import type { FormRules } from 'naive-ui'

// type FormRulesLimited<T extends Record<string, any>> = {
//   [key in keyof T]?: T[key] extends Record<string, any>
//     ? T[key] extends any[]
//       ? FormItemRule | FormItemRule[]
//       : FormItemRule | FormItemRule[] | FormRulesLimited<T[key]>
//     : FormItemRule | FormItemRule[]
// }

export interface ReactiveForm<T> {
  /** 表单加载状态 */
  loading?: boolean
  /** 表单 dialog 显示 */
  visible?: boolean
  /** 是否为编辑状态 */
  isEdit?: boolean
  /** 表单数据 */
  data: T
  /** 表单校验规则 */
  rules?: FormRules
}
