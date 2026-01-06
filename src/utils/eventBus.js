import { ref } from 'vue'

// Simple event bus for cross-component communication
const listeners = new Map()

export function useEventBus() {
  function emit(event, payload) {
    const callbacks = listeners.get(event)
    if (callbacks) {
      callbacks.forEach(cb => cb(payload))
    }
  }

  function on(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, new Set())
    }
    listeners.get(event).add(callback)
  }

  function off(event, callback) {
    const callbacks = listeners.get(event)
    if (callbacks) {
      callbacks.delete(callback)
    }
  }

  return { emit, on, off }
}

// Export a singleton instance for convenience
export const eventBus = useEventBus()

