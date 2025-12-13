import { reactive } from 'vue'
import { get, post } from '@/api'
import { showMessage } from '@/utils'
import type { ReactiveTable } from '@/types'

interface TableOptions<Filters, TransformFilters> {
  url: string,
  pageSize?: number,
  method?: 'get' | 'post',
  filters?: Filters,
  transformFilters?: (filters: Filters) => TransformFilters
}

export function useTable<TableItem, Filters = null, TransformFilters = null> (options: TableOptions<Filters, TransformFilters>) {
  const table = reactive({
    loading: false,
    data: [],
    filters: null,
    pagination: {
      page: 1,
      pageSize: options.pageSize || 10,
      showSizePicker: true,
      pageSizes: [10, 20, 50, 100],
      onChange: (page: number) => {
        table.pagination.page = page
        tableGet()
      },
      onUpdatePageSize: (pageSize: number) => {
        table.pagination.pageSize = pageSize
        table.pagination.page = 1
        tableGet()
      }
    }
  }) as ReactiveTable<TableItem, Filters>

  table.filters = options.filters || null

  const tableGet = async (reload: boolean = false) => {
    table.loading = true
    if (reload) {
      table.pagination.page = 1
    }
    const request = options.method === 'post' ? post : get
    try {
      const param = typeof options.transformFilters === 'function' ? options.transformFilters(table.filters) : table.filters
      const result = await request<Array<TableItem>>(
        options.url,
        Object.assign(
          {
            page: table.pagination.page,
            pageSize: table.pagination.pageSize
          },
          param
        )
      )
      table.data = result
    } catch (e: any) {
      showMessage.error(e.message)
    } finally {
      table.loading = false
    }
  }

  return {
    table,
    tableGet
  }
}
