<template>
  <div v-if="isOpen" class="whatsnew-backdrop" @click.self="handleDismiss" data-testid="whats-new-backdrop">
    <div class="whatsnew-card">
      <div class="whatsnew-header">
        <div class="header-badge">🎉 WHAT'S NEW</div>
        <h2>{{ config.title }}</h2>
        <p v-if="config.subtitle" class="subtitle">{{ config.subtitle }}</p>
      </div>

      <div class="whatsnew-body">
        <div v-for="(feature, index) in config.features" :key="index" class="feature-row">
          <div class="feature-icon-container">
            <span class="feature-icon">{{ feature.icon || '✨' }}</span>
          </div>
          <div class="feature-details">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <div class="whatsnew-footer">
        <label class="checkbox-label" for="dont-show-checkbox">
          <input
            type="checkbox"
            id="dont-show-checkbox"
            v-model="dontShowAgain"
            class="hidden-checkbox"
          />
          <span class="custom-checkbox-box"></span>
          <span class="checkbox-text">Don't show this again</span>
        </label>
        <button class="btn-primary whatsnew-action-btn" @click="handleDismiss">
          Explore Now
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WhatsNewConfig } from '../types'

defineProps<{
  config: WhatsNewConfig
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close', dontShowAgain: boolean): void
}>()

const dontShowAgain = ref(false)

const handleDismiss = () => {
  emit('close', dontShowAgain.value)
}
</script>

<style scoped>
.whatsnew-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(8, 20, 35, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1.5rem;
  animation: fadeIn 0.3s ease-out;
}

.whatsnew-card {
  background: linear-gradient(135deg, rgba(12, 74, 110, 0.85) 0%, rgba(8, 47, 73, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 100%;
  max-width: 550px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1010;
  animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(30px) scale(0.96); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.whatsnew-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 2rem 1.25rem 2rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-badge {
  display: inline-block;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--sky-blue);
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(14, 165, 233, 0.25);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  letter-spacing: 0.1em;
  margin-bottom: 0.75rem;
}

.whatsnew-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--cloud-white);
  line-height: 1.25;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 0.95rem;
  color: rgba(240, 249, 255, 0.7);
  line-height: 1.5;
}

.whatsnew-body {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Custom scrollbar for webkit */
.whatsnew-body::-webkit-scrollbar {
  width: 6px;
}

.whatsnew-body::-webkit-scrollbar-track {
  background: transparent;
}

.whatsnew-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.whatsnew-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.feature-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.25s ease;
}

.feature-row:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(14, 165, 233, 0.2);
  transform: translateY(-1px);
}

.feature-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(12, 74, 110, 0.3) 100%);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 10px;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.feature-details h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--cloud-white);
  margin-bottom: 0.25rem;
}

.feature-details p {
  font-size: 0.9rem;
  color: rgba(240, 249, 255, 0.7);
  line-height: 1.45;
}

.whatsnew-footer {
  padding: 1.25rem 2rem 2rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  font-size: 0.9rem;
  color: rgba(240, 249, 255, 0.85);
  width: 100%;
}

.hidden-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.custom-checkbox-box {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-label:hover .custom-checkbox-box {
  border-color: var(--sky-blue);
  background: rgba(14, 165, 233, 0.05);
}

.hidden-checkbox:checked ~ .custom-checkbox-box {
  background: var(--sky-blue);
  border-color: var(--sky-blue);
}

.hidden-checkbox:checked ~ .custom-checkbox-box::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
}

.whatsnew-action-btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(14, 165, 233, 0.25);
}

.whatsnew-action-btn:hover {
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
}

@media (max-width: 480px) {
  .whatsnew-backdrop {
    padding: 1rem;
  }
  
  .whatsnew-header {
    padding: 1.5rem 1.25rem 1rem 1.25rem;
  }
  
  .whatsnew-header h2 {
    font-size: 1.25rem;
  }
  
  .whatsnew-body {
    padding: 1rem 1.25rem;
    gap: 1rem;
  }
  
  .feature-row {
    padding: 0.75rem;
  }
  
  .whatsnew-footer {
    padding: 1rem 1.25rem 1.5rem 1.25rem;
  }
}
</style>
