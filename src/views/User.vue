<script lang="ts" setup>
import { reactive, onMounted, ref, h, watch, computed } from 'vue'
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
import areaData from '@/area.json'

interface TableItem {
  id: number
  /** 姓名 */
  name: string
  /** 电话 */
  phone: string
  /** 省 */
  province: string
  /** 市 */
  city: string
  /** 小区 */
  community: string
  /** 门牌号 */
  houseNumber: string
  /** 抽奖次数 */
  drawCount: number
}

type TableFilters = {
  /** 省 */
  province?: string
  /** 市 */
  city?: string
  /** 小区 */
  community?: string
  /** 门牌号 */
  houseNumber?: string
}

interface FormData {
  id?: number
  /** 姓名 */
  name: string
  /** 电话 */
  phone: string
  /** 省 */
  province: string
  /** 市 */
  city: string
  /** 小区 */
  community: string
  /** 门牌号 */
  houseNumber: string
  /** 抽奖次数 */
  drawCount?: number
}

const { table, tableGet } = useTable<TableItem, TableFilters>({
  url: '/api/v1/users',
  filters: {
    province: '',
    city: '',
    community: '',
    houseNumber: '',
  },
  pageSize: 50,
})

const tableColumns: DataTableColumns<TableItem> = [
  { title: 'ID', key: 'id', width: 80, align: 'center', fixed: 'left' },
  { title: '姓名', key: 'name', minWidth: 100, align: 'center' },
  { title: '电话', key: 'phone', minWidth: 120, align: 'center' },
  { title: '省', key: 'province', minWidth: 100, align: 'center' },
  { title: '市', key: 'city', minWidth: 100, align: 'center' },
  { title: '小区', key: 'community', minWidth: 120, align: 'center' },
  { title: '门牌号', key: 'houseNumber', minWidth: 120, align: 'center' },
  { title: '抽奖次数', key: 'drawCount', width: 100, align: 'center' },
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

// 省份选项列表
const provinceOptions = areaData.map((province: any) => ({
  label: province.text,
  value: province.value,
}))

// 城市选项列表（根据选中的省动态生成）
const cityOptions = computed(() => {
  if (!form.data.province) {
    return []
  }
  const province = areaData.find((p: any) => p.value === form.data.province)
  return province ? province.children.map((city: any) => ({
    label: city.text,
    value: city.value,
  })) : []
})

// 筛选条件的城市选项
const filterCityOptions = computed(() => {
  if (!table.filters.province) {
    return []
  }
  const province = areaData.find((p: any) => p.value === table.filters.province)
  return province ? province.children.map((city: any) => ({
    label: city.text,
    value: city.value,
  })) : []
})

// 当省份变化时，清空城市选择
const handleProvinceChange = () => {
  form.data.city = ''
}

// 筛选条件：当省份变化时，清空城市选择
const handleFilterProvinceChange = () => {
  table.filters.city = ''
}

const formRef = ref<InstanceType<typeof NForm>>()
const form = reactive({
  loading: false,
  visible: false,
  isEdit: false,
  data: {
    name: '',
    phone: '',
    province: '',
    city: '',
    community: '',
    houseNumber: '',
    drawCount: 0,
  },
  rules: {
    name: { required: true, message: '请输入姓名', trigger: 'blur' },
    phone: { 
      required: true, 
      message: '请输入电话', 
      trigger: 'blur',
    },
    province: { required: true, message: '请选择省', trigger: ['blur', 'change'] },
    city: { required: true, message: '请选择市', trigger: ['blur', 'change'] },
    community: { required: true, message: '请输入小区', trigger: 'blur' },
    houseNumber: { required: true, message: '请输入门牌号', trigger: 'blur' },
  },
}) as ReactiveForm<FormData>


const itemAdd = () => {
  form.isEdit = false
  form.data = {
    name: '',
    phone: '',
    province: '',
    city: '',
    community: '',
    houseNumber: '',
    drawCount: 0,
  }
  form.visible = true
}

const itemEdit = (row: TableItem) => {
  form.isEdit = true
  form.data = {
    id: row.id,
    name: row.name,
    phone: row.phone,
    province: row.province,
    city: row.city,
    community: row.community,
    houseNumber: row.houseNumber,
    drawCount: row.drawCount || 0,
  }
  form.visible = true
}

const itemSubmit = async () => {
  await formRef.value.validate()
  form.loading = true
  try {
    if (form.isEdit) {
      await put('/api/v1/users', form.data)
    } else {
      await post('/api/v1/users', form.data)
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
    content: `确定要删除用户"${row.name}"吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      d.loading = true
      try {
        await del(`/api/v1/users/${row.id}`)
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
    <NSpace align="center" justify="space-between" style="margin-bottom: 16px;">
      <NForm inline>
        <NFormItem path="province">
          <NSelect
            v-model:value="table.filters.province"
            :options="provinceOptions"
            placeholder="选择省"
            clearable
            filterable
            style="width: 140px;"
            @update:value="handleFilterProvinceChange"
          />
        </NFormItem>
        <NFormItem path="city">
          <NSelect
            v-model:value="table.filters.city"
            :options="filterCityOptions"
            placeholder="选择市"
            clearable
            filterable
            :disabled="!table.filters.province"
            style="width: 140px;"
          />
        </NFormItem>
        <NFormItem path="community">
          <NInput
            v-model:value="table.filters.community"
            clearable
            placeholder="小区（模糊）"
            style="width: 140px;"
          />
        </NFormItem>
        <NFormItem path="houseNumber">
          <NInput
            v-model:value="table.filters.houseNumber"
            clearable
            placeholder="门牌号（模糊）"
            style="width: 160px;"
          />
        </NFormItem>
        <NFormItem>
          <NButton type="primary" @click="tableGet(true)">查询</NButton>
        </NFormItem>
      </NForm>
      <NButton type="primary" @click="itemAdd">添加用户</NButton>
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
      :title="form.isEdit ? '编辑用户' : '新增用户'"
      preset="card"
      style="width: 600px"
    >
      <NForm ref="formRef" :model="form.data" :rules="form.rules" label-width="100px">
        <NFormItem label="姓名" path="name">
          <NInput v-model:value="form.data.name" placeholder="请输入姓名" />
        </NFormItem>
        <NFormItem label="电话" path="phone">
          <NInput v-model:value="form.data.phone" placeholder="请输入电话" />
        </NFormItem>
        <NFormItem label="省" path="province">
          <NSelect
            v-model:value="form.data.province"
            :options="provinceOptions"
            placeholder="请选择省"
            clearable
            filterable
            @update:value="handleProvinceChange"
          />
        </NFormItem>
        <NFormItem label="市" path="city">
          <NSelect
            v-model:value="form.data.city"
            :options="cityOptions"
            placeholder="请选择市"
            clearable
            filterable
            :disabled="!form.data.province"
          />
        </NFormItem>
        <NFormItem label="小区" path="community">
          <NInput v-model:value="form.data.community" placeholder="请输入小区" />
        </NFormItem>
        <NFormItem label="门牌号" path="houseNumber">
          <NInput v-model:value="form.data.houseNumber" placeholder="请输入门牌号" />
        </NFormItem>
        <NFormItem label="抽奖次数" path="drawCount">
          <NInputNumber v-model:value="form.data.drawCount" :min="0" placeholder="请输入抽奖次数" style="width: 100%;" />
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
