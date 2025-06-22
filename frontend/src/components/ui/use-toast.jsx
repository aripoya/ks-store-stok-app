// Adapted from shadcn/ui toast component
import { toast as sonnerToast } from "sonner"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

export const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map()

export function useToast() {
  return {
    toast: ({ title, description, ...props }) => {
      const id = genId()
      
      sonnerToast(title, {
        description,
        id,
        ...props,
      })
      
      return id
    },
    dismiss: (toastId) => {
      sonnerToast.dismiss(toastId)
    },
  }
}

export { useToast as default }
