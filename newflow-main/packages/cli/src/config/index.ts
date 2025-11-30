/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { inTest, Logger } from '@newflow/backend-common';
import { GlobalConfig } from '@newflow/config';
import { Container } from '@newflow/di';
import convict from 'convict';
import { flatten } from 'flat';
import { readFileSync } from 'fs';
import merge from 'lodash/merge';
import { setGlobalState, UserError } from 'n8n-workflow';
import assert from 'node:assert';

import { inE2ETests } from '@/constants';

const globalConfig = Container.get(GlobalConfig);

if (inE2ETests) {
	globalConfig.diagnostics.enabled = false;
	globalConfig.publicApi.disabled = true;
	process.env.EXTERNAL_FRONTEND_HOOKS_URLS = '';
	process.env.NEWFLOW_PERSONALIZATION_ENABLED = 'false';
	process.env.NEWFLOW_AI_ENABLED = 'true';
} else if (inTest) {
	globalConfig.logging.level = 'silent';
	globalConfig.publicApi.disabled = true;
	process.env.SKIP_STATISTICS_EVENTS = 'true';
	globalConfig.auth.cookie.secure = false;
	process.env.NEWFLOW_SKIP_AUTH_ON_OAUTH_CALLBACK = 'false';
}

// Load schema after process.env has been overwritten
import { schema } from './schema';
const config = convict(schema, { args: [] });

// eslint-disable-next-line @typescript-eslint/unbound-method
config.getEnv = config.get;

const logger = Container.get(Logger);

// Load overwrites when not in tests
if (!inE2ETests && !inTest) {
	// Overwrite default configuration with settings which got defined in
	// optional configuration files
	const { NEWFLOW_CONFIG_FILES } = process.env;
	if (NEWFLOW_CONFIG_FILES !== undefined) {
		const configFiles = NEWFLOW_CONFIG_FILES.split(',');
		for (const configFile of configFiles) {
			if (!configFile) continue;
			// NOTE: This is "temporary" code until we have migrated all config to the new package
			try {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const data = JSON.parse(readFileSync(configFile, 'utf8'));
				for (const prefix in data) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
					const innerData = data[prefix];
					if (prefix in globalConfig) {
						// @ts-ignore
						merge(globalConfig[prefix], innerData);
					} else {
						const flattenedData: Record<string, string> = flatten(innerData);
						for (const key in flattenedData) {
							config.set(`${prefix}.${key}`, flattenedData[key]);
						}
					}
				}
				logger.debug(`Loaded config overwrites from ${configFile}`);
			} catch (error) {
				assert(error instanceof Error);
				logger.error(`Error loading config file ${configFile}`, { error });
			}
		}
	}

	// Overwrite config from files defined in "_FILE" environment variables
	Object.entries(process.env).forEach(([envName, fileName]) => {
		if (envName.endsWith('_FILE') && fileName) {
			const configEnvName = envName.replace(/_FILE$/, '');
			// @ts-ignore
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			const key = config._env[configEnvName]?.[0] as string;
			if (key) {
				let value: string;
				try {
					value = readFileSync(fileName, 'utf8');
				} catch (error) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					if (error.code === 'ENOENT') {
						throw new UserError('File not found', { extra: { fileName } });
					}
					throw error;
				}
				config.set(key, value);
			}
		}
	});
}

setGlobalState({
	defaultTimezone: globalConfig.generic.timezone,
});

// eslint-disable-next-line import-x/no-default-export
export default config;

export type Config = typeof config;
