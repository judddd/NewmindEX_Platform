/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Server } from 'miragejs';
import { routesForUsers } from './user';
import { routesForCredentials } from './credential';
import { routesForCredentialTypes } from './credentialType';
import { routesForVariables } from './variable';
import { routesForSettings } from './settings';
import { routesForSSO } from './sso';
import { routesForSourceControl } from './sourceControl';
import { routesForWorkflows } from './workflow';
import { routesForTags } from './tag';
import { routesForModuleSettings } from './module';

const endpoints: Array<(server: Server) => void> = [
	routesForCredentials,
	routesForCredentialTypes,
	routesForUsers,
	routesForVariables,
	routesForSettings,
	routesForSSO,
	routesForSourceControl,
	routesForWorkflows,
	routesForTags,
	routesForModuleSettings,
];

export { endpoints };
