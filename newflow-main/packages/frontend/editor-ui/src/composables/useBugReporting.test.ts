/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { describe, it, expect, vi } from 'vitest';
import { useBugReporting } from './useBugReporting';

vi.mock('@/composables/useDebugInfo', () => ({
	useDebugInfo: () => ({
		generateDebugInfo: () => 'mocked debug info',
	}),
}));

describe('useBugReporting', () => {
	it('should generate the correct reporting URL', () => {
		const { getReportingURL } = useBugReporting();
		const url = getReportingURL();

		expect(url).toContain('mocked+debug+info');
		expect(url).toMatchSnapshot();
	});
});
