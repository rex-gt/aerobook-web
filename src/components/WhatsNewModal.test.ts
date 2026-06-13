import { vi, describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { nextTick } from 'vue'
import WhatsNewModal from './WhatsNewModal.vue'
import AppLayout from './AppLayout.vue'
import type { WhatsNewConfig } from '../types'
import { makeUser } from '../__tests__/helpers'

const dummyConfig: WhatsNewConfig = {
  id: 'whats-new-v1.0.0',
  enabled: true,
  title: 'Test What\'s New',
  subtitle: 'This is a test description',
  features: [
    { icon: '🚀', title: 'Feature 1', description: 'Description 1' },
    { icon: '✈️', title: 'Feature 2', description: 'Description 2' }
  ]
}

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

describe('WhatsNewModal.vue (Standalone)', () => {
  it('renders nothing when isOpen is false', () => {
    const wrapper = mount(WhatsNewModal, {
      props: {
        config: dummyConfig,
        isOpen: false
      }
    })
    expect(wrapper.find('.whatsnew-backdrop').exists()).toBe(false)
  })

  it('renders modal with content when isOpen is true', () => {
    const wrapper = mount(WhatsNewModal, {
      props: {
        config: dummyConfig,
        isOpen: true
      }
    })
    expect(wrapper.find('.whatsnew-backdrop').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test What\'s New')
    expect(wrapper.text()).toContain('This is a test description')
    expect(wrapper.text()).toContain('Feature 1')
    expect(wrapper.text()).toContain('Description 2')
  })

  it('emits close event with false when checkbox is unchecked', async () => {
    const wrapper = mount(WhatsNewModal, {
      props: {
        config: dummyConfig,
        isOpen: true
      }
    })
    await wrapper.find('.whatsnew-action-btn').trigger('click')
    expect(wrapper.emitted('close')).toBeDefined()
    expect(wrapper.emitted('close')![0]).toEqual([false])
  })

  it('emits close event with true when checkbox is checked', async () => {
    const wrapper = mount(WhatsNewModal, {
      props: {
        config: dummyConfig,
        isOpen: true
      }
    })
    await wrapper.find('#dont-show-checkbox').setValue(true)
    await wrapper.find('.whatsnew-action-btn').trigger('click')
    expect(wrapper.emitted('close')).toBeDefined()
    expect(wrapper.emitted('close')![0]).toEqual([true])
  })

  it('emits close event when clicking on backdrop backdrop', async () => {
    const wrapper = mount(WhatsNewModal, {
      props: {
        config: dummyConfig,
        isOpen: true
      }
    })
    await wrapper.find('[data-testid="whats-new-backdrop"]').trigger('click')
    expect(wrapper.emitted('close')).toBeDefined()
  })
})

describe('AppLayout.vue & WhatsNewModal Integration', () => {
  const user = makeUser({ id: 99, role: 'member' })

  function mountLayoutWithStore() {
    return mount(AppLayout, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              auth: { user, token: 'test-token', isAuthenticated: true }
            },
            stubActions: false
          })
        ],
        stubs: {
          RouterLink: true
        }
      },
      slots: {
        default: '<div class="content">Page Content</div>'
      }
    })
  }

  it('fetches whats-new config and displays modal if enabled and dates match', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          ...dummyConfig,
          startDate: '2026-06-01T00:00:00Z',
          endDate: '2026-12-31T23:59:59Z'
        })
      } as Response)
    )

    const wrapper = mountLayoutWithStore()
    
    // Allow promises to resolve and watchers to trigger
    await nextTick()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))
    await wrapper.vm.$nextTick()

    expect(fetchSpy).toHaveBeenCalledWith('/whats-new.json')
    expect(wrapper.findComponent(WhatsNewModal).exists()).toBe(true)
  })

  it('does not display modal if enabled is false', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          ...dummyConfig,
          enabled: false
        })
      } as Response)
    )

    const wrapper = mountLayoutWithStore()
    await nextTick()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.findComponent(WhatsNewModal).exists()).toBe(false)
  })

  it('does not display modal if current date is before startDate', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          ...dummyConfig,
          startDate: '2026-07-01T00:00:00Z' // Future date
        })
      } as Response)
    )

    const wrapper = mountLayoutWithStore()
    await nextTick()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.findComponent(WhatsNewModal).exists()).toBe(false)
  })

  it('does not display modal if current date is after endDate', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          ...dummyConfig,
          endDate: '2026-05-01T00:00:00Z' // Past date
        })
      } as Response)
    )

    const wrapper = mountLayoutWithStore()
    await nextTick()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(wrapper.findComponent(WhatsNewModal).exists()).toBe(false)
  })

  it('sets localStorage and sessionStorage on close when dontShowAgain is checked', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(dummyConfig)
      } as Response)
    )

    const wrapper = mountLayoutWithStore()
    await nextTick()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    const modal = wrapper.findComponent(WhatsNewModal)
    expect(modal.exists()).toBe(true)

    // Trigger close with true (Don't show again)
    modal.vm.$emit('close', true)
    await nextTick()

    expect(localStorage.getItem('whats_new_dismissed_99')).toBe('whats-new-v1.0.0')
    expect(sessionStorage.getItem('whats_new_session_dismissed_99')).toBe('whats-new-v1.0.0')
    expect(wrapper.findComponent(WhatsNewModal).exists()).toBe(false)
  })

  it('sets only sessionStorage on close when dontShowAgain is unchecked', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(dummyConfig)
      } as Response)
    )

    const wrapper = mountLayoutWithStore()
    await nextTick()
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 10))

    const modal = wrapper.findComponent(WhatsNewModal)
    expect(modal.exists()).toBe(true)

    // Trigger close with false
    modal.vm.$emit('close', false)
    await nextTick()

    expect(localStorage.getItem('whats_new_dismissed_99')).toBeNull()
    expect(sessionStorage.getItem('whats_new_session_dismissed_99')).toBe('whats-new-v1.0.0')
    expect(wrapper.findComponent(WhatsNewModal).exists()).toBe(false)
  })
})
