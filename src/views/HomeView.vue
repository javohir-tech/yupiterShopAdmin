<template>
  <div class="products-page">
    <a-card title="Mahsulotlar ro'yxati" :bordered="false">
      <!-- Category Filter -->
      <div style="margin-bottom: 16px;">
        <a-space>
          <span style="font-weight: 500;">Kategoriya bo'yicha filter:</span>
          <a-select
            v-model:value="selectedCategory"
            placeholder="Barcha kategoriyalar"
            style="width: 250px;"
            @change="handleCategoryChange"
            allow-clear
          >
            <a-select-option value="">Barchasi</a-select-option>
            <a-select-option 
              v-for="cat in categories" 
              :key="cat.uz" 
              :value="cat.uz"
            >
              {{ cat.uz }} / {{ cat.ru }}
            </a-select-option>
          </a-select>
          <a-tag v-if="selectedCategory" color="blue">
            {{ filteredProducts.length }} ta mahsulot
          </a-tag>
          <a-tag v-else color="default">
            {{ products.length }} ta mahsulot
          </a-tag>
        </a-space>
      </div>

      <a-table 
        :columns="columns" 
        :data-source="filteredProducts" 
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        row-key="id"
        :scroll="{ x: 1200 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'image'">
            <a-image
              v-if="record.main_image"
              :width="60"
              :src="record.main_image"
              :preview="true"
            />
            <span v-else>-</span>
          </template>

          <template v-if="column.key === 'category'">
            <a-tag color="blue">{{ record.category_uz }}</a-tag>
          </template>

          <template v-if="column.key === 'price'">
            <div>
              <div v-if="record.discount_price" style="text-decoration: line-through; color: #999;">
                {{ formatPrice(record.price) }}
              </div>
              <div :style="record.discount_price ? 'color: #f5222d; font-weight: bold;' : ''">
                {{ formatPrice(record.discount_price || record.price) }}
              </div>
            </div>
          </template>

          <template v-if="column.key === 'stock'">
            <a-tag :color="getStockColor(record.stock)">
              <template #icon>
                <InboxOutlined v-if="record.stock > 0" />
                <CloseCircleOutlined v-else />
              </template>
              {{ record.stock || 0 }} dona
            </a-tag>
          </template>

          <template v-if="column.key === 'seen'">
            <a-space>
              <EyeOutlined style="color: #1890ff;" />
              <span style="font-weight: 500;">{{ record.seen || 0 }}</span>
            </a-space>
          </template>

          <template v-if="column.key === 'link'">
            <a :href="record.link" target="_blank" v-if="record.link">
              <a-button type="link" size="small">
                <LinkOutlined /> Havola
              </a-button>
            </a>
            <span v-else>-</span>
          </template>

          <template v-if="column.key === 'action'">
            <a-space>
              <a-button 
                type="primary" 
                size="small"
                @click="handleEdit(record)"
              >
                <EditOutlined /> Tahrirlash
              </a-button>
              
              <a-popconfirm
                title="Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?"
                ok-text="Ha"
                cancel-text="Yo'q"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="primary" danger size="small">
                  <DeleteOutlined /> O'chirish
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Edit Modal -->
    <a-modal
      v-model:open="editModalVisible"
      title="Mahsulotni tahrirlash"
      :confirm-loading="modalLoading"
      @ok="handleUpdate"
      @cancel="handleModalCancel"
      width="900px"
      ok-text="Saqlash"
      cancel-text="Bekor qilish"
    >
      <a-form
        :model="editForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="Kategoriya">
          <a-select
            v-model:value="editForm.category_uz"
            placeholder="Kategoriyani tanlang"
            style="width: 100%;"
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

        <a-form-item label="Nomi (UZ)">
          <a-input v-model:value="editForm.name" />
        </a-form-item>

        <a-form-item label="Nomi (RU)">
          <a-input v-model:value="editForm.name_ru" />
        </a-form-item>

        <a-form-item label="Tavsif (UZ)">
          <a-textarea v-model:value="editForm.description" :rows="3" />
        </a-form-item>

        <a-form-item label="Tavsif (RU)">
          <a-textarea v-model:value="editForm.description_ru" :rows="3" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item label="Narxi" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-input-number 
                v-model:value="editForm.price" 
                :min="0"
                style="width: 100%"
                :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')"
                :parser="value => value.replace(/\s/g, '')"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="Chegirmali" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
              <a-input-number 
                v-model:value="editForm.discount_price" 
                :min="0"
                style="width: 100%"
                :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')"
                :parser="value => value.replace(/\s/g, '')"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item label="Omborda soni">
          <a-input-number 
            v-model:value="editForm.stock" 
            :min="0"
            :step="1"
            style="width: 100%"
          />
          <a-alert
            v-if="editForm.stock !== null && editForm.stock < 5"
            :message="editForm.stock === 0 ? 'Tovar tugagan!' : `Omborda kam qoldi (${editForm.stock} dona)`"
            :type="editForm.stock === 0 ? 'error' : 'warning'"
            show-icon
            style="margin-top: 8px"
          />
        </a-form-item>

        <a-form-item label="Havola">
          <a-input v-model:value="editForm.link" />
        </a-form-item>

        <a-form-item label="Ko'rilganlar soni">
          <a-statistic :value="editForm.seen || 0" style="display: inline-block;">
            <template #prefix>
              <EyeOutlined />
            </template>
          </a-statistic>
        </a-form-item>

        <!-- Main Image -->
        <a-form-item label="Asosiy rasm">
          <!-- Yangi rasm preview -->
          <div v-if="newMainImagePreview" style="margin-bottom: 10px;">
            <div style="position: relative; display: inline-block;">
              <a-image :width="150" :src="newMainImagePreview" />
              <a-tag color="success" style="position: absolute; top: 5px; right: 5px;">
                Yangi rasm
              </a-tag>
            </div>
          </div>
          
          <!-- Eski rasm -->
          <div v-else-if="editForm.main_image" style="margin-bottom: 10px;">
            <div style="position: relative; display: inline-block;">
              <a-image :width="150" :src="editForm.main_image" />
              <a-tag color="default" style="position: absolute; top: 5px; right: 5px;">
                Hozirgi rasm
              </a-tag>
            </div>
          </div>

          <a-upload
            :before-upload="(file) => handleBeforeUpload(file, 'main')"
            :show-upload-list="false"
            accept="image/*"
          >
            <a-button>
              <UploadOutlined /> {{ newMainImagePreview ? 'Boshqa rasm tanlash' : 'Yangi rasm yuklash' }}
            </a-button>
          </a-upload>
          
          <a-button 
            v-if="newMainImagePreview" 
            danger 
            style="margin-left: 10px;"
            @click="clearNewMainImage"
          >
            Bekor qilish
          </a-button>
        </a-form-item>

        <!-- Additional Images -->
        <a-form-item label="Qo'shimcha rasmlar">
          <div style="margin-bottom: 10px;">
            <!-- Existing additional images -->
            <div v-if="existingAdditionalImages.length > 0" style="margin-bottom: 16px;">
              <div style="margin-bottom: 8px; font-weight: 500;">Mavjud rasmlar:</div>
              <a-space :size="8" wrap>
                <div 
                  v-for="img in existingAdditionalImages" 
                  :key="img.id"
                  style="position: relative; display: inline-block;"
                >
                  <a-image :width="100" :src="img.image_url" />
                  <a-button 
                    danger 
                    size="small"
                    style="position: absolute; top: 2px; right: 2px;"
                    @click="removeExistingImage(img.id)"
                  >
                    <DeleteOutlined />
                  </a-button>
                </div>
              </a-space>
            </div>

            <!-- New images preview -->
            <div v-if="newAdditionalImagesPreviews.length > 0" style="margin-bottom: 16px;">
              <div style="margin-bottom: 8px; font-weight: 500;">Yangi rasmlar:</div>
              <a-space :size="8" wrap>
                <div 
                  v-for="(preview, index) in newAdditionalImagesPreviews" 
                  :key="index"
                  style="position: relative; display: inline-block;"
                >
                  <a-image :width="100" :src="preview" />
                  <a-tag color="success" style="position: absolute; top: 2px; left: 2px; font-size: 10px;">
                    Yangi
                  </a-tag>
                  <a-button 
                    danger 
                    size="small"
                    style="position: absolute; top: 2px; right: 2px;"
                    @click="removeNewImage(index)"
                  >
                    <DeleteOutlined />
                  </a-button>
                </div>
              </a-space>
            </div>

            <!-- Upload button -->
            <a-upload
              :before-upload="(file) => handleBeforeUpload(file, 'additional')"
              :show-upload-list="false"
              accept="image/*"
              multiple
              :disabled="totalImagesCount >= 5"
            >
              <a-button :disabled="totalImagesCount >= 5">
                <PlusOutlined /> Rasm qo'shish ({{ totalImagesCount }}/5)
              </a-button>
            </a-upload>
            
            <div style="margin-top: 8px;">
              <a-typography-text type="secondary" style="font-size: 12px;">
                Maksimal 5 ta qo'shimcha rasm yuklash mumkin
              </a-typography-text>
            </div>
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Delete Progress Modal -->
    <a-modal
      :open="deleteProgress.visible"
      title="O'chirilmoqda..."
      :footer="null"
      :closable="false"
      :maskClosable="false"
    >
      <a-spin tip="Mahsulot va rasmlar o'chirilmoqda..." />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { 
  EditOutlined, 
  DeleteOutlined, 
  LinkOutlined, 
  UploadOutlined, 
  EyeOutlined,
  InboxOutlined,
  CloseCircleOutlined,
  PlusOutlined
} from '@ant-design/icons-vue';
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

