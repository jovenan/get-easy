<script setup lang="ts">
const { user, logout } = useAuth()

const handleLogout = () => {
    logout()
}
</script>

<template>
    <header class="bg-white shadow-sm">
        <div class="container mx-auto px-4 py-3">
            <div class="flex justify-between items-center">
                <nav class="flex gap-2">
                    <UButton size="sm" to="/">Home</UButton>
                    <UButton size="sm" to="/categories">Categories</UButton>
                </nav>
                <div class="flex gap-3 items-center">
                    <h1 class="text-lg font-bold">Welcome {{ user?.name }}!</h1>
                    <UButton size="sm" color="error" @click="handleLogout">Logout</UButton>
                </div>
            </div>
        </div>
    </header>
</template>
