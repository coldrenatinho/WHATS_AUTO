<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient'
  hover?: boolean
  padding?: 'none' | 'sm' | 'base' | 'lg' | 'xl'
  radius?: 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  gradient?: 'primary' | 'secondary' | 'accent' | 'brand' | 'ocean' | 'sunset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hover: false,
  padding: 'lg',
  radius: 'xl',
  gradient: 'primary'
})

const cardClasses = computed(() => {
  const classes = ['nm-card']
  
  // Variant
  classes.push(`nm-card--${props.variant}`)
  
  // Hover effect
  if (props.hover) {
    classes.push('nm-card--hover')
  }
  
  // Padding
  classes.push(`nm-card--padding-${props.padding}`)
  
  // Radius
  classes.push(`nm-card--radius-${props.radius}`)
  
  // Gradient type
  if (props.variant === 'gradient') {
    classes.push(`nm-card--gradient-${props.gradient}`)
  }
  
  return classes.join(' ')
})
</script>

<template>
  <div :class="cardClasses">
    <slot />
  </div>
</template>

<style scoped>
.nm-card {
  position: relative;
  transition: all var(--duration-normal) var(--ease-out);
}

/* Variants */
.nm-card--default {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.nm-card--elevated {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}

.nm-card--glass {
  background: var(--glass-background);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
}

.nm-card--gradient {
  background: var(--gradient-primary);
  color: white;
  border: none;
  box-shadow: var(--shadow-primary);
}

.nm-card--gradient-primary {
  background: var(--gradient-primary);
  box-shadow: var(--shadow-primary);
}

.nm-card--gradient-secondary {
  background: var(--gradient-secondary);
  box-shadow: var(--shadow-secondary);
}

.nm-card--gradient-accent {
  background: var(--gradient-accent);
  box-shadow: var(--shadow-accent);
}

.nm-card--gradient-brand {
  background: var(--gradient-brand);
}

.nm-card--gradient-ocean {
  background: var(--gradient-ocean);
}

.nm-card--gradient-sunset {
  background: var(--gradient-sunset);
}

/* Hover Effect */
.nm-card--hover {
  cursor: pointer;
}

.nm-card--hover:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.nm-card--hover:active {
  transform: translateY(-2px);
}

/* Padding */
.nm-card--padding-none {
  padding: 0;
}

.nm-card--padding-sm {
  padding: var(--space-4);
}

.nm-card--padding-base {
  padding: var(--space-6);
}

.nm-card--padding-lg {
  padding: var(--space-8);
}

.nm-card--padding-xl {
  padding: var(--space-12);
}

/* Radius */
.nm-card--radius-sm {
  border-radius: var(--radius-sm);
}

.nm-card--radius-base {
  border-radius: var(--radius-base);
}

.nm-card--radius-lg {
  border-radius: var(--radius-lg);
}

.nm-card--radius-xl {
  border-radius: var(--radius-xl);
}

.nm-card--radius-2xl {
  border-radius: var(--radius-2xl);
}
</style>
