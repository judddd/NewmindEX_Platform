/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { request } from '@newflow/rest-api-client';
import type { JSONSchema7 } from 'json-schema';
import type { NodeParameterValueType } from 'n8n-workflow';
import { isEmpty } from '@/utils/typesUtils';

export type GetSchemaPreviewOptions = {
	nodeType: string;
	version: number;
	resource?: NodeParameterValueType;
	operation?: NodeParameterValueType;
};

const padVersion = (version: number) => {
	return version.toString().split('.').concat(['0', '0']).slice(0, 3).join('.');
};

const isNonEmptyJsonSchema = (response: unknown): response is JSONSchema7 => {
	return (
		!!response &&
		typeof response === 'object' &&
		'type' in response &&
		'properties' in response &&
		!isEmpty(response.properties)
	);
};

export const getSchemaPreview = async (
	baseUrl: string,
	options: GetSchemaPreviewOptions,
): Promise<JSONSchema7> => {
	const { nodeType, version, resource, operation } = options;
	const versionString = padVersion(version);
	const path = ['schemas', nodeType.replace('@newflow/', ''), versionString, resource, operation]
		.filter(Boolean)
		.join('/');
	const response = await request({
		method: 'GET',
		baseURL: baseUrl,
		endpoint: `${path}.json`,
		withCredentials: false,
	});

	if (!isNonEmptyJsonSchema(response)) throw new Error('Invalid JSON schema');

	return response;
};
