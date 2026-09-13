export class VisibilityDetector {
  private readonly eventName: string | null;
  public readonly isHidden: () => boolean;

  constructor() {
    if (document.hidden !== undefined) {
      this.isHidden = () => document.hidden!;
      this.eventName = 'visibilitychange';
    } else if (document.msHidden !== undefined) {
      this.isHidden = () => document.msHidden!;
      this.eventName = 'msvisibilitychange';
    } else if (document.webkitHidden !== undefined) {
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