const columns = [
  {
    title: 'Rasm',
    key: 'image',
    width: 100,
  },
  {
    title: 'Kategoriya',
    key: 'category',
    width: 120,
  },
  {
    title: 'Nomi',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Nomi (RU)',
    dataIndex: 'name_ru',
    key: 'name_ru',
  },
  {
    title: 'Narxi',
    key: 'price',
    width: 150,
  },
  {
    title: 'Ombor',
    key: 'stock',
    width: 120,
  },
  {
    title: 'Ko\'rildi',
    key: 'seen',
    width: 100,
  },
  {
    title: 'Havola',
    key: 'link',
    width: 120,
  },
  {
    title: 'Amallar',
    key: 'action',
    width: 250,
  },
];

const products = ref([]);
const selectedCategory = ref('');
const filteredProducts = ref([]);
const loading = ref(false);
const editModalVisible = ref(false);
const modalLoading = ref(false);
const editForm = ref({});
const newMainImage = ref(null);
const newMainImagePreview = ref(null);
const newAdditionalImages = ref([]);
const newAdditionalImagesPreviews = ref([]);
const existingAdditionalImages = ref([]);
const imagesToDelete = ref([]);
const currentProductId = ref(null);
const oldMainImagePath = ref(null);

const deleteProgress = reactive({
  visible: false
});

