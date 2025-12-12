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

const { transactions, loading, error, fetchTransactions } = useTransactions()
const { categories, fetchCategories } = useCategories()

const isExpenseModalOpen = ref(false)
const isTransactionModalOpen = ref(false)
const selectedTransaction = ref<Transaction | null>(null)

const getCurrentMonthDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0]
    }
}

const currentMonth = getCurrentMonthDates()
const startDate = ref(currentMonth.start)
const endDate = ref(currentMonth.end)
const selectedCategoryId = ref('')

onMounted(() => {
    fetchCategories()
    fetchTransactions({
        startDate: startDate.value,
        endDate: endDate.value
    })
})

const openExpenseModal = () => {
    isExpenseModalOpen.value = true
}

const closeExpenseModal = () => {
    isExpenseModalOpen.value = false
}

const handleExpenseSuccess = () => {
    applyFilters()
}

const openTransactionModal = (transaction: Transaction) => {
    selectedTransaction.value = transaction
    isTransactionModalOpen.value = true
}

const closeTransactionModal = () => {
    isTransactionModalOpen.value = false
    selectedTransaction.value = null
}

const handleTransactionSuccess = () => {
    applyFilters()
}

const handleTransactionDelete = async (id: string) => {
    try {
        await $fetch(`/api/transactions/${id}`, {
            method: 'DELETE'
        })
        applyFilters()
    } catch (e) {
        console.error('Error deleting transaction:', e)
        alert('Failed to delete transaction')
    }
}

const applyFilters = () => {
    fetchTransactions({
        startDate: startDate.value || undefined,
        endDate: endDate.value || undefined,
        categoryId: selectedCategoryId.value || undefined
    })
}

const clearFilters = () => {
    const currentMonth = getCurrentMonthDates()
    startDate.value = currentMonth.start
    endDate.value = currentMonth.end
    selectedCategoryId.value = ''
    fetchTransactions({
        startDate: startDate.value,
        endDate: endDate.value
    })
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const getCategoryName = (categoryId: string) => {
    const category = categories.value.find(cat => cat.id === categoryId)
    return category?.name || 'Unknown'
}

const sortedTransactions = computed(() => {
    return [...transactions.value].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
})

const totalExpenses = computed(() => {
    return transactions.value
        .filter(transaction => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0)
})
</script>

<template>
    <div>
        <Header />
        <main class="container mx-auto p-6 max-w-6xl">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-bold">Dashboard</h2>
                <UButton color="error" @click="openExpenseModal">
                    Add Expense
                </UButton>
            </div>

            <div class="bg-red-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-red-200">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-red-600 uppercase tracking-wide">Total Expenses</p>
                        <p class="text-4xl font-bold text-red-700 mt-2">
                            {{ formatCurrency(totalExpenses) }}
                        </p>
                    </div>
                    <div class="text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-4 mb-6">
                <div class="flex flex-wrap gap-4 items-end">
                    <div class="flex-1 min-w-[200px]">
                        <label for="start-date" class="block text-sm font-medium mb-2">
                            Start Date
                        </label>
                        <input
                            id="start-date"
                            v-model="startDate"
                            type="date"
                            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div class="flex-1 min-w-[200px]">
                        <label for="end-date" class="block text-sm font-medium mb-2">
                            End Date
                        </label>
                        <input
                            id="end-date"
                            v-model="endDate"
                            type="date"
                            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div class="flex-1 min-w-[200px]">
                        <label for="category" class="block text-sm font-medium mb-2">
                            Category
                        </label>
                        <select
                            id="category"
                            v-model="selectedCategoryId"
                            class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            <option
                                v-for="category in categories"
                                :key="category.id"
                                :value="category.id"
                            >
                                {{ category.name }}
                            </option>
                        </select>
                    </div>
                    <div class="flex gap-2">
                        <UButton color="primary" @click="applyFilters">
                            Apply
                        </UButton>
                        <UButton color="neutral" @click="clearFilters">
                            Clear
                        </UButton>
                    </div>
                </div>
            </div>

            <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {{ error }}
            </div>

            <div v-if="loading && transactions.length === 0" class="text-center py-8">
                <p class="text-gray-500">Loading transactions...</p>
            </div>

            <div v-else-if="transactions.length === 0" class="text-center py-12">
                <p class="text-gray-500 text-lg mb-4">No transactions yet</p>
                <p class="text-gray-400">Start by adding your first expense!</p>
            </div>

            <div v-else class="bg-white rounded-lg shadow overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr
                            v-for="transaction in sortedTransactions"
                            :key="transaction.id"
                            class="hover:bg-gray-50 cursor-pointer"
                            @click="openTransactionModal(transaction)"
                        >
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {{ formatDate(transaction.date) }}
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-900">
                                {{ transaction.description }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {{ getCategoryName(transaction.categoryId) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                    :class="transaction.type === 'expense'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-green-100 text-green-800'"
                                >
                                    {{ transaction.type === 'expense' ? 'Expense' : 'Income' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold"
                                :class="transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'"
                            >
                                {{ transaction.type === 'expense' ? '-' : '+' }}{{ formatCurrency(transaction.amount) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>

        <ExpenseModal
            :is-open="isExpenseModalOpen"
            @close="closeExpenseModal"
            @success="handleExpenseSuccess"
        />

        <TransactionModal
            :is-open="isTransactionModalOpen"
            :transaction="selectedTransaction"
            @close="closeTransactionModal"
            @success="handleTransactionSuccess"
            @delete="handleTransactionDelete"
        />
    </div>
</template>