<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters')),
  confirmPassword: v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters')),
  name: v.pipe(v.string(), v.minLength(3, 'Must be at least 3 characters'))
})

type Schema = v.InferOutput<typeof schema>

const state = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  name: ''
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (event.data.password !== event.data.confirmPassword) {
        toast.add({ title: 'Error', description: 'Passwords do not match.', color: 'error' })
        return
    }
    
    const { signUpWithEmail } = useAuth()
    try {
        const session = await signUpWithEmail({ name: event.data.name, email: event.data.email, password: event.data.password })
        if (session.error) {
            toast.add({ title: 'Error', description: session.error.message, color: 'error' })
            return
        }
        if (session.data) {
            toast.add({ title: 'Success', description: 'The account has been created.', color: 'success' })
            setTimeout(() => {
                return navigateTo('/signin')
            }, 1000);
        }
    } catch (error) {
        toast.add({ title: 'Error', description: 'An error occurred.', color: 'error' })
    }
}
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 h-screen">
    <h1 class="text-2xl font-bold">Sign Up</h1>
    <UForm :schema="schema" :state="state" class="space-y-4 border-[0.5px] border-gray-300 rounded-2xl p-4 w-[300px]" @submit="onSubmit">
        <UFormField label="Name" name="name">
            <UInput v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField label="Email" name="email">
            <UInput v-model="state.email" class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
            <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>

        <UFormField label="Confirm Password" name="confirmPassword">
            <UInput v-model="state.confirmPassword" type="password" class="w-full" />
        </UFormField>

        <UButton type="submit" class="w-full justify-center" :disabled="state.name === '' || state.email === '' || state.password === '' || state.confirmPassword === ''">
            Sign Up
        </UButton>
    </UForm>
    <p class="text-sm text-gray-500">Already have an account? <NuxtLink to="/signin" class="text-blue-500">Sign in</NuxtLink></p>
  </div>
</template>

