/**
 * 扩展 route.meta 属性
 */
import 'vue-router'
import type { Component } from 'vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** 菜单 key，全局唯一，用于生成菜单时必填 */
    key?: string
    /** 菜单标题，用于生成菜单时且非 hide 时必填 */
    label?: string
    /** 菜单图标 */
    icon?: Component
    /** 是否在菜单中隐藏 */
    hide?: boolean
    /** 手动指定当前页面激活的菜单，用于在隐藏的子页面中保持菜单选中状态 */
    menuKey?: string
    /** 是否启用 KeepAlive */
    keepAlive?: boolean
    /** 是否不需要验证 */
    noAuth?: boolean
  }
}
