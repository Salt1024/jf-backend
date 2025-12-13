<script lang="ts" setup>
import { reactive, onMounted, ref, h } from 'vue'
import {
  NForm,
  NFormItem,
  NDataTable,
  NButton,
  NInput,
  NModal,
  NSpace,
  NSwitch,
  NTag,
} from 'naive-ui'
import { useTable } from '@/composables/useTable'
import { get, post, put, del } from '@/api'

import type { DataTableColumns } from 'naive-ui'
import type { ReactiveForm } from '@/types'
import { dialog, showMessage } from '@/utils'

interface TableItem {
  id: number
  /** 奖品名称 */
  rewardName: string
  /** 图片 */
  image?: string
  /** 参与者用户IDs */
  participantUserIds?: string
  /** 中奖者用户IDs */
  winnerUserIds?: string
  /** 奖品组 */
  rewardGroup: string
  /** 是否已抽奖 */
  isDrawn?: boolean
}

type TableFilters = {
  /** 奖品组 */
  rewardGroup?: string
}

interface FormData {
  id?: number
  /** 奖品名称 */
  rewardName: string
  /** 图片 */
  image?: string
  /** 参与者用户IDs */
  participantUserIds?: string
  /** 中奖者用户IDs */
  winnerUserIds?: string
  /** 奖品组 */
  rewardGroup: string
  /** 是否已抽奖 */
  isDrawn?: boolean
}

const { table, tableGet } = useTable<TableItem, TableFilters>({
  url: '/api/v1/draw',
  filters: {
    rewardGroup: '',
  },
  pageSize: 50,
})

const tableColumns: DataTableColumns<TableItem> = [
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  { title: '奖品名称', key: 'rewardName', minWidth: 100, align: 'center' },
  { 
    title: '图片', 
    key: 'image', 
    minWidth: 100, 
    align: 'center',
    render(row) {
      if (row.image) {
        return h('img', {
          src: row.image,
          style: 'width: 50px; height: 50px; object-fit: cover;'
        })
      }
      return '-'
    }
  },
  { title: '奖品组', key: 'rewardGroup', minWidth: 100, align: 'center' },
  {
    title: '是否已抽奖',
    key: 'isDrawn',
    width: 120,
    align: 'center',
    render(row) {
      return h(
        NTag,
        { type: row.isDrawn ? 'success' : 'default' },
        { default: () => (row.isDrawn ? '已抽奖' : '未抽奖') }
      )
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 160,
    align: 'center',
    fixed: 'right',
    render(row) {
      return h(NSpace, null, () => [
        h(
          NButton,
          {
            type: 'error',
            size: 'small',
            onClick: () => itemRemove(row),
          },
          { default: () => '删除' },
        ),
        h(
          NButton,
          {
            type: 'primary',
            size: 'small',
            onClick: () => itemEdit(row),
          },
          { default: () => '编辑' },
        ),
      ])
    },
  },
]

const formRef = ref<InstanceType<typeof NForm>>()
const form = reactive({
  loading: false,
  visible: false,
  isEdit: false,
  data: {
    rewardName: '',
    image: '',
    participantUserIds: '',
    winnerUserIds: '',
    rewardGroup: '',
    isDrawn: false,
  },
  rules: {
    rewardName: { required: true, message: '请输入奖品名称', trigger: 'blur' },
    rewardGroup: { required: true, message: '请输入奖品组', trigger: 'blur' },
  },
}) as ReactiveForm<FormData>

const itemAdd = () => {
  form.isEdit = false
  form.data = {
    rewardName: '',
    image: '',
    participantUserIds: '',
    winnerUserIds: '',
    rewardGroup: '',
    isDrawn: false,
  }
  form.visible = true
}

const itemEdit = (row: TableItem) => {
  form.isEdit = true
  form.data = {
    id: row.id,
    rewardName: row.rewardName,
    image: row.image || '',
    participantUserIds: row.participantUserIds || '',
    winnerUserIds: row.winnerUserIds || '',
    rewardGroup: row.rewardGroup,
    isDrawn: row.isDrawn || false,
  }
  form.visible = true
}

const itemSubmit = async () => {
  await formRef.value.validate()
  form.loading = true
  try {
    if (form.isEdit) {
      await put('/api/v1/draw', form.data)
    } else {
      await post('/api/v1/draw', form.data)
    }
    tableGet()
    form.visible = false
    showMessage.success(form.isEdit ? '更新成功' : '创建成功')
  } catch (e: any) {
    showMessage.error(e.message)
  } finally {
    form.loading = false
  }
}

const itemRemove = async (row: TableItem) => {
  const d = dialog.warning({
    title: '警告',
    content: `确定要删除奖品"${row.rewardName}"吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await del(`/api/v1/draw/${row.id}`)
        await tableGet()
        showMessage.success('删除成功')
      } catch (e: any) {
        showMessage.error(e.message)
        return false
      } finally {
        d.loading = false
      }
    },
  })
}

onMounted(() => {
  tableGet()
})
</script>

<template>
  <div>
    <NSpace align="center" justify="space-between">
      <NForm inline>
        <NFormItem path="rewardGroup">
          <NInput
            v-model:value="table.filters.rewardGroup"
            clearable
            placeholder="奖品组"
          />
        </NFormItem>
        <NFormItem>
          <NButton type="primary" @click="tableGet(true)">查询</NButton>
        </NFormItem>
      </NForm>
      <NButton type="primary" @click="itemAdd">添加抽奖项</NButton>
    </NSpace>

    <NDataTable
      :columns="tableColumns"
      :data="table.data"
      :loading="table.loading"
      :pagination="table.pagination"
      :scroll-x="1200"
    />

    <NModal
      v-model:show="form.visible"
      :close-on-esc="false"
      :mask-closable="false"
      :title="form.isEdit ? '编辑抽奖项' : '新增抽奖项'"
      preset="card"
      style="width: 600px"
    >
      <NForm ref="formRef" :model="form.data" :rules="form.rules" label-width="120px">
        <NFormItem label="奖品名称" path="rewardName">
          <NInput v-model:value="form.data.rewardName" placeholder="请输入奖品名称" />
        </NFormItem>
        <NFormItem label="奖品组" path="rewardGroup">
          <NInput v-model:value="form.data.rewardGroup" placeholder="请输入奖品组" />
        </NFormItem>
        <NFormItem label="图片URL" path="image">
          <NInput v-model:value="form.data.image" placeholder="请输入图片URL" />
        </NFormItem>
        <NFormItem label="参与者用户IDs" path="participantUserIds">
          <NInput
            v-model:value="form.data.participantUserIds"
            type="textarea"
            placeholder="多个ID用逗号分隔"
            :autosize="{
              minRows: 2,
              maxRows: 4
            }"
          />
        </NFormItem>
        <NSpace justify="end">
          <NButton @click="form.visible = false">取消</NButton>
          <NButton :loading="form.loading" type="primary" @click="itemSubmit">
            确定
          </NButton>
        </NSpace>
      </NForm>
    </NModal>
  </div>
</template>

<style scoped>
</style>
