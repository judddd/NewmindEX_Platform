/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import crypto from 'crypto';

/**
 * Generate signature token from url and secret
 */
export function generateUrlSignature(url: string, secret: string) {
	const token = crypto.createHmac('sha256', secret).update(url).digest('hex');
	return token;
}

/**
 * Prepare url for signing
 */
export function prepareUrlForSigning(url: URL) {
	return `${url.host}${url.pathname}${url.search}`;
}
