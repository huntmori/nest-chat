<template>
  <div class="signup-container">
    <div class="signup-card">
      <h1>회원가입</h1>
      <form @submit.prevent="handleSignup">
        <div class="form-group">
          <label for="id">아이디</label>
          <input
            id="id"
            v-model="formData.id"
            type="text"
            required
            placeholder="아이디를 입력하세요"
          />
        </div>

        <div class="form-group">
          <label for="email">이메일</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            placeholder="이메일을 입력하세요"
          />
        </div>

        <div class="form-group">
          <label for="nickname">닉네임</label>
          <input
            id="nickname"
            v-model="formData.nickname"
            type="text"
            required
            placeholder="닉네임을 입력하세요"
          />
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">비밀번호 확인</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '처리중...' : '회원가입' }}
        </button>

        <div class="link-text">
          이미 계정이 있으신가요?
          <router-link to="/login">로그인</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/auth';

const router = useRouter();

const formData = ref({
  id: '',
  email: '',
  nickname: '',
  password: '',
});

const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

const handleSignup = async () => {
  error.value = '';

  if (formData.value.password !== confirmPassword.value) {
    error.value = '비밀번호가 일치하지 않습니다';
    return;
  }

  loading.value = true;

  try {
    await authService.signup(formData.value);
    alert('회원가입이 완료되었습니다!');
    router.push('/login');
  } catch (err: any) {
    error.value = err.response?.data?.message || '회원가입에 실패했습니다';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.signup-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 15px;
  padding: 10px;
  background: #ffe6e6;
  border-radius: 5px;
  font-size: 14px;
}

.link-text {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.link-text a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.link-text a:hover {
  text-decoration: underline;
}
</style>
