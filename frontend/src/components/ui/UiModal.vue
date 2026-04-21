<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'

interface Props {
  open: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  size: 'md',
  closeOnOverlay: true,
})

const emit = defineEmits<{
  close: []
}>()

const close = () => emit('close')

watch(
  () => props.open,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

const panelSizeClass = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
}

const onOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="ui-modal-fade">
      <div v-if="open" class="fixed inset-0 z-[80]">
        <div class="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]" @click="onOverlayClick"></div>

        <div class="relative flex min-h-full items-center justify-center px-4 py-8">
          <Transition name="ui-modal-scale">
            <section
              v-if="open"
              :class="[
                'w-full rounded-3xl border border-white/20 bg-white p-5 shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900 sm:p-7',
                panelSizeClass[size],
              ]"
              role="dialog"
              aria-modal="true"
              :aria-label="title || 'Modal de interface'"
            >
              <header class="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 v-if="title" class="text-xl font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h2>
                  <p v-if="description" class="mt-1 text-sm text-slate-600 dark:text-slate-400">{{ description }}</p>
                </div>
                <button
                  type="button"
                  class="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Fechar modal"
                  @click="close"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </header>

              <div>
                <slot />
              </div>

              <footer v-if="$slots.footer" class="mt-6 flex justify-end gap-2">
                <slot name="footer" />
              </footer>
            </section>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
