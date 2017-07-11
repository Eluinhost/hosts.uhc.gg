declare interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: (a: object) => Function;
}

type ReactDatePickerProps = {
  autoComplete?: string;
  autoFocus?: boolean;
  calendarClassName?: string;
  className?: string;
  customInput?: React.ReactNode;
  dateFormat?: string | string[];
  dateFormatCalendar?: string;
  disabled?: boolean;
  disabledKeyboardNavigation?: boolean;
  dropdownMode?: string;
  endDate?: moment.Moment;
  excludeDates?: any[];

  filterDate?(): any;

  fixedHeight?: boolean;
  forceShowMonthNavigation?: boolean;
  highlightDates?: any[];
  id?: string;
  includeDates?: any[];
  inline?: boolean;
  isClearable?: boolean;
  locale?: string;
  maxDate?: moment.Moment;
  minDate?: moment.Moment;
  monthsShown?: number;
  name?: string;

  onBlur?(event: React.FocusEvent<HTMLInputElement>): void;

  onChange(date: moment.Moment | null, event: React.SyntheticEvent<any> | undefined): any;

  onChangeRaw?(event: React.FocusEvent<HTMLInputElement>): void;

  onClickOutside?(event: React.MouseEvent<HTMLDivElement>): void;

  onFocus?(event: React.FocusEvent<HTMLInputElement>): void;

  onMonthChange?(date: moment.Moment): void;

  openToDate?: moment.Moment;
  peekNextMonth?: boolean;
  placeholderText?: string;
  popoverAttachment?: string;
  popoverTargetAttachment?: string;
  popoverTargetOffset?: string;
  readOnly?: boolean;
  renderCalendarTo?: any;
  required?: boolean;
  scrollableYearDropdown?: boolean;
  selected?: moment.Moment | null;
  selectsEnd?: boolean;
  selectsStart?: boolean;
  showMonthDropdown?: boolean;
  showWeekNumbers?: boolean;
  showYearDropdown?: boolean;
  startDate?: moment.Moment;
  tabIndex?: number;
  tetherConstraints?: any[];
  title?: string;
  todayButton?: string;
  utcOffset?: number;
  value?: string;
  withPortal?: boolean;
};

declare module 'react-datepicker' {
  interface ReactDatePicker extends React.SFC<ReactDatePickerProps>{}

  const value: ReactDatePicker;
  export = value;
}

type RcTimePickerProps = {
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

declare module 'rc-time-picker' {
  interface RcTimePicker extends React.SFC<RcTimePickerProps>{}

  const value: RcTimePicker;
  export = value;
}

declare module 'snuownd' {
  type SnuOwndParser = {
    readonly render(markdown: string): string;
  };

  type SnuOwnd = {
    readonly getParser(): SnuOwndParser;
  };

  const value: SnuOwnd;
  export = value;
}

interface PromiseConstructor
{
  all<T1, T2>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): Promise<[T1, T2]>;
  all<T1, T2, T3>(values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): Promise<[T1, T2, T3]>;
  all<T1, T2, T3, T4>(
    values: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseList<T4>],
  ): Promise<[T1, T2, T3, T4]>;
}
