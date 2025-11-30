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
        <!-- Category Selection -->
        <a-form-item
          label="Kategoriya"
          name="category"
          has-feedback
        >
          <a-select
            v-model:value="formState.category"
            placeholder="Kategoriyani tanlang"
            size="large"
            show-search
            :filter-option="filterOption"
          >
            <a-select-option 
              v-for="cat in categories" 
              :key="cat.uz" 
              :value="cat.uz"
            >
              {{ cat.uz }} / {{ cat.ru }}
            </a-select-option>
          </a-select>
        </a-form-item>

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

        <!-- Price, Discount Price, and Stock in one row -->
        <a-row :gutter="16">
          <a-col :xs="24" :sm="8">
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

          <a-col :xs="24" :sm="8">
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

          <a-col :xs="24" :sm="8">
            <a-form-item
              label="Omborda Soni"
              name="stock"
              has-feedback
            >
              <a-input-number
                v-model:value="formState.stock"
                placeholder="0"
                :min="0"
                :step="1"
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

        <!-- Stock Warning -->
        <a-alert
          v-if="formState.stock !== null && formState.stock < 5"
          :message="formState.stock === 0 ? 'Diqqat! Tovar tugagan' : `Diqqat! Omborda kam qoldi (${formState.stock} dona)`"
          :type="formState.stock === 0 ? 'error' : 'warning'"
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

        <!-- Main Product Image Upload -->
        <a-form-item
          label="Asosiy Mahsulot Rasmi"
          name="mainImage"
        >
          <a-upload
            v-model:file-list="mainImageFile"
            name="mainImage"
            list-type="picture-card"
            class="product-image-uploader"
            :before-upload="beforeUpload"
            :max-count="1"
            @change="handleMainImageChange"
            @preview="handlePreview"
          >
            <div v-if="mainImageFile.length < 1">
              <PlusOutlined />
              <div style="margin-top: 8px">Asosiy rasm</div>
            </div>
          </a-upload>
          <a-typography-text type="secondary" style="font-size: 12px">
            Bu rasm mahsulotning asosiy rasmi bo'ladi
          </a-typography-text>
        </a-form-item>

        <!-- Additional Images Upload -->
        <a-form-item
          label="Qo'shimcha Rasmlar (Maksimal 5 ta)"
          name="additionalImages"
        >
          <a-upload
            v-model:file-list="additionalImageFiles"
            name="additionalImages"
            list-type="picture-card"
            class="product-image-uploader"
            :before-upload="beforeUpload"
            :max-count="5"
            multiple
            @change="handleAdditionalImagesChange"
            @preview="handlePreview"
          >
            <div v-if="additionalImageFiles.length < 5">
              <PlusOutlined />
              <div style="margin-top: 8px">Rasm yuklash</div>
            </div>
          </a-upload>
          <a-typography-text type="secondary" style="font-size: 12px">
            Qo'llab-quvvatlanadigan formatlar: JPG, PNG, GIF (Har biri maksimal 5MB)
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
              <template #icon>
                <SaveOutlined />
              </template>
              Mahsulot Qo'shish
            </a-button>
            <a-button size="large" @click="handleReset">
              <template #icon>
                <ClearOutlined />
              </template>
              Tozalash
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- Upload Progress -->
      <a-modal
        :open="uploadProgress.visible"
        title="Rasmlar yuklanmoqda..."
        :footer="null"
        :closable="false"
        :maskClosable="false"
      >
        <a-progress 
          :percent="uploadProgress.percent" 
          :status="uploadProgress.status"
        />
        <p style="margin-top: 16px; text-align: center">
          {{ uploadProgress.current }} / {{ uploadProgress.total }} rasm yuklandi
        </p>
      </a-modal>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined, SaveOutlined, ClearOutlined } from '@ant-design/icons-vue';
import { supabase } from '@/Supabase/supabase';

// Kategoriyalar ro'yxati
const categories = [
  { uz: 'Texnika', ru: 'Техника' },
  { uz: 'Telefon', ru: 'Телефон' },
  { uz: 'Kompyuter', ru: 'Компьютер' },
  { uz: 'Planshet', ru: 'Планшет' },
  { uz: 'Aksessuarlar', ru: 'Аксессуары' },
  { uz: 'Maishiy texnika', ru: 'Бытовая техника' },
  { uz: 'Audio texnika', ru: 'Аудио техника' },
  { uz: 'Kiyim', ru: 'Одежда' },
  { uz: 'Oyoq kiyim', ru: 'Обувь' },
  { uz: 'Sport buyumlari', ru: 'Спорттовары' },
  { uz: 'Kitoblar', ru: 'Книги' },
  { uz: 'Boshqalar', ru: 'Прочее' }
];

const formRef = ref();
const loading = ref(false);
const mainImageFile = ref([]);
const additionalImageFiles = ref([]);
const previewVisible = ref(false);
const previewImage = ref('');

// Upload progress state
const uploadProgress = reactive({
  visible: false,
  percent: 0,
  current: 0,
  total: 0,
  status: 'active'
});

