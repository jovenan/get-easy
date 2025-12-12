<script setup lang="ts">
const { categories, loading, error, fetchCategories, createCategory } = useCategories()

const formData = ref({
    name: '',
    type: 'expense' as 'expense' | 'income'
})

const formError = ref<string | null>(null)

onMounted(() => {
    fetchCategories()
})

const handleSubmit = async () => {
    if (!formData.value.name.trim()) {
        formError.value = 'Name is required'
        return
    }

    try {
        await createCategory({
            name: formData.value.name,
            type: formData.value.type
        })

        formData.value.name = ''
        formData.value.type = 'expense'
        formError.value = null
    } catch (e) {
        formError.value = e instanceof Error ? e.message : 'Failed to create category'
    }
}

const expenseCategories = computed(() =>
    categories.value.filter(cat => cat.type === 'expense')
)

const incomeCategories = computed(() =>
    categories.value.filter(cat => cat.type === 'income')
)
</script>

<template>
    <div>
        <Header />
        <div class="container mx-auto p-6 max-w-4xl">
            <h1 class="text-3xl font-bold mb-8">Categories</h1>
        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-semibold mb-4">Create New Category</h2>
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label for="name" class="block text-sm font-medium mb-2">
                        Name
                    </label>
                    <input
                        id="name"
                        v-model="formData.name"
                        type="text"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter category name"
                    />
                </div>
                <div>
                    <label for="type" class="block text-sm font-medium mb-2">
                        Type
                    </label>
                    <select
                        id="type"
                        v-model="formData.type"
                        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>

                <div v-if="formError" class="text-red-500 text-sm">
                    {{ formError }}
                </div>

                <button
                    type="submit"
                    :disabled="loading"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {{ loading ? 'Creating...' : 'Create Category' }}
                </button>
            </form>
        </div>

        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ error }}
        </div>

        <div class="space-y-6">
            <div>
                <h2 class="text-2xl font-semibold mb-4 text-red-600">
                    Expense Categories
                </h2>
                <div v-if="expenseCategories.length === 0" class="text-gray-500">
                    No expense categories yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                        v-for="category in expenseCategories"
                        :key="category.id"
                        class="bg-white rounded-lg shadow p-4 border-l-4 border-red-500"
                    >
                        <h3 class="font-semibold text-lg">{{ category.name }}</h3>
                        <p class="text-sm text-gray-500 mt-1">
                            Created: {{ new Date(category.createdAt).toLocaleDateString() }}
                        </p>
                    </div>
                </div>
            </div>

            <div>
                <h2 class="text-2xl font-semibold mb-4 text-green-600">
                    Income Categories
                </h2>
                <div v-if="incomeCategories.length === 0" class="text-gray-500">
                    No income categories yet
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                        v-for="category in incomeCategories"
                        :key="category.id"
                        class="bg-white rounded-lg shadow p-4 border-l-4 border-green-500"
                    >
                        <h3 class="font-semibold text-lg">{{ category.name }}</h3>
                        <p class="text-sm text-gray-500 mt-1">
                            Created: {{ new Date(category.createdAt).toLocaleDateString() }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </div>
</template>