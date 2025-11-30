/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { CollaborationPushMessage } from './collaboration';
import type { DebugPushMessage } from './debug';
import type { ExecutionPushMessage } from './execution';
import type { HotReloadPushMessage } from './hot-reload';
import type { WebhookPushMessage } from './webhook';
import type { WorkerPushMessage } from './worker';
import type { WorkflowPushMessage } from './workflow';

export type PushMessage =
	| ExecutionPushMessage
	| WorkflowPushMessage
	| HotReloadPushMessage
	| WebhookPushMessage
	| WorkerPushMessage
	| CollaborationPushMessage
	| DebugPushMessage;

export type PushType = PushMessage['type'];

export type PushPayload<T extends PushType> = Extract<PushMessage, { type: T }>['data'];
