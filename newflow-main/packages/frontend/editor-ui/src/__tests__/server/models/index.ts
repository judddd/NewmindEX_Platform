/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { UserModel } from './user';
import { CredentialModel } from './credential';
import { CredentialTypeModel } from './credentialType';
import { VariableModel } from './variable';
import { WorkflowModel } from './workflow';
import { TagModel } from './tag';

export const models = {
	credential: CredentialModel,
	credentialType: CredentialTypeModel,
	user: UserModel,
	variable: VariableModel,
	workflow: WorkflowModel,
	tag: TagModel,
};
