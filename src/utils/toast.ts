type ToastType = 'success' | 'error' | 'info';

let showToastFn: ((msg: string, type?: ToastType) => void) | null = null;

export function registerToast(fn: (msg: string, type?: ToastType) => void) {
  showToastFn = fn;
}

export function toast(msg: string, type: ToastType = 'success') {
  showToastFn?.(msg, type);
}
