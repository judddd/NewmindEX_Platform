/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { CreateCredentialDto } from '@newflow/api-types';
import type { Scope } from '@newflow/permissions';
import { nanoId, date } from 'minifaker';
import { randomString } from 'n8n-workflow';

type NewCredentialWithSCopes = {
	scopes: Scope[];
	name: string;
	data: string;
	type: string;
	isManaged: boolean;
	id: string;
	createdAt: Date;
	updatedAt: Date;
};

const name = 'new Credential';
const type = 'openAiApi';
const data = {
	apiKey: 'apiKey',
	url: 'url',
};
const projectId = nanoId.nanoid();

export const credentialScopes: Scope[] = [
	'credential:create',
	'credential:delete',
	'credential:list',
	'credential:move',
	'credential:read',
	'credential:share',
	'credential:update',
];

export const createNewCredentialsPayload = (payload?: Partial<CreateCredentialDto>) => {
	return {
		name,
		type,
		data,
		projectId,
		...payload,
	};
};

export const createdCredentialsWithScopes = (
	payload?: Partial<NewCredentialWithSCopes>,
): NewCredentialWithSCopes => {
	return {
		name,
		type,
		data: randomString(20),
		id: nanoId.nanoid(),
		createdAt: date(),
		updatedAt: date(),
		isManaged: false,
		scopes: credentialScopes,
		...payload,
	};
};
