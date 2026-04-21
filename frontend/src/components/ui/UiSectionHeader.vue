<script setup lang="ts">
interface Props {
  title: string
  subtitle?: string
  compact?: boolean
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  compact: false,
})
</script>

<template>
  <header :class="compact ? 'space-y-1' : 'space-y-2'">
    <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Painel</p>
    <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-3xl">{{ title }}</h1>
    <p v-if="subtitle" class="text-sm text-slate-600 dark:text-slate-400 md:text-base">{{ subtitle }}</p>
  </header>
</template>
