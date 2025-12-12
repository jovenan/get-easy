interface Category {
    id: string
    userId: string
    name: string
    type: 'expense' | 'income'
    createdAt: Date
}

interface CreateCategoryInput {
    name: string
    type: 'expense' | 'income'
}

export const useCategories = () => {
    const categories = useState<Category[]>('categories', () => [])
    const loading = useState<boolean>('categories-loading', () => false)
    const error = useState<string | null>('categories-error', () => null)

    const fetchCategories = async () => {
        loading.value = true
        error.value = null

        try {
            const data = await $fetch<Category[]>('/api/categories')
            categories.value = data
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to fetch categories'
            error.value = errorMessage
            console.error('Error fetching categories:', e)
        } finally {
            loading.value = false
        }
    }

    const createCategory = async (categoryData: CreateCategoryInput) => {
        loading.value = true
        error.value = null

        try {
            const newCategory = await $fetch<Category>('/api/categories', {
                method: 'POST',
                body: categoryData
            })

            categories.value.push(newCategory)
            return newCategory
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to create category'
            error.value = errorMessage
            console.error('Error creating category:', e)
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        categories,
        loading,
        error,
        fetchCategories,
        createCategory
    }
}
