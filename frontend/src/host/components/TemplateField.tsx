import {
  Alert,
  Table,
  Title,
  Code,
  Group,
  Menu,
  Button,
  Textarea,
  Stack,
  Box,
  Modal,
  Blockquote,
  TextInput,
} from '@mantine/core';
import {
  ArrowCounterClockwiseIcon,
  ArrowLeftIcon,
  BookmarkIcon,
  BoxArrowDownIcon,
  BoxArrowUpIcon,
  FloppyDiskIcon,
  InfoIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import type { FieldWithValue } from '@tanstack/react-form';
import { useDebouncedValue } from '@tanstack/react-pacer';
import { useAtom } from 'jotai';
import * as Mark from 'markup-js';
import React, { useCallback, useMemo, useState } from 'react';

import { Markdown } from '@/components/Markdown';
import type { Dayjs } from '@/dayjs';
import { presetsAtom } from '@/host/atoms/presets';
import { defaultPreset } from '@/host/defaultPreset';
import type { CreateMatchData } from '@/host/schema';

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
    <Table.Tr key={index}>
      <Table.Td>
        <Code>{sample[0]}</Code>
      </Table.Td>
      <Table.Td>{sample[1]}</Table.Td>
      <Table.Td>{Mark.up(sample[0], context)}</Table.Td>
    </Table.Tr>
  ));

const HelpTab: React.FC<{ context: TemplateContext }> = ({ context }) => (
  <Alert color="blue">
    <Title order={5}>Template information</Title>
    <div>
      <span>Templates can use Markdown as well as </span>
      <a href="https://github.com/adammark/Markup.js/blob/master/README.md" target="_blank" rel="noopener noreferrer">
        Markup Templating
      </a>
      <span> for generating content. Here are some template examples and what they would output:</span>
    </div>
    <Table withTableBorder striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Example</Table.Th>
          <Table.Th>Description</Table.Th>
          <Table.Th>Output</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{renderSamples(context)}</Table.Tbody>
    </Table>
  </Alert>
);

export const TemplateField: React.FunctionComponent<TemplateFieldProps> = ({ disabled, context, field }) => {
  const [localPresets, setLocalPresets] = useAtom(presetsAtom);
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

  // debounce the rendered markdown so typing in the template (or any other field) doesn't
  // re-parse + re-render the whole preview on every keystroke
  const markdown = useMemo(() => renderToMarkdown(field.value, context), [field.value, context]);
  const [debouncedMarkdown] = useDebouncedValue(markdown, { wait: 300 });

  return (
    <Stack>
      <Group justify="end">
        <Menu closeOnClickOutside closeOnEscape closeOnItemClick>
          <Menu.Target>
            <Button variant="outline" leftSection={<BookmarkIcon />}>
              Presets
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{saved.length === 0 ? 'No saved presets' : 'Saved Presets'}</Menu.Label>
            {saved.map(([name, template]) => (
              <Menu.Sub key={name} openDelay={120} closeDelay={150}>
                <Menu.Sub.Target>
                  <Menu.Sub.Item>{name}</Menu.Sub.Item>
                </Menu.Sub.Target>

                <Menu.Sub.Dropdown>
                  <Menu.Item
                    leftSection={<PlusIcon />}
                    onClick={() => {
                      field.handleChange(template);
                    }}
                  >
                    Apply
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<BoxArrowUpIcon />}
                    onClick={() => {
                      setExportContent(template);
                    }}
                  >
                    Export
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<TrashIcon />}
                    onClick={() => {
                      onDeleteLocalPreset(name);
                    }}
                  >
                    Delete
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<FloppyDiskIcon />}
                    onClick={() => {
                      overwrite(name);
                    }}
                  >
                    Overwrite
                  </Menu.Item>
                </Menu.Sub.Dropdown>
              </Menu.Sub>
            ))}
            <Menu.Divider />
            <Menu.Item
              leftSection={<FloppyDiskIcon />}
              onClick={() => {
                onSaveCurrentAsPreset();
              }}
            >
              Save as new preset
            </Menu.Item>
            <Menu.Item
              leftSection={<BoxArrowDownIcon />}
              onClick={() => {
                setIsShowingImportPopover(true);
              }}
            >
              Import Preset
            </Menu.Item>
            <Menu.Item
              leftSection={<ArrowCounterClockwiseIcon />}
              onClick={() => {
                field.handleChange(defaultPreset);
              }}
            >
              Reset to Default
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
        <Button
          variant="outline"
          leftSection={<InfoIcon />}
          onClick={() => {
            setIsShowingHelpPopover(true);
          }}
        >
          Help
        </Button>
      </Group>

      <Group align="start">
        <Textarea
          disabled={disabled}
          minRows={15}
          autosize
          onChange={e => {
            field.handleChange(e.target.value);
          }}
          onBlur={field.handleBlur}
          value={field.value}
          flex={1}
        />
        <Box flex={1}>
          <Markdown markdown={debouncedMarkdown} />
        </Box>
      </Group>

      <Modal
        size="lg"
        centered
        opened={!!exportContent}
        onClose={() => {
          setExportContent(null);
        }}
        title="Export Code:"
      >
        {/* TODO improve UI with max height + copy button */}
        <Blockquote textWrap="wrap" style={{ overflowWrap: 'anywhere' }}>
          {btoa(JSON.stringify(exportContent, null, 2))}
        </Blockquote>
      </Modal>

      <Modal
        size="xl"
        opened={isShowingHelpPopover}
        onClose={() => {
          setIsShowingHelpPopover(false);
        }}
      >
        <HelpTab context={context} />
      </Modal>

      {isShowingImportPopover && (
        <Modal
          opened={isShowingImportPopover}
          onClose={() => {
            setIsShowingImportPopover(false);
          }}
          title="Import Preset"
          // onCancel={() => {
          //   setIsShowingImportPopover(false);
          // }}
          // onConfirm={() => {
          //   let values: unknown = null;
          //
          //   try {
          //     values = JSON.parse(atob(importText));
          //   } catch (err) {
          //     console.error(err);
          //   }
          //
          //   if (
          //     !values ||
          //     typeof values !== 'object' ||
          //     !Object.values(values).every(value => typeof value === 'string')
          //   ) {
          //     window.alert('Invalid import data format');
          //   } else {
          //     setLocalPresets({
          //       ...localPresets,
          //       ...values,
          //     });
          //     setIsShowingImportPopover(false);
          //     setIsPresetMenuOpen(true);
          //   }
          // }}
        >
          {/* TODO move into own components, field validation + preview, hookup data properly*/}
          <Stack>
            <TextInput placeholder="Template name" />
            <Textarea
              placeholder="Paste template data here"
              style={{ width: '100%' }}
              autosize
              minRows={15}
              flex={1}
              value={importText}
              onChange={e => {
                setImportText(e.target.value);
              }}
            />
            <Group justify="end">
              <Button variant="subtle" leftSection={<ArrowLeftIcon />}>
                Cancel
              </Button>
              <Button color="green" leftSection={<PlusIcon />}>
                Add
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
    </Stack>
  );
};
