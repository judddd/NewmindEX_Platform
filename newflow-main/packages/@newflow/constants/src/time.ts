/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

/**
 * Convert time from any time unit to any other unit
 */
export const Time = {
	milliseconds: {
		toMinutes: 1 / (60 * 1000),
		toSeconds: 1 / 1000,
	},
	seconds: {
		toMilliseconds: 1000,
	},
	minutes: {
		toMilliseconds: 60 * 1000,
	},
	hours: {
		toMilliseconds: 60 * 60 * 1000,
		toSeconds: 60 * 60,
	},
	days: {
		toSeconds: 24 * 60 * 60,
		toMilliseconds: 24 * 60 * 60 * 1000,
	},
};
