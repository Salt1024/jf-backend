import { h } from 'vue'
import type { Component } from 'vue'
import { RouterLink } from 'vue-router'
import { NIcon } from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import { routes } from '@/router'
import type { RouteRecordRaw } from 'vue-router'

// 渲染菜单图标
function renderIcon (icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

// 渲染路由菜单
function renderRouterLabel (route: RouteRecordRaw) {
  return () => h(RouterLink, { to: { name: route.name.toString() } }, { default: () => route.meta.label })
}

// 菜单
const menuOptions: MenuOption[] = []

// 根据路由生成菜单
function createMenu (routes: RouteRecordRaw[], menu: MenuOption[]) {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    if (route.meta && !route.meta.hide) {
      const menuItem: MenuOption = {
        key: route.meta.key,
      }

      if (route.children && route.children.length) {
        menuItem.children = []
        createMenu(route.children, menuItem.children)
        menuItem.label = route.meta.label
      } else {
        menuItem.label = renderRouterLabel(route)
      }

      if (route.meta.icon) {
        menuItem.icon = renderIcon(route.meta.icon)
      }

      menu.push(menuItem)
    }
  }
}

createMenu(routes[0].children, menuOptions)

// 需要 KeepAlive 的组件名列表
const keepAliveRouteNames: string[] = []

function resolveKeepAliveRouteNames (routes: RouteRecordRaw[]) {
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    if (route.children && route.children.length) {
      resolveKeepAliveRouteNames(route.children)
    }
    if (route.meta && route.meta.keepAlive) {
      keepAliveRouteNames.push(route.name.toString())
    }
  }
}

resolveKeepAliveRouteNames(routes)

export {
  menuOptions,
  keepAliveRouteNames,
}
