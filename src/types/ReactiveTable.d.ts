import { Pagination } from 'naive-ui'

export interface ReactiveTable<Item, Filters> {
  /** 表格数据 */
  data: Item[],
  pagination:  Pagination,
  /** 表格加载状态 */
  loading?: boolean
  /** 表格查询条件 */
  filters?: Filters
}
