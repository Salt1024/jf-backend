<script lang="ts" setup>
import { NResult, NButton } from 'naive-ui'
</script>

<template>
  <div class="not-found">
    <NResult status="404" title="404 资源不存在">
      <template #footer>
        <NButton @click="$router.push({name: 'Home'})">返回首页</NButton>
      </template>
    </NResult>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  margin-top: 15vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
