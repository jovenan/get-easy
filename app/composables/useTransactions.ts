interface Transaction {
    id: string
    userId: string
    categoryId: string
    type: 'expense' | 'income'
    amount: number
    description: string
    date: Date
}

interface TransactionFilters {
    startDate?: string
    endDate?: string
    categoryId?: string
}

export const useTransactions = () => {
    const transactions = useState<Transaction[]>('transactions', () => [])
    const loading = useState<boolean>('transactions-loading', () => false)
    const error = useState<string | null>('transactions-error', () => null)

    const fetchTransactions = async (filters?: TransactionFilters) => {
        loading.value = true
        error.value = null

        try {
            const params = new URLSearchParams()
            if (filters?.startDate) {
                params.append('startDate', filters.startDate)
            }
            if (filters?.endDate) {
                params.append('endDate', filters.endDate)
            }
            if (filters?.categoryId) {
                params.append('categoryId', filters.categoryId)
            }

            const url = `/api/transactions${params.toString() ? `?${params.toString()}` : ''}`
            const data = await $fetch<Transaction[]>(url)
            transactions.value = data
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to fetch transactions'
            error.value = errorMessage
            console.error('Error fetching transactions:', e)
        } finally {
            loading.value = false
        }
    }

    return {
        transactions,
        loading,
        error,
        fetchTransactions
    }
}
