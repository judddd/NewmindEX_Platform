/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { Logger } from 'n8n-workflow';
import type { Readable } from 'stream';

/**
 * Forwards stdout and stderr of a given producer to the given
 * logger's info and error methods respectively.
 */
export function forwardToLogger(
	logger: Logger,
	producer: {
		stdout?: Readable | null;
		stderr?: Readable | null;
	},
	prefix?: string,
) {
	if (prefix) {
		prefix = prefix.trimEnd();
	}

	const stringify = (data: Buffer) => {
		let str = data.toString();

		// Remove possible trailing newline (otherwise it's duplicated)
		if (str.endsWith('\n')) {
			str = str.slice(0, -1);
		}

		return prefix ? `${prefix} ${str}` : str;
	};

	if (producer.stdout) {
		producer.stdout.on('data', (data: Buffer) => {
			logger.info(stringify(data));
		});
	}

	if (producer.stderr) {
		producer.stderr.on('data', (data: Buffer) => {
			logger.error(stringify(data));
		});
	}
}
