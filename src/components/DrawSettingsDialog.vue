<script lang="ts" setup>
import { ref } from 'vue'
import { NModal, NList, NListItem, NButton, NSpin } from 'naive-ui'
import { post } from '@/api'
import { showMessage } from '@/utils'

interface Props {
  visible: boolean
  drawId?: number
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loading = ref(false)

const handleClose = () => {
  emit('update:visible', false)
}

const handleAddAllUsers = async () => {
  if (!props.drawId) return
  
  loading.value = true
  try {
    await post(`/api/v1/draw/set-draw/${props.drawId}`, {})
    showMessage.success('已将所有用户添加到抽奖')
    emit('success')
    handleClose()
  } catch (e: any) {
    showMessage.error(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NModal
    :show="visible"
    :close-on-esc="!loading"
    :mask-closable="!loading"
    title="设置中奖用户"
    preset="card"
    style="width: 500px"
    @update:show="handleClose"
  >
    <NSpin :show="loading">
      <NList bordered>
        <NListItem>
          <template #suffix>
            <NButton
              type="primary"
              @click="handleAddAllUsers"
            >
              执行
            </NButton>
          </template>
          将所有用户添加到抽奖
        </NListItem>
      </NList>
    </NSpin>
  </NModal>
</template>

<style scoped>
</style>

