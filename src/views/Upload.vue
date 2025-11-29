<template>
  <div class="product-form-container">
    <a-card title="Yangi Mahsulot Qo'shish" :bordered="true" style="max-width: 800px; margin: 0 auto;">
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
      >
        <!-- Product Name (Uzbek) -->
        <a-form-item
          label="Mahsulot Nomi (O'zbekcha)"
          name="name"
          has-feedback
        >
          <a-input
            v-model:value="formState.name"
            placeholder="Mahsulot nomini o'zbekcha kiriting"
            size="large"
          />
        </a-form-item>

        <!-- Product Name (Russian) -->
        <a-form-item
          label="Mahsulot Nomi (Ruscha)"
          name="nameRu"
          has-feedback
        >
          <a-input
            v-model:value="formState.nameRu"
            placeholder="Введите название продукта"
            size="large"
          />
        </a-form-item>

        <!-- Description (Uzbek) -->
        <a-form-item
          label="Ta'rif (O'zbekcha)"
          name="description"
          has-feedback
        >
          <a-textarea
            v-model:value="formState.description"
            placeholder="Mahsulot haqida o'zbekcha ma'lumot kiriting"
            :rows="4"
            size="large"
          />
        </a-form-item>

        <!-- Description (Russian) -->
        <a-form-item
          label="Ta'rif (Ruscha)"
          name="descriptionRu"
          has-feedback
        >
          <a-textarea
            v-model:value="formState.descriptionRu"
            placeholder="Введите описание продукта"
            :rows="4"
            size="large"
          />
        </a-form-item>

        <!-- Price and Discount Price in one row -->
        <a-row :gutter="16">
          <a-col :xs="24" :sm="12">
            <a-form-item
              label="Oddiy Narxi (so'm)"
              name="price"
              has-feedback
            >
              <a-input-number
                v-model:value="formState.price"
                placeholder="0.00"
                :min="0"
                :step="0.01"
                :precision="2"
                size="large"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>

          <a-col :xs="24" :sm="12">
            <a-form-item
              label="Chegirmadagi Narxi (so'm)"
              name="discountPrice"
              has-feedback
            >
              <a-input-number
                v-model:value="formState.discountPrice"
                placeholder="0.00"
                :min="0"
                :step="0.01"
                :precision="2"
                size="large"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Discount Percentage Display -->
        <a-alert
          v-if="discountPercentage > 0"
          :message="`Chegirma: ${discountPercentage}%`"
          type="success"
          show-icon
          style="margin-bottom: 24px"
        />

        <!-- Product Link -->
        <a-form-item
          label="Mahsulot Havolasi"
          name="link"
          has-feedback
        >
          <a-input
            v-model:value="formState.link"
            placeholder="https://example.com/product/..."
            size="large"
          />
        </a-form-item>

        <!-- Product Image Upload -->
        <a-form-item
          label="Mahsulot Rasmi"
          name="image"
        >
          <a-upload
            v-model:file-list="fileList"
            name="image"
            list-type="picture-card"
            class="product-image-uploader"
            :before-upload="beforeUpload"
            :max-count="1"
            @change="handleImageChange"
            @preview="handlePreview"
          >
            <div v-if="fileList.length < 1">
              <PlusOutlined />
              <div style="margin-top: 8px">Rasm yuklash</div>
            </div>
          </a-upload>
          <a-typography-text type="secondary" style="font-size: 12px">
            Qo'llab-quvvatlanadigan formatlar: JPG, PNG, GIF (Maksimal 5MB)
          </a-typography-text>
        </a-form-item>

        <!-- Preview Modal -->
        <a-modal :open="previewVisible" :footer="null" @cancel="handleCancelPreview">
          <img :src="previewImage" style="width: 100%" alt="Preview" />
        </a-modal>

        <!-- Form Actions -->
        <a-form-item>
          <a-space>
            <a-button type="primary" html-type="submit" size="large" :loading="loading">
              Mahsulot Qo'shish
            </a-button>
            <a-button size="large" @click="handleReset">
              Tozalash
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { supabase } from '@/Supabase/supabase';

const formRef = ref();
const loading = ref(false);
const fileList = ref([]);
const previewVisible = ref(false);
const previewImage = ref('');

// Form state
const formState = reactive({
  name: '',
  nameRu: '',
  description: '',
  descriptionRu: '',
  price: null,
  discountPrice: null,
  link: '',
  image: null
});

