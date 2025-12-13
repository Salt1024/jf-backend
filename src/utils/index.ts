import { createDiscreteApi } from 'naive-ui'

const { message, notification, dialog } = createDiscreteApi(
  ['message', 'dialog', 'notification']
)
export {
  message as showMessage,
  notification,
  dialog,
}