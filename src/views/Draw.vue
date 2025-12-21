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
  NTag,
  NUpload,
  NImage,
} from 'naive-ui'
import type { UploadFileInfo } from 'naive-ui'
import { useTable } from '@/composables/useTable'
import { get, post, put, del } from '@/api'
import DrawSettingsDialog from '@/components/DrawSettingsDialog.vue'

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
  participantUserIds?: string[]
  /** 中奖者用户IDs */
  winnerUserIds?: string[]
  /** 中奖人数 */
  winnerCount: number
  /** 奖品组 */
  rewardGroup: string
  /** 是否已抽奖 */
  isDrawn?: boolean
  /** 等级 */
  level?: string
  /** 排序 */
  order?: number
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
  /** 中奖人数 */
  winnerCount: number
  /** 奖品组 */
  rewardGroup: string
  /** 是否已抽奖 */
  isDrawn?: boolean
  /** 等级 */
  level?: string
  /** 排序 */
  order?: number
}

interface WinnerUser {
  id: number
  name: string
  phone: string
  province: string
  city: string
  community: string
  houseNumber: string
  drawCount: number
  operator: string
  updateTime: number
}

const { table, tableGet } = useTable<TableItem, TableFilters>({
  url: '/api/v1/draw',
  filters: {
    rewardGroup: '',
  },
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
          style: 'width: 50px; height: 50px; object-fit: cover;',
        })
      }
      return '-'
    },
  },
  { title: '奖品组', key: 'rewardGroup', minWidth: 100, align: 'center' },
  { title: '等级', key: 'level', minWidth: 100, align: 'center' },
  { title: '排序', key: 'order', minWidth: 80, align: 'center' },
  { title: '中奖人数', key: 'winnerCount', minWidth: 100, align: 'center' },
  {
    title: '是否已抽奖',
    key: 'isDrawn',
    minWidth: 100,
    align: 'center',
    render(row) {
      return h(
        NTag,
        { type: row.isDrawn ? 'success' : 'default' },
        { default: () => (row.isDrawn ? '已抽奖' : '未抽奖') },
      )
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 300,
    align: 'center',
    fixed: 'right',
    render(row) {
      return h(NSpace, { justify: 'center' }, () => {
        const list = [
          h(
            NButton,
            {
              type: 'info',
              size: 'small',
              onClick: () => itemSettings(row),
            },
            { default: () => '设置' },
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
        ]
        if (row.isDrawn) {
          list.push(
            h(
              NButton,
              {
                type: 'warning',
                size: 'small',
                onClick: () => viewWinners(row),
                disabled: !row.isDrawn,
              },
              { default: () => '中奖用户' },
            ),
          )
        } else {
          list.push(
            h(
              NButton,
              {
                type: 'error',
                size: 'small',
                onClick: () => itemRemove(row),
              },
              { default: () => '删除' },
            ),
          )
        }
        return list
      })
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
    winnerCount: 1,
    rewardGroup: '',
    isDrawn: false,
    level: '',
    order: 0,
  },
  rules: {
    rewardName: { required: true, message: '请输入奖品名称', trigger: 'blur' },
    rewardGroup: { required: true, message: '请输入奖品组', trigger: 'blur' },
    winnerCount: { required: true, type: 'number', message: '请输入中奖人数', trigger: 'blur' },
  },
}) as ReactiveForm<FormData>

const settingsDialog = reactive({
  visible: false,
  drawId: undefined as number | undefined,
})

// 中奖用户弹窗
const winnersDialog = reactive({
  visible: false,
  loading: false,
  drawName: '',
  winners: [] as WinnerUser[],
})

// 图片上传相关
const uploadFileList = ref<UploadFileInfo[]>([])
const imagePreviewUrl = ref<string>('')

const customUploadRequest = async (options: any) => {
  const { file, onFinish, onError } = options

  try {
    const formData = new FormData()
    formData.append('file', file.file as File)

    const response: any = await post('/api/v1/file/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response && response.url) {
      form.data.image = response.url
      imagePreviewUrl.value = response.url
      showMessage.success('图片上传成功')
      onFinish()
    } else {
      showMessage.error('图片上传失败')
      onError()
    }
  } catch (error: any) {
    showMessage.error(error.message || '图片上传失败')
    onError()
  }
}

const handleRemoveImage = () => {
  form.data.image = ''
  imagePreviewUrl.value = ''
  uploadFileList.value = []
}

const itemAdd = () => {
  form.isEdit = false
  form.data = {
    rewardName: '',
    image: '',
    winnerCount: 1,
    rewardGroup: '',
    isDrawn: false,
    level: '',
    order: 0,
  }
  imagePreviewUrl.value = ''
  uploadFileList.value = []
  form.visible = true
}

const itemEdit = (row: TableItem) => {
  form.isEdit = true
  form.data = {
    id: row.id,
    rewardName: row.rewardName,
    image: row.image || '',
    winnerCount: row.winnerCount || 1,
    rewardGroup: row.rewardGroup,
    isDrawn: row.isDrawn || false,
    level: row.level || '',
    order: row.order || 0,
  }
  imagePreviewUrl.value = row.image || ''
  uploadFileList.value = row.image
    ? [
        {
          id: 'current',
          name: '当前图片',
          status: 'finished',
          url: row.image,
        },
      ]
    : []
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

const itemSettings = (row: TableItem) => {
  settingsDialog.drawId = row.id
  settingsDialog.visible = true
}

const handleSettingsSuccess = () => {
  tableGet()
}

// 查看中奖用户
const viewWinners = async (row: TableItem) => {
  winnersDialog.drawName = row.rewardGroup + '-' + row.level
  winnersDialog.visible = true
  winnersDialog.loading = true
  try {
    const winners = await get<WinnerUser[]>(`/api/v1/draw/winners/${row.id}`)
    winnersDialog.winners = winners || []
  } catch (e: any) {
    showMessage.error(e.message || '获取中奖用户失败')
  } finally {
    winnersDialog.loading = false
  }
}

// 中奖用户表格列
const winnersColumns: DataTableColumns<WinnerUser> = [
  { title: 'ID', key: 'id', width: 80, align: 'center' },
  { title: '姓名', key: 'name', minWidth: 100, align: 'center' },
  { title: '电话', key: 'phone', minWidth: 120, align: 'center' },
  { title: '省', key: 'province', minWidth: 100, align: 'center' },
  { title: '市', key: 'city', minWidth: 100, align: 'center' },
  { title: '小区', key: 'community', minWidth: 150, align: 'center' },
  { title: '门牌号', key: 'houseNumber', minWidth: 120, align: 'center' },
]

// 导出中奖用户为CSV
const exportWinners = () => {
  if (winnersDialog.winners.length === 0) {
    showMessage.warning('没有中奖用户数据可导出')
    return
  }

  // CSV表头
  const headers = ['ID', '姓名', '电话', '省', '市', '小区', '门牌号', '抽奖次数']
  const csvContent = [
    headers.join(','),
    ...winnersDialog.winners.map((user) =>
      [user.id, user.name, user.phone, user.province, user.city, user.community, user.houseNumber, user.drawCount].join(
        ',',
      ),
    ),
  ].join('\n')

  // 添加BOM以支持中文
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${winnersDialog.drawName}-中奖用户-${new Date().getTime()}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  showMessage.success('导出成功')
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
          <NInput v-model:value="table.filters.rewardGroup" clearable placeholder="奖品组" />
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
        <NFormItem label="等级" path="level">
          <NInput v-model:value="form.data.level" placeholder="请输入等级" />
        </NFormItem>
        <NFormItem label="排序" path="order">
          <NInputNumber v-model:value="form.data.order" :min="0" placeholder="请输入排序" style="width: 100%" />
        </NFormItem>
        <NFormItem label="中奖人数" path="winnerCount">
          <NInputNumber
            v-model:value="form.data.winnerCount"
            :min="1"
            placeholder="请输入中奖人数"
            style="width: 100%"
          />
        </NFormItem>
        <NFormItem label="图片" path="image">
          <NSpace vertical style="width: 100%">
            <NUpload
              v-model:file-list="uploadFileList"
              :max="1"
              :custom-request="customUploadRequest"
              list-type="image-card"
              accept="image/*"
              @remove="handleRemoveImage"
            >
              <NButton v-if="!imagePreviewUrl">点击上传图片</NButton>
            </NUpload>
          </NSpace>
        </NFormItem>
        <NSpace justify="end">
          <NButton @click="form.visible = false">取消</NButton>
          <NButton :loading="form.loading" type="primary" @click="itemSubmit"> 确定 </NButton>
        </NSpace>
      </NForm>
    </NModal>

    <DrawSettingsDialog
      v-model:visible="settingsDialog.visible"
      :draw-id="settingsDialog.drawId"
      @success="handleSettingsSuccess"
    />

    <!-- 中奖用户弹窗 -->
    <NModal
      v-model:show="winnersDialog.visible"
      :title="`中奖用户列表 - ${winnersDialog.drawName}`"
      preset="card"
      style="width: 90%; max-width: 1200px"
    >
      <NSpace vertical>
        <NSpace justify="space-between">
          <div>共 {{ winnersDialog.winners.length }} 人中奖</div>
          <NButton type="primary" @click="exportWinners"> 导出为CSV </NButton>
        </NSpace>
        <NDataTable
          :columns="winnersColumns"
          :data="winnersDialog.winners"
          :loading="winnersDialog.loading"
          :scroll-x="1000"
          max-height="500px"
        />
      </NSpace>
    </NModal>
  </div>
</template>

<style scoped></style>
