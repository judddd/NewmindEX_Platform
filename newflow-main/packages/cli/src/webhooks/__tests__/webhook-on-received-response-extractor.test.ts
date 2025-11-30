/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { mock } from 'jest-mock-extended';
import type { IWebhookResponseData } from 'n8n-workflow';

import { extractWebhookOnReceivedResponse } from '@/webhooks/webhook-on-received-response-extractor';

describe('extractWebhookOnReceivedResponse', () => {
	const webhookResultData = mock<IWebhookResponseData>();

	beforeEach(() => {
		jest.resetAllMocks();
	});

	test('should return response with no data when responseData is "noData"', () => {
		const callbackData = extractWebhookOnReceivedResponse('noData', webhookResultData);

		expect(callbackData).toEqual(undefined);
	});

	test('should return response with responseData when it is defined', () => {
		const responseData = JSON.stringify({ foo: 'bar' });

		const callbackData = extractWebhookOnReceivedResponse(responseData, webhookResultData);

		expect(callbackData).toEqual(responseData);
	});

	test('should return response with webhookResponse when responseData is falsy but webhookResponse exists', () => {
		const webhookResponse = { success: true };
		webhookResultData.webhookResponse = webhookResponse;

		const callbackData = extractWebhookOnReceivedResponse(undefined, webhookResultData);

		expect(callbackData).toEqual(webhookResponse);
	});

	test('should return default response message when responseData and webhookResponse are falsy', () => {
		webhookResultData.webhookResponse = undefined;

		const callbackData = extractWebhookOnReceivedResponse(undefined, webhookResultData);

		expect(callbackData).toEqual({ message: 'Workflow was started' });
	});
});
