/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { IconName } from '@newflow/design-system/components/N8nIcon/icons';
import type { BaseTextKey } from '@newflow/i18n';
import type { FilterConditionValue, FilterOperatorValue } from 'n8n-workflow';

export interface FilterOperator extends FilterOperatorValue {
	name: BaseTextKey;
}

export interface FilterOperatorGroup {
	id: string;
	name: BaseTextKey;
	icon?: IconName;
	children: FilterOperator[];
}

export type ConditionResult =
	| { status: 'resolve_error' }
	| { status: 'validation_error'; error: string; resolved: FilterConditionValue }
	| {
			status: 'success';
			result: boolean;
			resolved: FilterConditionValue;
	  };
