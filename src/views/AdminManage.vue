<script lang="ts" setup>
import { reactive, onMounted, ref, h } from 'vue'
import {
  NForm,
  NFormItem,
  NDataTable,
  NButton,
  NInput,
  NInputNumber,
  NModal,
  NSpace,
  NSelect,
} from 'naive-ui'
import { useTable } from '@/composables/useTable'
import { get, post, put, del } from '@/api'

import type { DataTableColumns } from 'naive-ui'
import type { ReactiveForm } from '@/types'
import { dialog, showMessage } from '@/utils'

interface TableItem {
  id: number
  /** 用户名 */
  username: string
}

type TableFilters = {
  /** 用户名 */
  username?: string
}

interface FormData {
  id?: number
  /** 用户名 */
  username: string
  /** 密码 */
  password: string
}

const { table, tableGet } = useTable<TableItem, TableFilters>({
  url: '/api/v1/admin',
  filters: {
    username: '',
  },
})

const tableColumns: DataTableColumns<TableItem> = [
  { title: 'ID', key: 'id', minWidth: 100, align: 'center' },
  { title: '用户名', key: 'username', minWidth: 100, align: 'center' },
  {
    title: '密码',
    key: 'password',
    minWidth: 100,
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    width: 160,
    align: 'center',
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
    username: '',
    password: '',
  },
  rules: {
    username: { required: true, message: '请输入', trigger: 'blur' },
    password: { required: false, message: '请输入', trigger: 'blur' },
  },
}) as ReactiveForm<FormData>

const itemAdd = () => {
  form.isEdit = false
  form.data = {
    username: '',
    password: '',
  }
  form.visible = true
}

const itemEdit = (row: TableItem) => {
  form.isEdit = true
  form.data = {
    id: row.id,
    username: row.username,
    password: '',
  }
  form.visible = true
}

const itemSubmit = async () => {
  await formRef.value.validate()
  form.loading = true
  try {
    if (form.isEdit) {
      await put('/api/v1/admin', form.data)
    } else {
      await post('/api/v1/auth/signUp', form.data)
    }
    tableGet()
    form.visible = false
  } catch (e: any) {
    showMessage.error(e.message)
  } finally {
    form.loading = false
  }
}

const itemRemove = async (row: TableItem) => {
  const d = dialog.warning({
    title: '警告',
    content: '你确定？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await del(`/api/v1/admin/${row.id}`)
        await tableGet()
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
        <NFormItem path="username">
          <NInput
            v-model:value="table.filters.username"
            clearable
            placeholder="用户名"
          />
        </NFormItem>
        <NFormItem>
          <NButton type="primary" @click="tableGet(true)">查询</NButton>
        </NFormItem>
      </NForm>
      <NButton type="primary" @click="itemAdd">添加</NButton>
    </NSpace>

    <NDataTable
      :columns="tableColumns"
      :data="table.data"
      :loading="table.loading"
      :pagination="table.pagination"
    />

    <NModal
      v-model:show="form.visible"
      :close-on-esc="false"
      :mask-closable="false"
      :title="form.isEdit ? '编辑' : '新增'"
      preset="card"
      style="width: 400px"
    >
      <NForm ref="formRef" :model="form.data" :rules="form.rules">
        <NFormItem label="用户名" path="username">
          <NInput v-model:value="form.data.username" />
        </NFormItem>
        <NFormItem label="密码" path="password">
          <NInput v-model:value="form.data.password" />
        </NFormItem>
        <NSpace justify="end">
          <NButton :loading="form.loading" type="primary" @click="itemSubmit">
            确定
          </NButton>
        </NSpace>
      </NForm>
    </NModal>
  </div>
</template>

<style scoped>
#copy {
  display: none;
}
</style>
