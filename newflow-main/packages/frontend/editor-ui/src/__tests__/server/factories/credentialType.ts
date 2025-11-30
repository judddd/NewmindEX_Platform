/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Factory } from 'miragejs';
import type { ICredentialType } from 'n8n-workflow';

const credentialTypes = [
	'airtableApi',
	'dropboxApi',
	'figmaApi',
	'googleApi',
	'gitlabApi',
	'jenkinsApi',
	'metabaseApi',
	'notionApi',
];

export const credentialTypeFactory = Factory.extend<ICredentialType>({
	name(i) {
		return credentialTypes[i];
	},
	displayName(i) {
		return credentialTypes[i];
	},
	properties() {
		return [];
	},
});
