<script lang="ts" setup>
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NLayoutContent,
  NMenu,
  NButton,
  NModal,
  NCard,
  NTabs,
  NTabPane,
  NForm,
  NInput,
  NFormItemRow,
  NDropdown,
  NSpace,
  NAlert,
  NTag,
} from 'naive-ui'
import { keepAliveRouteNames, menuOptions } from '@/menu'
import { useUserStore } from '@/store'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = ref(route.meta?.key)
watch(route, (newVal) => {
  if (newVal?.meta?.menuKey) {
    activeMenu.value = newVal.meta.menuKey
  } else if (newVal?.meta?.key) {
    activeMenu.value = newVal.meta.key
  }
})

const userMenuOptions = ref([{ label: '退出', key: 'logout' }])

const userMenuSelect = (key: string | number) => {
  switch (key) {
    case 'logout':
      userStore.logout()
      router.push({ name: 'Login' })
      break
    default:
      break
  }
}
</script>

<template>
  <NLayout class="main">
    <NLayoutHeader bordered>
      <NSpace align="center">
        <div class="logo">后台管理系统</div>
      </NSpace>

      <div class="user-menu">
        <NSpace>
          <NDropdown
            :options="userMenuOptions"
            trigger="hover"
            @select="userMenuSelect"
          >
            <NButton>{{ userStore.userInfo.username }}</NButton>
          </NDropdown>
        </NSpace>
      </div>
    </NLayoutHeader>
    <NLayout class="main-container" has-sider>
      <NLayoutSider
        :collapsed-width="50"
        bordered
        collapse-mode="width"
        show-trigger="arrow-circle"
      >
        <NMenu
          :options="menuOptions"
          :value="activeMenu"
          class="menu"
          mode="vertical"
        />
      </NLayoutSider>
      <NLayoutContent content-style="padding: 18px;">
        <RouterView v-slot="{ Component }">
          <KeepAlive :include="keepAliveRouteNames">
            <component :is="Component" />
          </KeepAlive>
        </RouterView>
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<!--全局生效-->
<style lang="scss">
$HeaderHeight: 54px;

.main {
  position: absolute;
  overflow: auto;
  width: 100%;
  height: 100%;

  .menu {
    height: 100%;
  }
}

.n-layout-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: $HeaderHeight;
  padding: 0 20px;
}

.main-container {
  z-index: 0;
  height: calc(100% - $HeaderHeight);
}
</style>
