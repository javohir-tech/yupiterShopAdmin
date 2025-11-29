<template>
    <div class="login-container">
        <div class="login-box">
            <div class="login-title">
                <h1>Kirish</h1>
                <p>Hisobingizga kiring</p>
            </div>

            <a-form :model="formState" :rules="rules" @finish="handleLogin" layout="vertical">
                <a-form-item label="Email" name="email">
                    <a-input v-model:value="formState.email" size="large" placeholder="email@example.com"
                        :prefix="h(MailOutlined)" />
                </a-form-item>

                <a-form-item label="Parol" name="password">
                    <a-input-password v-model:value="formState.password" size="large"
                        placeholder="Parolingizni kiriting" :prefix="h(LockOutlined)" />
                </a-form-item>

                <a-form-item>
                    <a-checkbox v-model:checked="formState.remember">
                        Eslab qolish
                    </a-checkbox>
                </a-form-item>

                <a-form-item>
                    <a-button type="primary" html-type="submit" size="large" :loading="loading" block>
                        Kirish
                    </a-button>
                </a-form-item>

                <div class="register-link">
                    Hisobingiz yo'qmi? <a href="/register">Ro'yxatdan o'tish</a>
                </div>
            </a-form>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, h } from 'vue';
import { message } from 'ant-design-vue';
import { MailOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';

import { supabase } from "@/Supabase/supabase"
const router = useRouter()
const loading = ref(false);

const formState = reactive({
    email: '',
    password: '',
    remember: false
});

const rules = {
    email: [
        { required: true, message: 'Email kiritish majburiy!' },
        { type: 'email', message: 'To\'g\'ri email kiriting!' }
    ],
    password: [
        { required: true, message: 'Parol kiritish majburiy!' },
        { min: 6, message: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!' }
    ]
};

const handleLogin = async (values) => {
    loading.value = true;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password
        });

        if (error) {
            message.error(error.message || 'Kirish xato bo\'ldi!');
            return;
        }

        if (data.session) {
            // Tokenni localStorage ga saqlash
            localStorage.setItem('access_token', data.session.access_token);
            localStorage.setItem('refresh_token', data.session.refresh_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            message.success('Muvaffaqiyatli kirdingiz!');

            // Dashboard ga yo'naltirish (kerak bo'lsa)
            // window.location.href = '/dashboard';
            // yoki Vue Router bilan: router.push('/dashboard');
        }
        router.push("/")
    } catch (err) {
        message.error('Xatolik yuz berdi!');
        console.error('Login error:', err);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    padding: 20px;
}

.login-box {
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 400px;
}

.login-title {
    text-align: center;
    margin-bottom: 32px;
}

.login-title h1 {
    font-size: 24px;
    font-weight: 600;
    color: #262626;
    margin: 0 0 8px 0;
}

.login-title p {
    color: #8c8c8c;
    font-size: 14px;
    margin: 0;
}

.register-link {
    text-align: center;
    margin-top: 16px;
    color: #8c8c8c;
    font-size: 14px;
}

.register-link a {
    color: #1890ff;
    text-decoration: none;
}

.register-link a:hover {
    text-decoration: underline;
}
</style>