// Computed: Total images count
const totalImagesCount = computed(() => {
  return existingAdditionalImages.value.length + newAdditionalImages.value.length;
});

// Get stock color based on quantity
const getStockColor = (stock) => {
  if (stock === 0) return 'red';
  if (stock < 5) return 'orange';
  if (stock < 20) return 'blue';
  return 'green';
};

// Fetch products
const fetchProducts = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    products.value = data;
    filteredProducts.value = data;
  } catch (error) {
    message.error('Ma\'lumotlarni yuklashda xatolik: ' + error.message);
  } finally {
    loading.value = false;
  }
};

// Handle category filter change
const handleCategoryChange = (value) => {
  if (!value || value === '') {
    filteredProducts.value = products.value;
  } else {
    filteredProducts.value = products.value.filter(
      product => product.category_uz === value
    );
  }
};

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
  }).format(price);
};

// Fetch additional images for product
const fetchAdditionalImages = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Qo\'shimcha rasmlarni yuklashda xatolik:', error);
    return [];
  }
};

// Handle edit
const handleEdit = async (record) => {
  currentProductId.value = record.id;
  oldMainImagePath.value = record.main_image;
  
  // Fetch additional images
  const additionalImages = await fetchAdditionalImages(record.id);
  existingAdditionalImages.value = additionalImages;
  
  editForm.value = {
    category_uz: record.category_uz,
    category_ru: record.category_ru,
    name: record.name,
    name_ru: record.name_ru,
    description: record.description,
    description_ru: record.description_ru,
    price: record.price,
    discount_price: record.discount_price,
    stock: record.stock || 0,
    link: record.link,
    main_image: record.main_image,
    seen: record.seen || 0
  };
  
  // Reset new images
  newMainImage.value = null;
  newMainImagePreview.value = null;
  newAdditionalImages.value = [];
  newAdditionalImagesPreviews.value = [];
  imagesToDelete.value = [];
  
  editModalVisible.value = true;
};

