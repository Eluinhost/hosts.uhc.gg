import { createFormHook, useSelector } from '@tanstack/react-form';

import { DateTimeField } from '@/forms/fields/DateTimeField';
import { NumberField } from '@/forms/fields/NumberField';
import { SegmentedField } from '@/forms/fields/SegmentedField';
import { SelectField } from '@/forms/fields/SelectField';
import { SwitchField } from '@/forms/fields/SwitchField';
import { TagsField } from '@/forms/fields/TagsField';
import { TextField } from '@/forms/fields/TextField';
import { VersionField } from '@/forms/fields/VersionField';
import { TemplateField } from '@/host/components/TemplateField';

/* @beta - unused exports but here for discoverability */
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
