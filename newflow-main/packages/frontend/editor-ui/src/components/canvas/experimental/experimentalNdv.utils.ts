/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { INodeUi } from '@/Interface';
import type { I18nClass } from '@newflow/i18n';
import type { INodeTypeDescription } from 'n8n-workflow';

export function getNodeSubTitleText(
	node: INodeUi,
	nodeType: INodeTypeDescription,
	includeOperation: boolean,
	t: I18nClass,
) {
	if (node.disabled) {
		return `(${t.baseText('node.disabled')})`;
	}

	const displayName = nodeType.displayName ?? '';

	if (!includeOperation) {
		return displayName;
	}

	const selectedOperation = node.parameters.operation;
	const selectedOperationDisplayName =
		selectedOperation &&
		nodeType.properties
			.find((p) => p.name === 'operation')
			?.options?.find((o) => 'value' in o && o.value === selectedOperation)?.name;

	if (!selectedOperationDisplayName) {
		return displayName;
	}

	return `${displayName}: ${selectedOperationDisplayName}`;
}
