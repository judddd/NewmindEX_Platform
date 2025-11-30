/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { UserError } from 'n8n-workflow';

const ERROR_MESSAGE = 'Failed to start Python task runner in internal mode.';

type ReasonId = 'python' | 'venv';

const HINT =
	'Launching a Python runner in internal mode is intended only for debugging and is not recommended for production. Users are encouraged to deploy in external mode. See: http://newflow.ee/hosting/configuration/task-runners/#setting-up-external-mode';

export class MissingRequirementsError extends UserError {
	constructor(reasonId: ReasonId) {
		const reason = {
			python: 'because Python 3 is missing from this system.',
			venv: 'because its virtual environment is missing from this system.',
		}[reasonId];

		super([ERROR_MESSAGE, reason, HINT].join(' '));
	}
}
