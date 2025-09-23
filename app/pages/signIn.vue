<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters')),
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
    const { signInWithEmail } = useAuth()
    try {
        const session = await signInWithEmail({ email: event.data.email, password: event.data.password })
        if (session.error) {
            toast.add({ title: 'Error', description: session.error.message, color: 'error' })
            return
        }
        if (session.data) {
          console.log(session.data)
            toast.add({ title: 'Success', description: 'The account has been signed in.', color: 'success' })
            setTimeout(() => {
                return navigateTo('/')
            }, 1000);
        }
    } catch (error) {
        toast.add({ title: 'Error', description: 'An error occurred.', color: 'error' })
    }
}
</script>

<template>
  <div class="flex flex-col justify-center items-center gap-4 h-screen">
    <h1 class="text-2xl font-bold">Sign In</h1>
    <UForm :schema="schema" :state="state" class="space-y-4 border-[0.5px] border-gray-300 rounded-2xl p-4 w-[300px]" @submit="onSubmit">
        <UFormField label="Email" name="email">
            <UInput v-model="state.email" class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
            <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>

        <UButton type="submit" class="w-full justify-center" :disabled="state.email === '' || state.password === ''">
            Sign in
        </UButton>
    </UForm>
    <p class="text-sm text-gray-500">Don't have an account? <NuxtLink to="/signup" class="text-blue-500">Sign up</NuxtLink></p>
  </div>
</template>

