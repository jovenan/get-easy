<script setup lang="ts">
const { session, logout } = useAuth();
const logoutFunction = () => {
    logout();
}
</script>
<template>
    <div>
        <h1 class="text-2xl font-bold text-primary">Logged In</h1>
        <UButton @click="logoutFunction">Logout</UButton>
        {{ session }}
    </div>
</template>