import * as React from 'react';
import { Button, Intent } from '@blueprintjs/core';
import { AppToaster } from '../../services/AppToaster';

type Props = {
  readonly value: string;
};

export class ClipboardControlGroup extends React.PureComponent<Props> {
  private inputRef: HTMLInputElement | null;

  private triggerCopy = () => {
    try {
      this.inputRef!.select();
      document.execCommand('copy');
      AppToaster.show({
        intent: Intent.SUCCESS,
        message: `Added \`${this.inputRef!.value}\` to clipboard`,
      });
    } catch (e) {
      console.error(e);

      AppToaster.show({
        intent: Intent.DANGER,
        message: 'Your browser does not support copy, you must copy manually',
      });
    }
  };

  private saveRef = (ref: HTMLInputElement | null) => (this.inputRef = ref);

  public render() {
    return (
      <div className="pt-control-group pt-large pt-fill">
        <input type="text" className="pt-input pt-large" value={this.props.value} readOnly ref={this.saveRef} />
        <Button iconName="clipboard" className="pt-large pt-minimal pt-fixed" onClick={this.triggerCopy} />
      </div>
    );
  }
}
