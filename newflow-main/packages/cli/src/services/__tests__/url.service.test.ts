/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { GlobalConfig } from '@newflow/config';
import { mock } from 'jest-mock-extended';

import { UrlService } from '../url.service';

describe('UrlService', () => {
	beforeEach(() => {
		process.env.WEBHOOK_URL = undefined;
	});

	describe('getInstanceBaseUrl', () => {
		it('should set URL from N8N_EDITOR_BASE_URL', () => {
			process.env.WEBHOOK_URL = undefined;
			const urlService = new UrlService(
				mock<GlobalConfig>({
					editorBaseUrl: 'https://example.com/',
				}),
			);
			expect(urlService.getInstanceBaseUrl()).toBe('https://example.com');
		});

		it('should set URL from WEBHOOK_URL', () => {
			process.env.WEBHOOK_URL = 'https://example.com/';
			const urlService = new UrlService(
				mock<GlobalConfig>({
					editorBaseUrl: '',
				}),
			);
			expect(urlService.getInstanceBaseUrl()).toBe('https://example.com');
		});

		it('should trim quotes when setting URL from N8N_EDITOR_BASE_URL', () => {
			process.env.WEBHOOK_URL = undefined;
			const urlService = new UrlService(
				mock<GlobalConfig>({
					editorBaseUrl: '"https://example.com"',
				}),
			);
			expect(urlService.getInstanceBaseUrl()).toBe('https://example.com');
		});

		it('should trim quotes when setting URL from WEBHOOK_URL', () => {
			process.env.WEBHOOK_URL = '"https://example.com/"';
			const urlService = new UrlService(
				mock<GlobalConfig>({
					editorBaseUrl: '',
				}),
			);
			expect(urlService.getInstanceBaseUrl()).toBe('https://example.com');
		});
	});
});
