<script lang="ts" setup>
import { NConfigProvider, zhCN, dateZhCN } from 'naive-ui'
</script>

<template>
  <NConfigProvider :date-locale="dateZhCN" :locale="zhCN" abstract>
    <RouterView />
  </NConfigProvider>
</template>

<style lang="scss">
#app {
  position: absolute;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
