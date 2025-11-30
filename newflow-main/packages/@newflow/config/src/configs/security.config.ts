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
export class SecurityConfig {
	/**
	 * Which directories to limit NewFlow's access to. Separate multiple dirs with semicolon `;`.
	 *
	 * @example NEWFLOW_RESTRICT_FILE_ACCESS_TO=/home/user/.newflow;/home/user/newflow-data
	 */
	@Env('NEWFLOW_RESTRICT_FILE_ACCESS_TO')
	restrictFileAccessTo: string = '';

	/**
	 * Whether to block access to all files at:
	 * - the ".newflow" directory,
	 * - the static cache dir at ~/.cache/newflow/public, and
	 * - user-defined config files.
	 */
	@Env('NEWFLOW_BLOCK_FILE_ACCESS_TO_NEWFLOW_FILES')
	blockFileAccessToN8nFiles: boolean = true;

	/**
	 * In a [security audit](http://newflow.ee/hosting/securing/security-audit/), how many days for a workflow to be considered abandoned if not executed.
	 */
	@Env('NEWFLOW_SECURITY_AUDIT_DAYS_ABANDONED_WORKFLOW')
	daysAbandonedWorkflow: number = 90;

	/**
	 * Set [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) headers as [helmet.js](https://helmetjs.github.io/#content-security-policy) nested directives object.
	 * Example: { "frame-ancestors": ["http://localhost:3000"] }
	 */
	// TODO: create a new type that parses and validates this string into a strongly-typed object
	@Env('NEWFLOW_CONTENT_SECURITY_POLICY')
	contentSecurityPolicy: string = '{}';

	/**
	 * Whether to set the `Content-Security-Policy-Report-Only` header instead of `Content-Security-Policy`.
	 */
	@Env('NEWFLOW_CONTENT_SECURITY_POLICY_REPORT_ONLY')
	contentSecurityPolicyReportOnly: boolean = false;

	/**
	 * Whether to disable HTML sandboxing for webhooks. The sandboxing mechanism uses CSP headers now,
	 * but the name is kept for backwards compatibility.
	 */
	@Env('NEWFLOW_INSECURE_DISABLE_WEBHOOK_IFRAME_SANDBOX')
	disableWebhookHtmlSandboxing: boolean = false;

	/**
	 * Whether to disable bare repositories support in the Git node.
	 */
	@Env('NEWFLOW_GIT_NODE_DISABLE_BARE_REPOS')
	disableBareRepos: boolean = false;
}
