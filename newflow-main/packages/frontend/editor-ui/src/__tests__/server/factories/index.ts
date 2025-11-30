/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { userFactory } from './user';
import { credentialFactory } from './credential';
import { credentialTypeFactory } from './credentialType';
import { variableFactory } from './variable';
import { workflowFactory } from './workflow';
import { tagFactory } from './tag';

export * from './user';
export * from './credential';
export * from './credentialType';
export * from './variable';

export const factories = {
	credential: credentialFactory,
	credentialType: credentialTypeFactory,
	user: userFactory,
	variable: variableFactory,
	workflow: workflowFactory,
	tag: tagFactory,
};
