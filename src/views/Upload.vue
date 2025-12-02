<template>
  <div class="product-form-container">
    <a-card title="Yangi Mahsulot Qo'shish" :bordered="true" style="max-width: 800px; margin: 0 auto;">
      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical" @finish="onFinish"
        @finishFailed="onFinishFailed">
        <!-- Category Selection -->
        <a-form-item label="Kategoriya" name="category" has-feedback>
          <a-select v-model:value="formState.category" placeholder="Kategoriyani tanlang" size="large" show-search
            :filter-option="filterOption">
            <a-select-option v-for="cat in categories" :key="cat.uz" :value="cat.uz">
              {{ cat.uz }} / {{ cat.ru }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- Product Name (Uzbek) -->
        <a-form-item label="Mahsulot Nomi (O'zbekcha)" name="name" has-feedback>
          <a-input v-model:value="formState.name" placeholder="Mahsulot nomini o'zbekcha kiriting" size="large" />
        </a-form-item>

        <!-- Product Name (Russian) -->
        <a-form-item label="Mahsulot Nomi (Ruscha)" name="nameRu" has-feedback>
          <a-input v-model:value="formState.nameRu" placeholder="Введите название продукта" size="large" />
        </a-form-item>

        <!-- Description (Uzbek) -->
        <a-form-item label="Ta'rif (O'zbekcha)" name="description" has-feedback>
          <a-textarea v-model:value="formState.description" placeholder="Mahsulot haqida o'zbekcha ma'lumot kiriting"
            :rows="4" size="large" />
        </a-form-item>

        <!-- Description (Russian) -->
        <a-form-item label="Ta'rif (Ruscha)" name="descriptionRu" has-feedback>
          <a-textarea v-model:value="formState.descriptionRu" placeholder="Введите описание продукта" :rows="4"
            size="large" />
        </a-form-item>

        <!-- Price, Discount Price, and Stock in one row -->
        <a-row :gutter="16">
          <a-col :xs="24" :sm="8">
            <a-form-item label="Oddiy Narxi (so'm)" name="price" has-feedback>
              <a-input-number v-model:value="formState.price" placeholder="0.00" :min="0" :step="0.01" :precision="2"
                size="large" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :xs="24" :sm="8">
            <a-form-item label="Chegirmadagi Narxi (so'm)" name="discountPrice" has-feedback>
              <a-input-number v-model:value="formState.discountPrice" placeholder="0.00" :min="0" :step="0.01"
                :precision="2" size="large" style="width: 100%" />
            </a-form-item>
          </a-col>

          <a-col :xs="24" :sm="8">
            <a-form-item label="Omborda Soni" name="stock" has-feedback>
              <a-input-number v-model:value="formState.stock" placeholder="0" :min="0" :step="1" size="large"
                style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <!-- Discount Percentage Display -->
        <a-alert v-if="discountPercentage > 0" :message="`Chegirma: ${discountPercentage}%`" type="success" show-icon
          style="margin-bottom: 24px" />

        <!-- Stock Warning -->
        <a-alert v-if="formState.stock !== null && formState.stock < 5"
          :message="formState.stock === 0 ? 'Diqqat! Tovar tugagan' : `Diqqat! Omborda kam qoldi (${formState.stock} dona)`"
          :type="formState.stock === 0 ? 'error' : 'warning'" show-icon style="margin-bottom: 24px" />

        <!-- Product Link -->
        <a-form-item label="Mahsulot Havolasi" name="link" has-feedback>
          <a-input v-model:value="formState.link" placeholder="https://example.com/product/..." size="large" />
        </a-form-item>

        <!-- Main Product Image Upload -->
        <a-form-item label="Asosiy Mahsulot Rasmi" name="mainImage">
          <a-upload v-model:file-list="mainImageFile" name="mainImage" list-type="picture-card"
            class="product-image-uploader" :before-upload="beforeUpload" :max-count="1" @change="handleMainImageChange"
            @preview="handlePreview">
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
        <a-form-item label="Qo'shimcha Rasmlar (Maksimal 5 ta)" name="additionalImages">
          <a-upload v-model:file-list="additionalImageFiles" name="additionalImages" list-type="picture-card"
            class="product-image-uploader" :before-upload="beforeUpload" :max-count="5" multiple
            @change="handleAdditionalImagesChange" @preview="handlePreview">
            <div v-if="additionalImageFiles.length < 5">
              <PlusOutlined />
              <div style="margin-top: 8px">Rasm yuklash</div>
            </div>
          </a-upload>
          <a-typography-text type="secondary" style="font-size: 12px">
            Qo'llab-quvvatlanadigan formatlar: JPG, PNG, GIF (Har biri maksimal 5MB)
          </a-typography-text>
        </a-form-item>

        <a-form-item label="Tovaringizni tipini kiriting" name="tovar-type">
          <a-input placeholder="Rang , O'lcham ..." v-model:value="formState.tovarType" />
        </a-form-item>

        <!-- Slide uchun rasmalar  -->
        <a-form-item label="Slide uchun rasmlar" name="slideImages">
          <a-upload v-model:file-list="slidesImageFiles" name="slidesImages" list-type="picture-card"
            class="product-image-uploader" :before-upload="beforeUpload" :max-count="5" multiple
            @change="handleSlideImagesChange" @preview="handlePreview">
            <div v-if="slidesImageFiles.length < 5">
              <PlusOutlined />
              <div style="margin-top: 8px">Rasm yuklash</div>
            </div>
          </a-upload>
          <a-typography-text type="secondary" style="font-size: 12px">
            Qo'llab-quvvatlanadigan formatlar: JPG, PNG, GIF (Har biri maksimal 5MB)
          </a-typography-text>
        </a-form-item>
        <div v-for="(file, index) in slidesImageFiles" :key="index" style="margin: 10px;">
          <a-input v-model:value="file.caption" :placeholder="`${index + 1}-rasm uchun nom kiriting`" />
        </div>

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
      <a-modal :open="uploadProgress.visible" title="Rasmlar yuklanmoqda..." :footer="null" :closable="false"
        :maskClosable="false">
        <a-progress :percent="uploadProgress.percent" :status="uploadProgress.status" />
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
const slidesImageFiles = ref([])
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
  additionalImages: [],
  slidesImages: [],
  tovarType : ''
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

const handleSlideImagesChange = ({ fileList: newFileList }) => {
  slidesImageFiles.value = newFileList.map(file => ({
    ...file,
    caption: file.caption || ''
  }));

  formState.slidesImages = slidesImageFiles.value;
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

const uploadImageToSupabase = async (file, productId, imageType = 'main', index = 0) => {
  try {
    // Fayl nomini yaratish
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    let fileName
    if (imageType === 'main') {
      fileName = `main_${timestamp}.${fileExt}`
    } else if (imageType === `additional`) {
      fileName = `additional_${index + 1}_${timestamp}.${fileExt}`
    } else if (imageType === 'slidesImage') {
      fileName = `slideimage_${index + 1}_${timestamp}.${fileExt}`
    }

    // Storage path: images/{productId}/{fileName}
    const filePath = `${productId}/${fileName}`;

    // Supabase Storage ga yuklash
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Rasmni yuklashda xatolik: ${error.message}`);
    }

    // Public URL olish
    const { data: publicUrlData } = supabase.storage
      .from(`product-images`)
      .getPublicUrl(filePath);

    console.log(`✅ ${imageType} rasm yuklandi:`, publicUrlData.publicUrl);
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('❌ Supabase Storage xatolik:', error);
    throw error;
  }
};

const deleteAllProductImages = async (productId) => {
  try {
    const folderPath = `images/products/${productId}`;

    // Papkadagi barcha fayllarni ro'yxatga olish
    const { data: filesList, error: listError } = await supabase.storage
      .from('product-images')
      .list(folderPath);

    if (listError) {
      console.error('Fayllar ro\'yxatini olishda xatolik:', listError);
      return;
    }

    if (filesList && filesList.length > 0) {
      // Barcha fayllarni o'chirish
      const filePaths = filesList.map(file => `${folderPath}/${file.name}`);

      const { error: deleteError } = await supabase.storage
        .from('product-images')
        .remove(filePaths);

      if (deleteError) {
        console.error('Rasmlarni o\'chirishda xatolik:', deleteError);
      } else {
        console.log(`✅ ${filePaths.length} ta rasm o'chirildi`);
      }
    }
  } catch (error) {
    console.error('❌ Rasmlarni o\'chirishda xatolik:', error);
  }
};

