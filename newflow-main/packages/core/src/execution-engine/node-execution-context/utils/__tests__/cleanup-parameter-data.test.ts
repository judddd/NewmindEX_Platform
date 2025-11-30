/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import toPlainObject from 'lodash/toPlainObject';
import { DateTime } from 'luxon';
import type { NodeParameterValue } from 'n8n-workflow';

import { cleanupParameterData } from '../cleanup-parameter-data';

describe('cleanupParameterData', () => {
	it('should stringify Luxon dates in-place', () => {
		const input = { x: 1, y: DateTime.now() as unknown as NodeParameterValue };
		expect(typeof input.y).toBe('object');
		cleanupParameterData(input);
		expect(typeof input.y).toBe('string');
	});

	it('should stringify plain Luxon dates in-place', () => {
		const input = {
			x: 1,
			y: toPlainObject(DateTime.now()),
		};
		expect(typeof input.y).toBe('object');
		cleanupParameterData(input);
		expect(typeof input.y).toBe('string');
	});

	it('should handle objects with nameless constructors', () => {
		const input = { x: 1, y: { constructor: {} } as NodeParameterValue };
		expect(typeof input.y).toBe('object');
		cleanupParameterData(input);
		expect(typeof input.y).toBe('object');
	});

	it('should handle objects without a constructor', () => {
		const input = { x: 1, y: { constructor: undefined } as unknown as NodeParameterValue };
		expect(typeof input.y).toBe('object');
		cleanupParameterData(input);
		expect(typeof input.y).toBe('object');
	});
});
