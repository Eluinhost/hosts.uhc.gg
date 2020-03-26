import { isUndefined } from 'util';

export class VisibilityDetector {
  private readonly eventName: string | null;
  public readonly isHidden: () => boolean;

  constructor() {
    if (!isUndefined(document.hidden)) {
      this.isHidden = () => document.hidden!;
      this.eventName = 'visibilitychange';
    } else if (!isUndefined(document.msHidden)) {
      this.isHidden = () => document.msHidden!;
      this.eventName = 'msvisibilitychange';
    } else if (!isUndefined(document.webkitHidden)) {
      this.isHidden = () => document.webkitHidden!;
      this.eventName = 'webkitvisibilitychange';
    } else {
      this.isHidden = () => false;
      this.eventName = null;
    }
  }

  get isSupported() {
    return this.eventName !== null;
  }

  public addEventListener(listener: EventListenerOrEventListenerObject, useCapture?: boolean) {
    if (this.eventName) {
      window.addEventListener(this.eventName, listener, useCapture);
    }
  }

  public removeEventListener(listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
    if (this.eventName) {
      window.removeEventListener(this.eventName, listener, options);
    }
  }
}
