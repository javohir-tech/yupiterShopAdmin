<template>
  <div class="products-page">
    <a-card title="Mahsulotlar ro'yxati" :bordered="false">
      <a-table 
        :columns="columns" 
        :data-source="products" 
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'image'">
            <a-image
              v-if="record.image"
              :width="60"
              :src="record.image"
              :preview="true"
            />
            <span v-else>-</span>
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
      width="800px"
      ok-text="Saqlash"
      cancel-text="Bekor qilish"
    >
      <a-form
        :model="editForm"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
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

        <a-form-item label="Narxi">
          <a-input-number 
            v-model:value="editForm.price" 
            :min="0"
            style="width: 100%"
            :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')"
            :parser="value => value.replace(/\s/g, '')"
          />
        </a-form-item>

        <a-form-item label="Chegirmali narxi">
          <a-input-number 
            v-model:value="editForm.discount_price" 
            :min="0"
            style="width: 100%"
            :formatter="value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')"
            :parser="value => value.replace(/\s/g, '')"
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

        <a-form-item label="Rasm">
          <!-- Yangi rasm preview -->
          <div v-if="newImagePreview" style="margin-bottom: 10px;">
            <div style="position: relative; display: inline-block;">
              <a-image :width="150" :src="newImagePreview" />
              <a-tag color="success" style="position: absolute; top: 5px; right: 5px;">
                Yangi rasm
              </a-tag>
            </div>
          </div>
          
          <!-- Eski rasm (faqat yangi rasm tanlanmagan bo'lsa) -->
          <div v-else-if="editForm.image" style="margin-bottom: 10px;">
            <div style="position: relative; display: inline-block;">
              <a-image :width="150" :src="editForm.image" />
              <a-tag color="default" style="position: absolute; top: 5px; right: 5px;">
                Hozirgi rasm
              </a-tag>
            </div>
          </div>

          <a-upload
            :before-upload="handleBeforeUpload"
            :show-upload-list="false"
            accept="image/*"
          >
            <a-button>
              <UploadOutlined /> {{ newImagePreview ? 'Boshqa rasm tanlash' : 'Yangi rasm yuklash' }}
            </a-button>
          </a-upload>
          
          <a-button 
            v-if="newImagePreview" 
            danger 
            style="margin-left: 10px;"
            @click="clearNewImage"
          >
            Bekor qilish
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { EditOutlined, DeleteOutlined, LinkOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons-vue';

import {supabase} from "@/Supabase/supabase"

const columns = [
  {
    title: 'Rasm',
    key: 'image',
    width: 100,
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
const loading = ref(false);
const editModalVisible = ref(false);
const modalLoading = ref(false);
const editForm = ref({});
const newImage = ref(null);
const newImagePreview = ref(null);
const currentProductId = ref(null);
const oldImagePath = ref(null);

// Fetch products
const fetchProducts = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    console.log(data)
    products.value = data;
  } catch (error) {
    message.error('Ma\'lumotlarni yuklashda xatolik: ' + error.message);
  } finally {
    loading.value = false;
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

// Handle edit
const handleEdit = (record) => {
  currentProductId.value = record.id;
  oldImagePath.value = record.image;
  editForm.value = {
    name: record.name,
    name_ru: record.name_ru,
    description: record.description,
    description_ru: record.description_ru,
    price: record.price,
    discount_price: record.discount_price,
    link: record.link,
    image: record.image,
    seen: record.seen || 0
  };
  newImage.value = null;
  newImagePreview.value = null;
  editModalVisible.value = true;
};

// Handle image upload
const handleBeforeUpload = (file) => {
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

  newImage.value = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    newImagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
  
  return false;
};

// Clear new image
const clearNewImage = () => {
  newImage.value = null;
  newImagePreview.value = null;
};

// Handle update
const handleUpdate = async () => {
  modalLoading.value = true;
  try {
    let imageUrl = editForm.value.image;

    // Upload new image if selected
    if (newImage.value) {
      const fileExt = newImage.value.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, newImage.value);

      if (uploadError) {
        throw new Error('Rasmni yuklashda xatolik: ' + uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      imageUrl = publicUrl;

      // Delete old image if exists
      if (oldImagePath.value) {
        try {
          const oldFileName = oldImagePath.value.split('/').pop();
          const { error: deleteError } = await supabase.storage
            .from('images')
            .remove([oldFileName]);
          
          if (deleteError) {
            console.error('Eski rasmni o\'chirishda xatolik:', deleteError);
          }
        } catch (err) {
          console.error('Eski rasm o\'chirilmadi:', err);
        }
      }
    }

    // Prepare update data
    const updateData = {
      name: editForm.value.name,
      name_ru: editForm.value.name_ru,
      description: editForm.value.description,
      description_ru: editForm.value.description_ru,
      price: Number(editForm.value.price),
      discount_price: editForm.value.discount_price ? Number(editForm.value.discount_price) : null,
      link: editForm.value.link,
      image: imageUrl,
    };

    // Update product
    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', currentProductId.value);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    message.success('Mahsulot muvaffaqiyatli yangilandi!');
    editModalVisible.value = false;
    newImage.value = null;
    newImagePreview.value = null;
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
  newImage.value = null;
  newImagePreview.value = null;
};

// Handle delete
const handleDelete = async (id) => {
  try {
    const product = products.value.find(p => p.id === id);
    
    // Delete image from storage if exists
    if (product.image) {
      try {
        const fileName = product.image.split('/').pop();
        const { error: deleteError } = await supabase.storage
          .from('images')
          .remove([fileName]);
        
        if (deleteError) {
          console.error('Storage dan o\'chirishda xatolik:', deleteError);
        }
      } catch (err) {
        console.error('Rasm o\'chirilmadi:', err);
      }
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    message.success('Mahsulot muvaffaqiyatli o\'chirildi!');
    await fetchProducts();
  } catch (error) {
    message.error('O\'chirishda xatolik: ' + error.message);
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
</style>