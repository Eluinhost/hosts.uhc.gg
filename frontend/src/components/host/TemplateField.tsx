import {
  Alert,
  Blockquote,
  Button,
  ButtonGroup,
  Callout,
  Classes,
  Dialog,
  H5,
  HTMLTable,
  InputGroup,
  Intent,
  Menu,
  MenuDivider,
  MenuItem,
  PopoverNext,
  TextArea,
} from '@blueprintjs/core';
import {
  ArrowCounterClockwiseIcon,
  BookmarkIcon,
  BoxArrowDownIcon,
  BoxArrowUpIcon,
  CaretDownIcon,
  CaretUpIcon,
  FloppyDiskIcon,
  InfoIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { FieldWithValue } from '@tanstack/react-form';
import { useAtom } from 'jotai';
import * as Mark from 'markup-js';
import React, { useCallback, useState } from 'react';

import { presetsAtom } from '../../atoms/presets';
import type { Dayjs } from '../../dayjs';
import type { CreateMatchData } from '../../models/CreateMatchData';
import { Markdown } from '../Markdown';

import { defaultPreset } from './defaultPreset';

import './TemplateField.sass';

export type TemplateContext = CreateMatchData & { author: string };

export type TemplateFieldProps = {
  field: FieldWithValue<string>;
  disabled?: boolean;
  className?: string;
  context: TemplateContext;
};

export const renderToMarkdown = (template: string, context: TemplateContext): string =>
  Mark.up(template, context, {
    pipes: {
      date: (date: Dayjs, format: string): string => date.utc().format(format),
    },
  });

const samples = [
  ['{{author}}', 'The creator of the post (you!)'],
  ['{{hostingName}}', 'Any hosting name override'],
  ['{{tournament}}', 'Is a tournament?'],
  ['{{opens}}', 'When the match opens, default formatting'],
  [
    '{{opens|date>MMM Do HH:mm z}}',
    'Use `|opens>FORMAT` to specify a custom format, see https://day.js.org/docs/en/display/format',
  ],
  ['{{address}}', 'The address of the server'],
  ['{{ip}}', 'The direct IP of the server'],
  ['{{address|blank>`ip`}}', 'Use the address, if it is blank use the IP instead'],
  ['{{scenarios|join>, }}', 'List of scenarios, comma separated'],
  ['{{tags|join>, }}', 'List of tags, comma separated'],
  ['{{teams}}', 'Full rendered team style'],
  ['{{size}}', 'The size of the teams'],
  ['{{customStyle}}', 'Any custom defined style'],
  ['{{count}}', 'Game counter'],
  ['{{region}}', 'The region the server is in'],
  ['{{location}}', 'The location of the server'],
  ['{{version}}', 'The version of the server'],
  ['{{slots}}', 'How many slots the server has'],
  ['{{length}}', 'The length of the game'],
  ['{{mapSize}}', 'Map dimensions'],
  ['{{pvpEnabledAt}}', 'When PVP turns on'],
];

const renderSamples = (context: TemplateContext): React.ReactElement[] =>
  samples.map((sample, index) => (
    <tr key={index}>
      <td className={Classes.MONOSPACE_TEXT}>{sample[0]}</td>
      <td>{sample[1]}</td>
      <td>{Mark.up(sample[0], context)}</td>
    </tr>
  ));

const HelpTab: React.FC<{ context: TemplateContext }> = ({ context }) => (
  <Callout intent={Intent.PRIMARY}>
    <H5>Template information</H5>
    <div>
      <span>Templates can use Markdown as well as </span>
      <a href="https://github.com/adammark/Markup.js/blob/master/README.md" target="_blank" rel="noopener noreferrer">
        Markup Templating
      </a>
      <span> for generating content. Here are some template examples and what they would output:</span>
    </div>
    <HTMLTable bordered striped>
      <thead>
        <tr>
          <th>Example</th>
          <th>Description</th>
          <th>Output</th>
        </tr>
      </thead>
      <tbody>{renderSamples(context)}</tbody>
    </HTMLTable>
  </Callout>
);

export const TemplateField: React.FunctionComponent<TemplateFieldProps> = ({ disabled, context, field }) => {
  const [localPresets, setLocalPresets] = useAtom(presetsAtom);
  const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
  const [isShowingImportPopover, setIsShowingImportPopover] = useState(false);
  const [isShowingHelpPopover, setIsShowingHelpPopover] = useState(false);
  const [exportContent, setExportContent] = useState<string | null>(null);
  const [importText, setImportText] = useState('');

  const overwrite = useCallback(
    (name: string) => {
      if (window.confirm(`Overwrite existing preset "${name}"?`)) {
        setLocalPresets(prev => ({
          ...prev,
          [name]: field.value,
        }));
      }
    },
    [field.value, setLocalPresets],
  );

  const onSaveCurrentAsPreset = useCallback((): void => {
    if (typeof window === 'undefined') return;

    const name = window.prompt('Preset name');

    if (!name) return;

    const trimmed = name.trim();

    if (trimmed in localPresets && !window.confirm(`Preset "${trimmed}" already exists. Overwrite it?`)) return;

    setLocalPresets(prev => ({
      ...prev,
      [trimmed]: field.value,
    }));
  }, [field, setLocalPresets, localPresets]);

  const onDeleteLocalPreset = useCallback(
    (presetName: string): void => {
      if (typeof window === 'undefined') return;

      if (!window.confirm(`Remove preset "${presetName}"?`)) return;

      setLocalPresets(prev => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== presetName)));
    },
    [setLocalPresets],
  );

  const saved = Object.entries(localPresets);

  return (
    <div className="template-field">
      <div className="presets-bar">
        <ButtonGroup size="large">
          <PopoverNext
            onClose={() => {
              setIsPresetMenuOpen(false);
            }}
            isOpen={isPresetMenuOpen}
            content={
              <Menu size="large">
                <MenuDivider title={saved.length === 0 ? 'No saved presets' : 'Saved Presets'} />
                {saved.map(([name, template]) => (
                  <MenuItem
                    key={name}
                    text={name}
                    onClick={() => {
                      field.handleChange(template);
                    }}
                  >
                    <MenuItem
                      text="Apply"
                      icon={<PlusIcon />}
                      onClick={() => {
                        field.handleChange(template);
                      }}
                    />
                    <MenuItem
                      text="Export"
                      icon={<BoxArrowUpIcon />}
                      onClick={() => {
                        setExportContent(template);
                      }}
                    />
                    <MenuItem
                      text="Delete"
                      icon={<TrashIcon />}
                      onClick={() => {
                        onDeleteLocalPreset(name);
                      }}
                    />
                    <MenuItem
                      text="Overwrite"
                      icon={<FloppyDiskIcon />}
                      onClick={() => {
                        overwrite(name);
                      }}
                    />
                  </MenuItem>
                ))}
                <MenuDivider />
                <MenuItem
                  text="Save as new preset"
                  icon={<FloppyDiskIcon />}
                  onClick={() => {
                    onSaveCurrentAsPreset();
                  }}
                />
                <MenuItem
                  text="Import Preset"
                  icon={<BoxArrowDownIcon />}
                  onClick={() => {
                    setIsShowingImportPopover(true);
                  }}
                />
                <MenuItem
                  icon={<ArrowCounterClockwiseIcon />}
                  text="Reset to Default"
                  onClick={() => {
                    field.handleChange(defaultPreset);
                  }}
                />
              </Menu>
            }
            placement="bottom"
            arrow={false}
          >
            <Button
              icon={<BookmarkIcon />}
              endIcon={isPresetMenuOpen ? <CaretUpIcon /> : <CaretDownIcon />}
              onClick={() => {
                setIsPresetMenuOpen(prev => !prev);
              }}
            >
              Presets
            </Button>
          </PopoverNext>
          <Button
            size="large"
            icon={<InfoIcon />}
            onClick={() => {
              setIsShowingHelpPopover(true);
            }}
          >
            Help
          </Button>
        </ButtonGroup>
      </div>
      <div className="host-form-template-editor">
        <TextArea
          disabled={disabled}
          rows={15}
          onChange={e => {
            field.handleChange(e.target.value);
          }}
          onBlur={field.handleBlur}
          value={field.value}
        />
        <Markdown markdown={renderToMarkdown(field.value, context)} />
      </div>

      {exportContent && (
        <Alert
          isOpen
          onClose={() => {
            setExportContent(null);
          }}
        >
          {/* TODO improve UI with max height + copy button */}
          <Blockquote>{btoa(JSON.stringify(exportContent, null, 2))}</Blockquote>
        </Alert>
      )}

      {/* TODO increase width */}
      {isShowingHelpPopover && (
        <Dialog
          isOpen={isShowingHelpPopover}
          onClose={() => {
            setIsShowingHelpPopover(false);
          }}
        >
          <HelpTab context={context} />
        </Dialog>
      )}

      {isShowingImportPopover && (
        <Alert
          isOpen={isShowingImportPopover}
          confirmButtonText="Import"
          cancelButtonText="Cancel"
          onCancel={() => {
            setIsShowingImportPopover(false);
          }}
          onConfirm={() => {
            let values: unknown = null;

            try {
              values = JSON.parse(atob(importText));
            } catch (err) {
              console.error(err);
            }

            if (
              !values ||
              typeof values !== 'object' ||
              !Object.values(values).every(value => typeof value === 'string')
            ) {
              window.alert('Invalid import data format');
            } else {
              setLocalPresets({
                ...localPresets,
                ...values,
              });
              setIsShowingImportPopover(false);
              setIsPresetMenuOpen(true);
            }
          }}
        >
          {/* TODO move into own components, field validation + preview, hookup data properly*/}
          <InputGroup placeholder="Template name" />
          <TextArea
            placeholder="Paste template data here"
            style={{ width: '100%' }}
            fill
            value={importText}
            onChange={e => {
              setImportText(e.target.value);
            }}
          />
        </Alert>
      )}
    </div>
  );
};
