import { createFormHook, useSelector } from '@tanstack/react-form';

import { TemplateField } from '../components/host/TemplateField';

import { DateTimeField } from './fields/DateTimeField';
import { NumberField } from './fields/NumberField';
import { SegmentedField } from './fields/SegmentedField';
import { SelectField } from './fields/SelectField';
import { SwitchField } from './fields/SwitchField';
import { TagsField } from './fields/TagsField';
import { TextField } from './fields/TextField';
import { VersionField } from './fields/VersionField';

export const { useAppForm, useFormContext, appFormOptions, defineAppFieldGroup } = createFormHook({
  fieldComponents: {
    TextField,
    NumberField,
    SwitchField,
    TagsField,
    SelectField,
    DateTimeField,
    SegmentedField,
    TemplateField,
    VersionField,
  },
  formComponents: {},
});

export const useFormSelector = useSelector;