// Handle image upload
const handleBeforeUpload = (file, type) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('Faqat rasm fayllarini yuklash mumkin!');
    return false;
  }
  
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error('Rasm hajmi 5MB dan oshmasligi kerak!');
    return false;
  }

  if (type === 'main') {
    newMainImage.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      newMainImagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    // Check limit
    if (totalImagesCount.value >= 5) {
      message.warning('Maksimal 5 ta qo\'shimcha rasm yuklash mumkin!');
      return false;
    }
    
    newAdditionalImages.value.push(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      newAdditionalImagesPreviews.value.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
  
  return false;
};

// Clear new main image
const clearNewMainImage = () => {
  newMainImage.value = null;
  newMainImagePreview.value = null;
};

// Remove existing additional image
const removeExistingImage = (imageId) => {
  imagesToDelete.value.push(imageId);
  existingAdditionalImages.value = existingAdditionalImages.value.filter(
    img => img.id !== imageId
  );
};

// Remove new additional image
const removeNewImage = (index) => {
  newAdditionalImages.value.splice(index, 1);
  newAdditionalImagesPreviews.value.splice(index, 1);
};

// Upload image to storage
const uploadImage = async (file, folder = 'products') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
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

// Delete image from storage
const deleteImageFromStorage = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folder = urlParts[urlParts.length - 2];
    const filePath = folder ? `${folder}/${fileName}` : fileName;
    
    await supabase.storage.from('images').remove([filePath]);
  } catch (err) {
    console.error('Rasmni o\'chirishda xatolik:', err);
  }
};

// Handle update
const handleUpdate = async () => {
  modalLoading.value = true;
  try {
    let mainImageUrl = editForm.value.main_image;

    // Upload new main image if selected
    if (newMainImage.value) {
      mainImageUrl = await uploadImage(newMainImage.value);
      
      // Delete old main image
      if (oldMainImagePath.value) {
        await deleteImageFromStorage(oldMainImagePath.value);
      }
    }

    // Prepare update data
    const selectedCat = categories.find(cat => cat.uz === editForm.value.category_uz);
    
    const updateData = {
      category_uz: selectedCat?.uz,
      category_ru: selectedCat?.ru,
      name: editForm.value.name,
      name_ru: editForm.value.name_ru,
      description: editForm.value.description,
      description_ru: editForm.value.description_ru,
      price: Number(editForm.value.price),
      discount_price: editForm.value.discount_price ? Number(editForm.value.discount_price) : null,
      stock: Number(editForm.value.stock),
      link: editForm.value.link,
      main_image: mainImageUrl,
    };

    // Update product
    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', currentProductId.value);

    if (error) throw error;

    // Delete marked images
    for (const imageId of imagesToDelete.value) {
      const imageToDelete = existingAdditionalImages.value.find(img => img.id === imageId) 
        || await supabase.from('product_images').select('*').eq('id', imageId).single().then(res => res.data);
      
      if (imageToDelete) {
        await deleteImageFromStorage(imageToDelete.image_url);
        await supabase.from('product_images').delete().eq('id', imageId);
      }
    }

    // Upload new additional images
    for (let i = 0; i < newAdditionalImages.value.length; i++) {
      const imageFile = newAdditionalImages.value[i];
      const imageUrl = await uploadImage(imageFile, `products/${currentProductId.value}`);
      
      const currentOrder = existingAdditionalImages.value.length + i + 1;
      
      await supabase
        .from('product_images')
        .insert({
          product_id: currentProductId.value,
          image_url: imageUrl,
          display_order: currentOrder
        });
    }

    message.success('Mahsulot muvaffaqiyatli yangilandi!');
    editModalVisible.value = false;
    selectedCategory.value = '';
    await fetchProducts();
  } catch (error) {
    console.error('Update error:', error);
    message.error(error.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
  } finally {
    modalLoading.value = false;
  }
};

// Handle modal cancel
const handleModalCancel = () => {
  editModalVisible.value = false;
  newMainImage.value = null;
  newMainImagePreview.value = null;
  newAdditionalImages.value = [];
  newAdditionalImagesPreviews.value = [];
  existingAdditionalImages.value = [];
  imagesToDelete.value = [];
};

// Handle delete
const handleDelete = async (id) => {
  deleteProgress.visible = true;
  
  try {
    const product = products.value.find(p => p.id === id);
    
    // Delete main image
    if (product && product.main_image) {
      await deleteImageFromStorage(product.main_image);
    }

    // Fetch and delete additional images
    const additionalImages = await fetchAdditionalImages(id);
    for (const img of additionalImages) {
      await deleteImageFromStorage(img.image_url);
    }

    // Delete product (CASCADE will delete product_images automatically)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    message.success('Mahsulot muvaffaqiyatli o\'chirildi!');
    selectedCategory.value = '';
    await fetchProducts();
  } catch (error) {
    message.error('O\'chirishda xatolik: ' + error.message);
  } finally {
    deleteProgress.visible = false;
  }
};

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.products-page {
  padding: 24px;
}

:deep(.ant-table) {
  font-size: 14px;
}

:deep(.ant-image) {
  border-radius: 4px;
}
</style>