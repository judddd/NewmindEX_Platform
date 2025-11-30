/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { GlobalConfig } from '@newflow/config';
import { Service } from '@newflow/di';

@Service()
export class UrlService {
	/** Returns the base URL n8n is reachable from */
	readonly baseUrl: string;

	constructor(private readonly globalConfig: GlobalConfig) {
		this.baseUrl = this.generateBaseUrl();
	}

	/** Returns the base URL of the webhooks */
	getWebhookBaseUrl() {
		let urlBaseWebhook = this.trimQuotes(process.env.WEBHOOK_URL) || this.baseUrl;
		if (!urlBaseWebhook.endsWith('/')) {
			urlBaseWebhook += '/';
		}
		return urlBaseWebhook;
	}

	/** Return the n8n instance base URL without trailing slash */
	getInstanceBaseUrl(): string {
		const n8nBaseUrl = this.trimQuotes(this.globalConfig.editorBaseUrl) || this.getWebhookBaseUrl();

		return n8nBaseUrl.endsWith('/') ? n8nBaseUrl.slice(0, n8nBaseUrl.length - 1) : n8nBaseUrl;
	}

	private generateBaseUrl(): string {
		const { path, port, host, protocol } = this.globalConfig;

		if ((protocol === 'http' && port === 80) || (protocol === 'https' && port === 443)) {
			return `${protocol}://${host}${path}`;
		}
		return `${protocol}://${host}:${port}${path}`;
	}

	/** Remove leading and trailing double quotes from a URL. */
	private trimQuotes(url?: string) {
		return url?.replace(/^["]+|["]+$/g, '') ?? '';
	}
}
