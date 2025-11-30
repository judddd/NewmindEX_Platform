/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export {};

import luxon from 'luxon';

declare global {
	const DateTime: typeof luxon.DateTime;
	type DateTime = luxon.DateTime;

	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console) */
	interface Console {
		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/console/log_static) */
		log(...data: any[]): void;
	}

	var console: Console;
}
