import * as React from "react"
import { useWebHaptics as useWebHapticsOriginal } from "web-haptics/react"

export function useHaptics(options?: {
  debug?: boolean
  showSwitch?: boolean
}) {
  const { trigger, cancel, isSupported } = useWebHapticsOriginal(options)

  const haptic = React.useCallback(
    async (
      type?:
        | "light"
        | "medium"
        | "heavy"
        | "success"
        | "warning"
        | "error"
        | "selection"
        | number
        | number[]
    ) => {
      if (isSupported) {
        await trigger(type ?? "medium")
      }
    },
    [trigger, isSupported]
  )

  return {
    haptic,
    cancel,
    isSupported,
  }
}