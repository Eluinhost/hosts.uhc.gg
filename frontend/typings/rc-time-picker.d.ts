declare module 'rc-time-picker' {
  import * as moment from 'moment';
  import * as React from 'react';

  export type RcTimePickerProps = {
    prefixCls?: string;
    clearText?: string;
    disabled?: boolean;
    allowEmpty?: boolean;
    open?: boolean;
    defaultValue?: moment.Moment;
    defaultOpenValue?: moment.Moment;
    value?: moment.Moment;
    placeholder?: string;
    className?: string;
    popupClassName?: string;
    showHour?: boolean;
    showMinute?: boolean;
    showSecond?: boolean;
    format?: string;
    disabledHours?(): number[];
    disabledMinutes?(hour: number): number[];
    disabledSeconds?(hour: number, minute: number): number[];
    use12Hours?: boolean;
    hideDisabledOptions?: boolean;
    onChange?(date: moment.Moment): any;
    addon?: Function;
    placement?: 'left' | 'right' | 'top' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    transitionName?: string;
    name?: string;
    onOpen?({ open }: { open: boolean }): any;
    onClose?({ open }: { open: boolean }): any;
    style?: React.CSSProperties;
  };

  const value: React.SFC<RcTimePickerProps>;
  export default value;
}
