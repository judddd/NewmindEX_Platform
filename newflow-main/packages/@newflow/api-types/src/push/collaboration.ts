/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Iso8601DateTimeString } from '../datetime';
import type { MinimalUser } from '../user';

export type Collaborator = {
	user: MinimalUser;
	lastSeen: Iso8601DateTimeString;
};

export type CollaboratorsChanged = {
	type: 'collaboratorsChanged';
	data: {
		workflowId: string;
		collaborators: Collaborator[];
	};
};

export type CollaborationPushMessage = CollaboratorsChanged;