// Form state
const formState = reactive({
  category: undefined,
  name: '',
  nameRu: '',
  description: '',
  descriptionRu: '',
  price: null,
  discountPrice: null,
  stock: 0,
  link: '',
  mainImage: null,
  additionalImages: []
});

// Validation rules
const rules = {
  category: [
    { required: true, message: 'Kategoriyani tanlang', trigger: 'change' }
  ],
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
  stock: [
    { required: true, message: 'Tovar sonini kiriting', trigger: 'blur' },
    { type: 'number', min: 0, message: 'Tovar soni 0 dan kichik bo\'lishi mumkin emas', trigger: 'blur' }
  ],
  link: [
    { required: true, message: 'Mahsulot havolasini kiriting', trigger: 'blur' },
    { 
      type: 'url', 
      message: 'To\'g\'ri URL kiriting (masalan: https://example.com)', 
      trigger: 'blur' 
    }
  ],
  mainImage: [
    { 
      validator: (rule, value) => {
        if (mainImageFile.value.length === 0) {
          return Promise.reject('Asosiy mahsulot rasmini yuklang');
        }
        return Promise.resolve();
      },
      trigger: 'change'
    }
  ]
};

// Filter option for select search
const filterOption = (input, option) => {
  return option.children[0].children.toLowerCase().includes(input.toLowerCase());
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

const handleMainImageChange = ({ fileList: newFileList }) => {
  mainImageFile.value = newFileList;
  if (newFileList.length > 0) {
    formState.mainImage = newFileList[0].originFileObj;
  } else {
    formState.mainImage = null;
  }
};

const handleAdditionalImagesChange = ({ fileList: newFileList }) => {
  additionalImageFiles.value = newFileList;
  formState.additionalImages = newFileList.map(file => file.originFileObj);
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

// Upload single image to Supabase
const uploadImage = async (file, folder = 'products') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file);

  if (error) {
    throw new Error('Rasmni yuklashda xatolik: ' + error.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);

  return publicUrl;
};

// Form submission
const onFinish = async (values) => {
  loading.value = true;

  try {
    // Show upload progress modal
    const totalImages = 1 + formState.additionalImages.length;
    uploadProgress.visible = true;
    uploadProgress.total = totalImages;
    uploadProgress.current = 0;
    uploadProgress.percent = 0;
    uploadProgress.status = 'active';

    // Upload main image
    let mainImageUrl = null;
    if (formState.mainImage) {
      mainImageUrl = await uploadImage(formState.mainImage);
      uploadProgress.current++;
      uploadProgress.percent = Math.round((uploadProgress.current / uploadProgress.total) * 100);
    }

    // Find selected category
    const selectedCategory = categories.find(cat => cat.uz === formState.category);

    // Insert product data
    const productData = {
      category_uz: selectedCategory.uz,
      category_ru: selectedCategory.ru,
      name: values.name,
      name_ru: values.nameRu,
      description: values.description,
      description_ru: values.descriptionRu,
      price: values.price,
      discount_price: values.discountPrice || null,
      stock: values.stock,
      link: values.link,
      main_image: mainImageUrl
    };

    const { data: productInserted, error: productError } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (productError) {
      throw new Error('Ma\'lumotlarni saqlashda xatolik: ' + productError.message);
    }

    // Upload additional images
    if (formState.additionalImages.length > 0) {
      const productId = productInserted.id;
      
      for (let i = 0; i < formState.additionalImages.length; i++) {
        const imageFile = formState.additionalImages[i];
        const imageUrl = await uploadImage(imageFile, `products/${productId}`);
        
        // Insert into product_images table
        const { error: imageError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: imageUrl,
            display_order: i + 1
          });

        if (imageError) {
          console.error('Qo\'shimcha rasmni saqlashda xatolik:', imageError);
        }

        uploadProgress.current++;
        uploadProgress.percent = Math.round((uploadProgress.current / uploadProgress.total) * 100);
      }
    }

    uploadProgress.status = 'success';
    
    setTimeout(() => {
      uploadProgress.visible = false;
      message.success('Mahsulot muvaffaqiyatli qo\'shildi!');
      handleReset();
    }, 1000);

  } catch (error) {
    uploadProgress.status = 'exception';
    uploadProgress.visible = false;
    message.error(error.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
  } finally {
    loading.value = false;
  }
};

const onFinishFailed = (errorInfo) => {
  message.error('Iltimos, barcha majburiy maydonlarni to\'g\'ri to\'ldiring!');
};

const handleReset = () => {
  formRef.value.resetFields();
  mainImageFile.value = [];
  additionalImageFiles.value = [];
  formState.mainImage = null;
  formState.additionalImages = [];
  formState.category = undefined;
  formState.stock = 0;
  message.info('Forma tozalandi');
};
</script>

<style scoped>
.product-form-container {
  padding: 24px;
}

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

:deep(.ant-progress) {
  margin-bottom: 0;
}
</style>