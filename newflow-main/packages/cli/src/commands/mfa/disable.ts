/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { UserRepository } from '@newflow/db';
import { Command } from '@newflow/decorators';
import { Container } from '@newflow/di';
import { z } from 'zod';

import { BaseCommand } from '../base-command';

const flagsSchema = z.object({
	email: z.string().describe('The email of the user to disable the MFA authentication'),
});

@Command({
	name: 'mfa:disable',
	description: 'Disable MFA authentication for a user',
	examples: ['--email=johndoe@example.com'],
	flagsSchema,
})
export class DisableMFACommand extends BaseCommand<z.infer<typeof flagsSchema>> {
	async run(): Promise<void> {
		const { flags } = this;

		if (!flags.email) {
			this.logger.info('An email with --email must be provided');
			return;
		}

		const repository = Container.get(UserRepository);
		const user = await repository.findOneBy({ email: flags.email });

		if (!user) {
			this.reportUserDoesNotExistError(flags.email);
			return;
		}

		if (
			user.mfaSecret === null &&
			Array.isArray(user.mfaRecoveryCodes) &&
			user.mfaRecoveryCodes.length === 0 &&
			!user.mfaEnabled
		) {
			this.reportUserDoesNotExistError(flags.email);
			return;
		}

		Object.assign(user, { mfaSecret: null, mfaRecoveryCodes: [], mfaEnabled: false });

		await repository.save(user);

		this.reportSuccess(flags.email);
	}

	async catch(error: Error) {
		this.logger.error('An error occurred while disabling MFA in account');
		this.logger.error(error.message);
	}

	private reportSuccess(email: string) {
		this.logger.info(`Successfully disabled MFA for user with email: ${email}`);
	}

	private reportUserDoesNotExistError(email: string) {
		this.logger.info(`User with email: ${email} does not exist`);
	}
}
