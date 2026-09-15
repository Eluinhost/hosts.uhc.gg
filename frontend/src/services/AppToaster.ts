import { Position, OverlayToaster, type ToastProps } from '@blueprintjs/core';

const toaster = OverlayToaster.create({
  position: Position.TOP,
});

export const showToast = async (options: ToastProps) => (await toaster).show(options);
