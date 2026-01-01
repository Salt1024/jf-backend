<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NCard,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSpace,
} from 'naive-ui'
import { useUserStore } from '@/store'
import { showMessage } from '@/utils'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('signin')

const signInForm = reactive({
  username: '',
  password: '',
})

const signUpForm = reactive({
  username: '',
  password: '',
})

const signInLoading = ref(false)
const signUpLoading = ref(false)

const handleSignIn = async () => {
  if (!signInForm.username || !signInForm.password) {
    showMessage.warning('请输入用户名和密码')
    return
  }
  
  signInLoading.value = true
  try {
    await userStore.signIn(signInForm)
    showMessage.success('登录成功')
    router.push('/')
  } catch (e: any) {
    showMessage.error(e.message || '登录失败')
  } finally {
    signInLoading.value = false
  }
}

const handleSignUp = async () => {
  if (!signUpForm.username || !signUpForm.password) {
    showMessage.warning('请输入用户名和密码')
    return
  }
  
  signUpLoading.value = true
  try {
    await userStore.signUp(signUpForm)
    showMessage.success('注册成功，请登录')
    activeTab.value = 'signin'
    signInForm.username = signUpForm.username
    signInForm.password = signUpForm.password
  } catch (e: any) {
    showMessage.error(e.message || '注册失败')
  } finally {
    signUpLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>后台管理系统</h1>
      </div>
      
      <NCard :bordered="false" class="login-card">
        <NTabs
          v-model:value="activeTab"
          animated
          justify-content="space-evenly"
          type="line"
        >
          <NTabPane name="signin" tab="登录">
            <NForm>
              <NFormItem label="用户名">
                <NInput
                  v-model:value="signInForm.username"
                  placeholder="请输入用户名"
                  size="large"
                />
              </NFormItem>
              <NFormItem label="密码">
                <NInput
                  v-model:value="signInForm.password"
                  placeholder="请输入密码"
                  show-password-on="click"
                  size="large"
                  type="password"
                  @keyup.enter="handleSignIn"
                />
              </NFormItem>
              <NFormItem>
                <NButton
                  :loading="signInLoading"
                  block
                  size="large"
                  type="primary"
                  @click="handleSignIn"
                >
                  登录
                </NButton>
              </NFormItem>
            </NForm>
          </NTabPane>
          
          <NTabPane name="signup" tab="注册">
            <NForm>
              <NFormItem label="用户名">
                <NInput
                  v-model:value="signUpForm.username"
                  placeholder="请输入用户名"
                  size="large"
                />
              </NFormItem>
              <NFormItem label="密码">
                <NInput
                  v-model:value="signUpForm.password"
                  placeholder="请输入密码"
                  show-password-on="click"
                  size="large"
                  type="password"
                  @keyup.enter="handleSignUp"
                />
              </NFormItem>
              <NFormItem>
                <NButton
                  :loading="signUpLoading"
                  block
                  size="large"
                  type="primary"
                  @click="handleSignUp"
                >
                  注册
                </NButton>
              </NFormItem>
            </NForm>
          </NTabPane>
        </NTabs>
      </NCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-header {
  margin-bottom: 30px;
  text-align: center;
  
  h1 {
    margin: 0;
    font-size: 32px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.login-card {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}
</style>

