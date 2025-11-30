/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { InsightsDateFilterDto } from '../date-filter.dto';

describe('InsightsDateFilterDto', () => {
	describe('Valid requests', () => {
		test.each([
			{
				name: 'empty object (no filters)',
				request: {},
				parsedResult: {},
			},
			{
				name: 'valid dateRange',
				request: {
					dateRange: 'week', // Using a valid option from the provided list
				},
				parsedResult: {
					dateRange: 'week',
				},
			},
			{
				name: 'valid projectId',
				request: {
					projectId: '2gQLpmP5V4wOY627',
				},
				parsedResult: {
					projectId: '2gQLpmP5V4wOY627',
				},
			},
		])('should validate $name', ({ request, parsedResult }) => {
			const result = InsightsDateFilterDto.safeParse(request);
			expect(result.success).toBe(true);
			if (parsedResult) {
				expect(result.data).toMatchObject(parsedResult);
			}
		});
	});

	describe('Invalid requests', () => {
		test.each([
			{
				name: 'invalid dateRange value',
				request: {
					dateRange: 'invalid-value',
				},
				expectedErrorPath: ['dateRange'],
			},
			{
				name: 'invalid projectId value',
				request: {
					projectId: 10,
				},
				expectedErrorPath: ['projectId'],
			},
		])('should fail validation for $name', ({ request, expectedErrorPath }) => {
			const result = InsightsDateFilterDto.safeParse(request);

			expect(result.success).toBe(false);

			if (expectedErrorPath && !result.success) {
				if (Array.isArray(expectedErrorPath)) {
					const errorPaths = result.error.issues[0].path;
					expect(errorPaths).toContain(expectedErrorPath[0]);
				}
			}
		});
	});
});
