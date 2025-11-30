/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { z } from 'zod';

import { Config, Env, Nested } from '../decorators';

@Config
class SmtpAuth {
	/** SMTP login username */
	@Env('NEWFLOW_SMTP_USER')
	user: string = '';

	/** SMTP login password */
	@Env('NEWFLOW_SMTP_PASS')
	pass: string = '';

	/** SMTP OAuth Service Client */
	@Env('NEWFLOW_SMTP_OAUTH_SERVICE_CLIENT')
	serviceClient: string = '';

	/** SMTP OAuth Private Key */
	@Env('NEWFLOW_SMTP_OAUTH_PRIVATE_KEY')
	privateKey: string = '';
}

@Config
class SmtpConfig {
	/** SMTP server host */
	@Env('NEWFLOW_SMTP_HOST')
	host: string = '';

	/** SMTP server port */
	@Env('NEWFLOW_SMTP_PORT')
	port: number = 465;

	/** Whether to use SSL for SMTP */
	@Env('NEWFLOW_SMTP_SSL')
	secure: boolean = true;

	/** Whether to use STARTTLS for SMTP when SSL is disabled */
	@Env('NEWFLOW_SMTP_STARTTLS')
	startTLS: boolean = true;

	/** How to display sender name */
	@Env('NEWFLOW_SMTP_SENDER')
	sender: string = '';

	@Nested
	auth: SmtpAuth;
}

@Config
export class TemplateConfig {
	/** Overrides default HTML template for inviting new people (use full path) */
	@Env('NEWFLOW_UM_EMAIL_TEMPLATES_INVITE')
	'user-invited': string = '';

	/** Overrides default HTML template for resetting password (use full path) */
	@Env('NEWFLOW_UM_EMAIL_TEMPLATES_PWRESET')
	'password-reset-requested': string = '';

	/** Overrides default HTML template for notifying that a workflow was shared (use full path) */
	@Env('NEWFLOW_UM_EMAIL_TEMPLATES_WORKFLOW_SHARED')
	'workflow-shared': string = '';

	/** Overrides default HTML template for notifying that credentials were shared (use full path) */
	@Env('NEWFLOW_UM_EMAIL_TEMPLATES_CREDENTIALS_SHARED')
	'credentials-shared': string = '';

	/** Overrides default HTML template for notifying that credentials were shared (use full path) */
	@Env('NEWFLOW_UM_EMAIL_TEMPLATES_PROJECT_SHARED')
	'project-shared': string = '';
}

const emailModeSchema = z.enum(['', 'smtp']);
type EmailMode = z.infer<typeof emailModeSchema>;

@Config
class EmailConfig {
	/** How to send emails */
	@Env('NEWFLOW_EMAIL_MODE', emailModeSchema)
	mode: EmailMode = 'smtp';

	@Nested
	smtp: SmtpConfig;

	@Nested
	template: TemplateConfig;
}

const INVALID_JWT_REFRESH_TIMEOUT_WARNING =
	'NEWFLOW_USER_MANAGEMENT_JWT_REFRESH_TIMEOUT_HOURS needs to be smaller than NEWFLOW_USER_MANAGEMENT_JWT_DURATION_HOURS. Setting NEWFLOW_USER_MANAGEMENT_JWT_REFRESH_TIMEOUT_HOURS to 0.';

@Config
export class UserManagementConfig {
	@Nested
	emails: EmailConfig;

	/** JWT secret to use. If unset, n8n will generate its own. */
	@Env('NEWFLOW_USER_MANAGEMENT_JWT_SECRET')
	jwtSecret: string = '';

	/** How long (in hours) before the JWT expires. */
	@Env('NEWFLOW_USER_MANAGEMENT_JWT_DURATION_HOURS')
	jwtSessionDurationHours: number = 168;

	/**
	 * How long (in hours) before expiration to automatically refresh it.
	 * - `0` means 25% of `NEWFLOW_USER_MANAGEMENT_JWT_DURATION_HOURS`.
	 * - `-1` means it will never refresh. This forces users to log back in after expiration.
	 */
	@Env('NEWFLOW_USER_MANAGEMENT_JWT_REFRESH_TIMEOUT_HOURS')
	jwtRefreshTimeoutHours: number = 0;

	sanitize() {
		if (this.jwtRefreshTimeoutHours >= this.jwtSessionDurationHours) {
			console.warn(INVALID_JWT_REFRESH_TIMEOUT_WARNING);
			this.jwtRefreshTimeoutHours = 0;
		}
	}
}
