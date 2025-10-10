import { toast } from "sonner";

export function showSuccessToast(message: string) {
  toast.success(message, {
    duration: 3000,
    style: {
      fontWeight: 300,
    },
  });
}

export function showErrorToast(message: string, retry?: () => void) {
  toast.error(message, {
    duration: 5000,
    style: {
      fontWeight: 300,
    },
    action: retry ? {
      label: "Tentar novamente",
      onClick: retry,
    } : undefined,
  });
}

export function showWarningToast(message: string) {
  toast.warning(message, {
    duration: 4000,
    style: {
      fontWeight: 300,
    },
  });
}

export function showInfoToast(message: string) {
  toast.info(message, {
    duration: 3000,
    style: {
      fontWeight: 300,
    },
  });
}
