
import { usePostHog } from 'posthog-js/react'

export const useAnalytics = () => {
  const posthog = usePostHog()

  const captureEvent = (eventName: string, properties?: Record<string, any>) => {
    posthog?.capture(eventName, properties)
  }

  const identifyUser = (userId: string, properties?: Record<string, any>) => {
    posthog?.identify(userId, properties)
  }

  return {
    posthog,
    captureEvent,
    identifyUser
  }
}
