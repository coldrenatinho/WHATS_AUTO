<script setup lang="ts">
interface Props {
  productName?: string
  version?: string
}

withDefaults(defineProps<Props>(), {
  productName: 'Norte MT Sistemas',
  version: 'v1.0',
})
</script>

<template>
  <footer class="mt-6 rounded-3xl border border-slate-200/70 bg-white/85 px-4 py-4 text-sm shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/75 md:px-6">
    <div class="flex flex-col gap-3 text-slate-600 dark:text-slate-300 md:flex-row md:items-center md:justify-between">
      <p class="font-medium">
        {{ productName }}
        <span class="mx-1 text-slate-400">•</span>
        <span class="text-xs uppercase tracking-[0.16em]">{{ version }}</span>
      </p>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Atendimento WhatsApp multi-tenant com consistencia visual, navegacao rapida e foco operacional.
      </p>
    </div>
  </footer>
</template>
