/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Config, Env } from '../decorators';

@Config
export class VersionNotificationsConfig {
	/** Whether to request notifications about new n8n versions */
	@Env('NEWFLOW_VERSION_NOTIFICATIONS_ENABLED')
	enabled: boolean = false;

	/** Endpoint to retrieve version information from */
	@Env('NEWFLOW_VERSION_NOTIFICATIONS_ENDPOINT')
	endpoint: string = 'https://api.newmindtech.cn/api/versions/';

	/** Whether to request What's New articles. Also requires `NEWFLOW_VERSION_NOTIFICATIONS_ENABLED` to be enabled */
	@Env('NEWFLOW_VERSION_NOTIFICATIONS_WHATS_NEW_ENABLED')
	whatsNewEnabled: boolean = false;

	/** Endpoint to retrieve "What's New" articles from */
	@Env('NEWFLOW_VERSION_NOTIFICATIONS_WHATS_NEW_ENDPOINT')
	whatsNewEndpoint: string = 'https://api.newmindtech.cn/api/whats-new';

	/** URL for versions panel to page instructing user on how to update n8n instance */
	@Env('NEWFLOW_VERSION_NOTIFICATIONS_INFO_URL')
	infoUrl: string = 'http://newflow.ee/hosting/installation/updating/';
}
