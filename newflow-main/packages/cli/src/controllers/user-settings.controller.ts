/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Patch, RestController } from '@newflow/decorators';
import type { NpsSurveyState } from 'n8n-workflow';

import { BadRequestError } from '@/errors/response-errors/bad-request.error';
import { NpsSurveyRequest } from '@/requests';
import { UserService } from '@/services/user.service';

function getNpsSurveyState(state: unknown): NpsSurveyState | undefined {
	if (typeof state !== 'object' || state === null) {
		return;
	}
	if (!('lastShownAt' in state) || typeof state.lastShownAt !== 'number') {
		return;
	}
	if ('responded' in state && state.responded === true) {
		return {
			responded: true,
			lastShownAt: state.lastShownAt,
		};
	}

	if (
		'waitingForResponse' in state &&
		state.waitingForResponse === true &&
		'ignoredCount' in state &&
		typeof state.ignoredCount === 'number'
	) {
		return {
			waitingForResponse: true,
			ignoredCount: state.ignoredCount,
			lastShownAt: state.lastShownAt,
		};
	}

	return;
}

@RestController('/user-settings')
export class UserSettingsController {
	constructor(private readonly userService: UserService) {}

	@Patch('/nps-survey')
	async updateNpsSurvey(req: NpsSurveyRequest.NpsSurveyUpdate): Promise<void> {
		const state = getNpsSurveyState(req.body);
		if (!state) {
			throw new BadRequestError('Invalid nps survey state structure');
		}

		await this.userService.updateSettings(req.user.id, {
			npsSurvey: state,
		});
	}
}