const rollbackProduct = async (productId) => {
  try {
    // 1. Rasmlarni o'chirish
    await deleteAllProductImages(productId);

    // 2. product_images jadvalidagi ma'lumotlarni o'chirish
    const { error: imagesError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (imagesError) {
      console.error('product_images o\'chirishda xatolik:', imagesError);
    }

    // 3. products jadvalidagi ma'lumotni o'chirish
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (productError) {
      console.error('Product o\'chirishda xatolik:', productError);
    } else {
      console.log('✅ Rollback muvaffaqiyatli bajarildi');
    }

  } catch (error) {
    console.error('❌ Rollback xatolik:', error);
  }
};

// Form submission
const onFinish = async (values) => {
  loading.value = true;
  let productId = null;

  try {
    // Show upload progress modal
    const totalImages = 1 + formState.additionalImages.length + formState.slidesImages.length;
    uploadProgress.visible = true;
    uploadProgress.total = totalImages;
    uploadProgress.current = 0;
    uploadProgress.percent = 0;
    uploadProgress.status = 'active';

    // 1. Avval product ma'lumotlarini saqlash (rasm URLlarsiz)
    const selectedCategory = categories.find(cat => cat.uz === formState.category);

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
      main_image: null , 
      tovar_type :  values.tovarType 
    };

    const { data: productInserted, error: productError } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (productError) {
      throw new Error('Ma\'lumotlarni saqlashda xatolik: ' + productError.message);
    }

    productId = productInserted.id;
    console.log('✅ Product yaratildi, ID:', productId);

    // 2. Asosiy rasmni Supabase Storage ga yuklash
    let mainImageUrl = null;
    if (formState.mainImage) {
      mainImageUrl = await uploadImageToSupabase(formState.mainImage, productId, 'main');
      uploadProgress.current++;
      uploadProgress.percent = Math.round((uploadProgress.current / uploadProgress.total) * 100);

      // Asosiy rasm URL ni update qilish
      const { error: updateError } = await supabase
        .from('products')
        .update({ main_image: mainImageUrl })
        .eq('id', productId);

      if (updateError) {
        throw new Error('Asosiy rasmni yangilashda xatolik: ' + updateError.message);
      }
    }

    // 3. Qo'shimcha rasmlarni Supabase Storage ga yuklash
    if (formState.additionalImages.length > 0) {
      for (let i = 0; i < formState.additionalImages.length; i++) {
        const imageFile = formState.additionalImages[i];
        const imageUrl = await uploadImageToSupabase(imageFile, productId, 'additional', i);

        // product_images jadvaliga saqlash
        const { error: imageError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: imageUrl,
            display_order: i + 1
          });

        if (imageError) {
          throw new Error('Qo\'shimcha rasmni saqlashda xatolik: ' + imageError.message);
        }

        uploadProgress.current++;
        uploadProgress.percent = Math.round((uploadProgress.current / uploadProgress.total) * 100);
      }
    }

    // 4. slides imagelarni yuklash
    if (formState.slidesImages.length > 0) {
      for (let i = 0; i < formState.slidesImages.length; i++) {
        const fileItem = formState.slidesImages[i]
        const imageFile = fileItem.originFileObj || fileItem;
        const imageUrl = await uploadImageToSupabase(imageFile, productId, 'slidesImage', i);
        const caption = fileItem.caption || '';

        // product_slides jadvaliga saqlash
        const { error: imageError } = await supabase
          .from('product_slides')
          .insert({
            product_id: productId,
            image_url: imageUrl,
            caption: caption,
            display_order: i + 1
          });

        if (imageError) {
          throw new Error('Qo\'shimcha rasmni saqlashda xatolik: ' + imageError.message);
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

    // ROLLBACK: Agar xatolik yuz bersa, yaratilgan ma'lumotlarni o'chirish
    if (productId) {
      message.warning('Xatolik yuz berdi. Ma\'lumotlar qaytarilmoqda...');
      await rollbackProduct(productId);
    }

    message.error(error.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    console.error('Form submission error:', error);
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
  slidesImageFiles.value = []
  formState.mainImage = null;
  formState.additionalImages = [];
  formState.category = undefined;
  formState.stock = 0;
  formState.tovarType = ''
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