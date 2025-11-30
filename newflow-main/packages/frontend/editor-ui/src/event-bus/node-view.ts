/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { createEventBus } from '@newflow/utils/event-bus';
import type { IDataObject } from 'n8n-workflow';

export interface NodeViewEventBusEvents {
	/** Command to create a new workflow */
	newWorkflow: never;

	/** Command to open the chat */
	openChat: never;

	/** Command to import a workflow from given data */
	importWorkflowData: IDataObject;

	/** Command to import a workflow from given URL */
	importWorkflowUrl: IDataObject;

	'runWorkflowButton:mouseenter': never;

	'runWorkflowButton:mouseleave': never;

	/** Command to tidy up the canvas */
	tidyUp: never;
}

export const nodeViewEventBus = createEventBus<NodeViewEventBusEvents>();
