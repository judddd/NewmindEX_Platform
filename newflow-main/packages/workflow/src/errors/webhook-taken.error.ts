/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { WorkflowActivationError } from './workflow-activation.error';

export class WebhookPathTakenError extends WorkflowActivationError {
	constructor(nodeName: string, cause?: Error) {
		super(
			`The URL path that the "${nodeName}" node uses is already taken. Please change it to something else.`,
			{ level: 'warning', cause },
		);
	}
}
