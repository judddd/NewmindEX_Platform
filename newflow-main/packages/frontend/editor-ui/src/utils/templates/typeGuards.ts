/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { WorkflowDataWithTemplateId } from '@/Interface';
import type {
	ITemplatesCollection,
	ITemplatesCollectionFull,
	ITemplatesWorkflow,
} from '@newflow/rest-api-client/api/templates';

export function isTemplatesWorkflow(
	template: ITemplatesWorkflow | ITemplatesCollection | ITemplatesCollectionFull | null,
): template is ITemplatesWorkflow {
	return !!template && 'totalViews' in template;
}

export function isFullTemplatesCollection(
	template: ITemplatesWorkflow | ITemplatesCollectionFull | ITemplatesCollection | null,
): template is ITemplatesCollectionFull {
	return !!template && 'description' in template && 'categories' in template;
}

export function isWorkflowDataWithTemplateId(data: unknown): data is WorkflowDataWithTemplateId {
	if (!data || typeof data !== 'object') return false;

	const record = data as Record<string, unknown>;
	if (!record.meta || typeof record.meta !== 'object') return false;

	const m = record.meta as Record<string, unknown>;
	return typeof m.templateId === 'string';
}
