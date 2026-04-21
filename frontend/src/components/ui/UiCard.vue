<script setup lang="ts">
interface Props {
  elevated?: boolean
}

withDefaults(defineProps<Props>(), {
  elevated: false,
})
</script>

<template>
  <section
    :class="[
      'rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-700 dark:bg-slate-900',
      elevated ? 'shadow-lg shadow-slate-900/5 dark:shadow-black/20' : 'shadow-sm',
    ]"
  >
    <slot />
  </section>
</template>
