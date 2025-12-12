<script setup lang="ts">
interface Transaction {
    id: string
    userId: string
    categoryId: string
    type: 'expense' | 'income'
    amount: number
    description: string
    date: Date
}

const props = defineProps<{
    isOpen: boolean
    transaction: Transaction | null
}>()

const emit = defineEmits<{
    close: []
    success: []
    delete: [id: string]
}>()

const { categories } = useCategories()

const isModalOpen = computed({
    get: () => props.isOpen,
    set: (value: boolean) => {
        if (!value) emit('close')
    }
})

const form = ref({
    categoryId: '',
    type: 'expense' as 'expense' | 'income',
    amount: 0,
    description: '',
    date: ''
})

const loading = ref(false)
const error = ref<string | null>(null)

watch(() => props.transaction, (transaction) => {
    if (transaction) {
        const dateStr = new Date(transaction.date).toISOString().split('T')[0]
        form.value = {
            categoryId: transaction.categoryId,
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            date: dateStr || ''
        }
    }
}, { immediate: true })

const handleSubmit = async () => {
    if (!props.transaction) return

    loading.value = true
    error.value = null

    try {
        await $fetch(`/api/transactions/${props.transaction.id}`, {
            method: 'PUT',
            body: {
                categoryId: form.value.categoryId,
                type: form.value.type,
                amount: form.value.amount,
                description: form.value.description,
                date: new Date(form.value.date).toISOString()
            }
        })

        emit('success')
        emit('close')
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to update transaction'
        console.error('Error updating transaction:', e)
    } finally {
        loading.value = false
    }
}

const handleDelete = () => {
    if (props.transaction && confirm('Are you sure you want to delete this transaction?')) {
        emit('delete', props.transaction.id)
        emit('close')
    }
}
</script>

<template>
    <UModal v-model:open="isModalOpen">
        <template #content>
            <div class="p-6">
                <h3 class="text-2xl font-bold mb-6">Transaction Details</h3>

                <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {{ error }}
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div>
                        <label for="category" class="block text-sm font-medium mb-2">
                            Category
                        </label>
                        <select
                            id="category"
                            v-model="form.categoryId"
                            required
                            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="" disabled>Select a category</option>
                            <option
                                v-for="category in categories"
                                :key="category.id"
                                :value="category.id"
                            >
                                {{ category.name }}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label for="type" class="block text-sm font-medium mb-2">
                            Type
                        </label>
                        <select
                            id="type"
                            v-model="form.type"
                            required
                            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                    </div>

                    <div>
                        <label for="amount" class="block text-sm font-medium mb-2">
                            Amount
                        </label>
                        <input
                            id="amount"
                            v-model.number="form.amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label for="description" class="block text-sm font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            v-model="form.description"
                            required
                            rows="3"
                            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label for="date" class="block text-sm font-medium mb-2">
                            Date
                        </label>
                        <input
                            id="date"
                            v-model="form.date"
                            type="date"
                            required
                            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div class="flex gap-2 pt-4 justify-end">
                        <UButton
                            type="submit"
                            color="primary"
                            :disabled="loading"
                        >
                            {{ loading ? 'Saving...' : 'Save Changes' }}
                        </UButton>
                        <UButton
                            type="button"
                            color="error"
                            @click="handleDelete"
                            :disabled="loading"
                        >
                            Delete
                        </UButton>
                        <UButton
                            type="button"
                            color="neutral"
                            @click="emit('close')"
                            :disabled="loading"
                        >
                            Cancel
                        </UButton>
                    </div>
                </form>
            </div>
        </template>
    </UModal>
</template>
