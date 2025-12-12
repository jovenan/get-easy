<script setup lang="ts">
interface Category {
    id: string
    name: string
    type: string
}

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits<{
    close: []
    success: []
}>()

const formData = ref({
    categoryId: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
})

const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const expenseCategories = computed(() =>
    categories.value.filter(cat => cat.type === 'expense')
)

const isModalOpen = computed({
    get: () => props.isOpen,
    set: (value: boolean) => {
        if (!value) emit('close')
    }
})

const fetchCategories = async () => {
    try {
        const data = await $fetch<Category[]>('/api/categories')
        categories.value = data
    } catch (e) {
        console.error('Error fetching categories:', e)
        error.value = 'Failed to load categories'
    }
}

const handleSubmit = async () => {
    if (!formData.value.categoryId || !formData.value.description || formData.value.amount <= 0) {
        error.value = 'Please fill all fields'
        return
    }

    loading.value = true
    error.value = null

    try {
        await $fetch('/api/transactions', {
            method: 'POST',
            body: {
                categoryId: formData.value.categoryId,
                type: 'expense',
                amount: formData.value.amount,
                description: formData.value.description,
                date: formData.value.date ? new Date(formData.value.date).toISOString() : new Date().toISOString()
            }
        })

        formData.value = {
            categoryId: '',
            amount: 0,
            description: '',
            date: new Date().toISOString().split('T')[0]
        }

        emit('success')
        emit('close')
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to create expense'
    } finally {
        loading.value = false
    }
}

watch(() => props.isOpen, (newValue) => {
    if (newValue) {
        fetchCategories()
    }
})
</script>

<template>
    <UModal v-model:open="isModalOpen">
        <template #content>
            <div class="p-6">
                <h3 class="text-xl font-semibold mb-6">Add Expense</h3>

                <div class="space-y-4">
                <div>
                    <label for="category" class="block text-sm font-medium mb-2">
                        Category
                    </label>
                    <select
                        id="category"
                        v-model="formData.categoryId"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select a category</option>
                        <option v-for="category in expenseCategories" :key="category.id" :value="category.id">
                            {{ category.name }}
                        </option>
                    </select>
                </div>

                <div>
                    <label for="amount" class="block text-sm font-medium mb-2">
                        Amount
                    </label>
                    <input
                        id="amount"
                        v-model.number="formData.amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        required
                    />
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        v-model="formData.description"
                        rows="3"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter description"
                        required
                    ></textarea>
                </div>

                <div>
                    <label for="date" class="block text-sm font-medium mb-2">
                        Date
                    </label>
                    <input
                        id="date"
                        v-model="formData.date"
                        type="date"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div v-if="error" class="text-red-500 text-sm">
                    {{ error }}
                </div>
                </div>

                <div class="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <UButton color="neutral" @click="emit('close')">Cancel</UButton>
                    <UButton
                        color="error"
                        :loading="loading"
                        @click="handleSubmit"
                    >
                        Add Expense
                    </UButton>
                </div>
            </div>
        </template>
    </UModal>
</template>
