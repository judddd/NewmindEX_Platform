/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { SendConsoleMessage } from '@newflow/api-types/push/debug';

/**
 * Handles the 'sendConsoleMessage' event from the push connection, which indicates
 * that a console message should be sent.
 */
export async function sendConsoleMessage({ data }: SendConsoleMessage) {
	console.log(data.source, ...data.messages);
}
