<script setup lang="ts">
interface Props {
  open?: boolean
  label?: string
}

withDefaults(defineProps<Props>(), {
  open: false,
  label: 'Alternar menu',
})
</script>

<template>
  <button
    type="button"
    class="group rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    :aria-label="label"
  >
    <span class="relative block h-5 w-5">
      <span
        :class="[
          'absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-all duration-300',
          open ? 'translate-y-2 rotate-45' : '',
        ]"
      ></span>
      <span
        :class="[
          'absolute left-0 top-2 h-0.5 w-5 rounded-full bg-current transition-all duration-300',
          open ? 'opacity-0' : 'opacity-100',
        ]"
      ></span>
      <span
        :class="[
          'absolute left-0 top-4 h-0.5 w-5 rounded-full bg-current transition-all duration-300',
          open ? '-translate-y-2 -rotate-45' : '',
        ]"
      ></span>
    </span>
  </button>
</template>
