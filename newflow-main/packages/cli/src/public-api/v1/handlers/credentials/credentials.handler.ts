/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { CredentialsEntity } from '@newflow/db';
import { Container } from '@newflow/di';
import type express from 'express';
import { z } from 'zod';

import { CredentialTypes } from '@/credential-types';
import { CredentialsHelper } from '@/credentials-helper';

import { validCredentialsProperties, validCredentialType } from './credentials.middleware';
import {
	createCredential,
	encryptCredential,
	getCredentials,
	getSharedCredentials,
	removeCredential,
	sanitizeCredentials,
	saveCredential,
	toJsonSchema,
} from './credentials.service';
import type { CredentialTypeRequest, CredentialRequest } from '../../../types';
import { apiKeyHasScope, projectScope } from '../../shared/middlewares/global.middleware';

export = {
	createCredential: [
		validCredentialType,
		validCredentialsProperties,
		apiKeyHasScope('credential:create'),
		async (
			req: CredentialRequest.Create,
			res: express.Response,
		): Promise<express.Response<Partial<CredentialsEntity>>> => {
			try {
				const newCredential = await createCredential(req.body);

				const encryptedData = await encryptCredential(newCredential);

				Object.assign(newCredential, encryptedData);

				const savedCredential = await saveCredential(newCredential, req.user, encryptedData);

				return res.json(sanitizeCredentials(savedCredential));
			} catch ({ message, httpStatusCode }) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				return res.status(httpStatusCode ?? 500).json({ message });
			}
		},
	],
	transferCredential: [
		apiKeyHasScope('credential:move'),
		projectScope('credential:move', 'credential'),
		async (req: CredentialRequest.Transfer, res: express.Response) => {
			// Enterprise credentials service has been removed
			// Credential transfer functionality is no longer available
			res.status(501).json({ message: 'Credential transfer is not available in this version' });
		},
	],
	deleteCredential: [
		apiKeyHasScope('credential:delete'),
		projectScope('credential:delete', 'credential'),
		async (
			req: CredentialRequest.Delete,
			res: express.Response,
		): Promise<express.Response<Partial<CredentialsEntity>>> => {
			const { id: credentialId } = req.params;
			let credential: CredentialsEntity | undefined;

			if (!['global:owner', 'global:admin'].includes(req.user.role.slug)) {
				const shared = await getSharedCredentials(req.user.id, credentialId);

				if (shared?.role === 'credential:owner') {
					credential = shared.credentials;
				}
			} else {
				credential = (await getCredentials(credentialId)) as CredentialsEntity;
			}

			if (!credential) {
				return res.status(404).json({ message: 'Not Found' });
			}

			await removeCredential(req.user, credential);
			return res.json(sanitizeCredentials(credential));
		},
	],

	getCredentialType: [
		async (req: CredentialTypeRequest.Get, res: express.Response): Promise<express.Response> => {
			const { credentialTypeName } = req.params;

			try {
				Container.get(CredentialTypes).getByName(credentialTypeName);
			} catch (error) {
				return res.status(404).json({ message: 'Not Found' });
			}

			const schema = Container.get(CredentialsHelper)
				.getCredentialsProperties(credentialTypeName)
				.filter((property) => property.type !== 'hidden');

			return res.json(toJsonSchema(schema));
		},
	],
};
