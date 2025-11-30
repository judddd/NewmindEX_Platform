/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export const CUSTOM_EXTENSION_ENV = 'NEWFLOW_CUSTOM_EXTENSIONS';
export const PLACEHOLDER_EMPTY_EXECUTION_ID = '__UNKNOWN__';
export const PLACEHOLDER_EMPTY_WORKFLOW_ID = '__EMPTY__';
export const HTTP_REQUEST_NODE_TYPE = 'n8n-nodes-base.httpRequest';
export const HTTP_REQUEST_AS_TOOL_NODE_TYPE = 'n8n-nodes-base.httpRequestTool';
export const HTTP_REQUEST_TOOL_NODE_TYPE = '@newflow/n8n-nodes-langchain.toolHttpRequest';

export const RESTRICT_FILE_ACCESS_TO = 'NEWFLOW_RESTRICT_FILE_ACCESS_TO';
export const BLOCK_FILE_ACCESS_TO_NEWFLOW_FILES = 'NEWFLOW_BLOCK_FILE_ACCESS_TO_NEWFLOW_FILES';
export const CONFIG_FILES = 'NEWFLOW_CONFIG_FILES';
export const BINARY_DATA_STORAGE_PATH = 'NEWFLOW_BINARY_DATA_STORAGE_PATH';
export const UM_EMAIL_TEMPLATES_INVITE = 'NEWFLOW_UM_EMAIL_TEMPLATES_INVITE';
export const UM_EMAIL_TEMPLATES_PWRESET = 'NEWFLOW_UM_EMAIL_TEMPLATES_PWRESET';

export const CREDENTIAL_ERRORS = {
	NO_DATA: 'No data is set on this credentials.',
	DECRYPTION_FAILED:
		'Credentials could not be decrypted. The likely reason is that a different "encryptionKey" was used to encrypt the data.',
	INVALID_JSON: 'Decrypted credentials data is not valid JSON.',
	INVALID_DATA: 'Credentials data is not in a valid format.',
};

export const WAITING_TOKEN_QUERY_PARAM = 'signature';