// Validation rules
const rules = {
  name: [
    { required: true, message: 'Mahsulot nomini o\'zbekcha kiriting', trigger: 'blur' },
    { min: 3, message: 'Nom kamida 3 ta belgidan iborat bo\'lishi kerak', trigger: 'blur' },
    { max: 100, message: 'Nom 100 ta belgidan oshmasligi kerak', trigger: 'blur' }
  ],
  nameRu: [
    { required: true, message: 'Введите название продукта на русском', trigger: 'blur' },
    { min: 3, message: 'Название должно содержать минимум 3 символа', trigger: 'blur' },
    { max: 100, message: 'Название не должно превышать 100 символов', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'Mahsulot ta\'rifini o\'zbekcha kiriting', trigger: 'blur' },
    { min: 10, message: 'Ta\'rif kamida 10 ta belgidan iborat bo\'lishi kerak', trigger: 'blur' },
    { max: 500, message: 'Ta\'rif 500 ta belgidan oshmasligi kerak', trigger: 'blur' }
  ],
  descriptionRu: [
    { required: true, message: 'Введите описание продукта на русском', trigger: 'blur' },
    { min: 10, message: 'Описание должно содержать минимум 10 символов', trigger: 'blur' },
    { max: 500, message: 'Описание не должно превышать 500 символов', trigger: 'blur' }
  ],
  price: [
    { required: true, message: 'Oddiy narxni kiriting', trigger: 'blur' },
    { type: 'number', min: 0.01, message: 'Narx 0 dan katta bo\'lishi kerak', trigger: 'blur' }
  ],
  discountPrice: [
    { 
      validator: (rule, value) => {
        if (value !== null && value !== undefined && value !== '') {
          if (value < 0) {
            return Promise.reject('Chegirmadagi narx manfiy bo\'lishi mumkin emas');
          }
          if (formState.price && value >= formState.price) {
            return Promise.reject('Chegirmadagi narx oddiy narxdan kichik bo\'lishi kerak');
          }
        }
        return Promise.resolve();
      },
      trigger: 'blur'
    }
  ],
  link: [
    { required: true, message: 'Mahsulot havolasini kiriting', trigger: 'blur' },
    { 
      type: 'url', 
      message: 'To\'g\'ri URL kiriting (masalan: https://example.com)', 
      trigger: 'blur' 
    }
  ],
  image: [
    { 
      validator: (rule, value) => {
        if (fileList.value.length === 0) {
          return Promise.reject('Mahsulot rasmini yuklang');
        }
        return Promise.resolve();
      },
      trigger: 'change'
    }
  ]
};

// Calculate discount percentage
const discountPercentage = computed(() => {
  if (formState.price && formState.discountPrice && formState.discountPrice < formState.price) {
    return Math.round(((formState.price - formState.discountPrice) / formState.price) * 100);
  }
  return 0;
});

// Image upload handlers
const beforeUpload = (file) => {
  const isValidType = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
  if (!isValidType) {
    message.error('Faqat JPG/PNG/GIF formatidagi fayllarni yuklash mumkin!');
    return false;
  }
  
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('Rasm hajmi 5MB dan kichik bo\'lishi kerak!');
    return false;
  }
  
  return false;
};

const handleImageChange = ({ fileList: newFileList }) => {
  fileList.value = newFileList;
  if (newFileList.length > 0) {
    formState.image = newFileList[0].originFileObj;
  } else {
    formState.image = null;
  }
};

const handlePreview = async (file) => {
  if (!file.url && !file.preview) {
    file.preview = await getBase64(file.originFileObj);
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
};

const handleCancelPreview = () => {
  previewVisible.value = false;
};

const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Form submission
const onFinish = async (values) => {
  loading.value = true;

  try {
    let imageUrl = null;

    // Upload image
    if (formState.image) {
      const fileExt = formState.image.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, formState.image);

      if (uploadError) {
        throw new Error('Rasmni yuklashda xatolik: ' + uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      imageUrl = publicUrl;
    }

    // Insert product data
    const productData = {
      name: values.name,
      name_ru: values.nameRu,
      description: values.description,
      description_ru: values.descriptionRu,
      price: values.price,
      discount_price: values.discountPrice || null,
      link: values.link,
      image: imageUrl
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select();

    if (error) {
      throw new Error('Ma\'lumotlarni saqlashda xatolik: ' + error.message);
    }

    message.success('Mahsulot muvaffaqiyatli qo\'shildi!');
    handleReset();
  } catch (error) {
    message.error(error.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
  } finally {
    loading.value = false;
  }
};

const onFinishFailed = (errorInfo) => {
  message.error('Iltimos, barcha maydonlarni to\'g\'ri to\'ldiring!');
};

const handleReset = () => {
  formRef.value.resetFields();
  fileList.value = [];
  formState.image = null;
  message.info('Forma tozalandi');
};
</script>

<style scoped>


:deep(.ant-upload-picture-card-wrapper) {
  display: inline-block;
}

:deep(.ant-upload.ant-upload-select-picture-card) {
  width: 150px;
  height: 150px;
}

:deep(.ant-upload-list-picture-card-container) {
  width: 150px;
  height: 150px;
}

:deep(.ant-form-item-label > label) {
  font-weight: 500;
}
</style>