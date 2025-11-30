/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { TaskRunnersConfig } from '@newflow/config';
import { Time } from '@newflow/constants';
import { mock } from 'jest-mock-extended';
import type WebSocket from 'ws';

import { WsStatusCodes } from '@/constants';
import { TaskBrokerWsServer } from '@/task-runners/task-broker/task-broker-ws-server';

describe('TaskBrokerWsServer', () => {
	describe('removeConnection', () => {
		it('should close with 1000 status code by default', async () => {
			const server = new TaskBrokerWsServer(mock(), mock(), mock(), mock(), mock());
			const ws = mock<WebSocket>();
			server.runnerConnections.set('test-runner', ws);

			await server.removeConnection('test-runner');

			expect(ws.close).toHaveBeenCalledWith(WsStatusCodes.CloseNormal);
		});
	});

	describe('heartbeat timer', () => {
		it('should set up heartbeat timer on server start', async () => {
			const setIntervalSpy = jest.spyOn(global, 'setInterval');

			const server = new TaskBrokerWsServer(
				mock(),
				mock(),
				mock(),
				mock<TaskRunnersConfig>({ path: '/runners', heartbeatInterval: 30 }),
				mock(),
			);

			server.start();

			expect(setIntervalSpy).toHaveBeenCalledWith(
				expect.any(Function),
				30 * Time.seconds.toMilliseconds,
			);

			await server.stop();
		});

		it('should clear heartbeat timer on server stop', async () => {
			jest.spyOn(global, 'setInterval');
			const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

			const server = new TaskBrokerWsServer(
				mock(),
				mock(),
				mock(),
				mock<TaskRunnersConfig>({ path: '/runners', heartbeatInterval: 30 }),
				mock(),
			);
			server.start();

			await server.stop();

			expect(clearIntervalSpy).toHaveBeenCalled();
		});
	});

	describe('sendMessage', () => {
		it('should work with a message containing circular references', () => {
			const server = new TaskBrokerWsServer(mock(), mock(), mock(), mock(), mock());
			const ws = mock<WebSocket>();
			server.runnerConnections.set('test-runner', ws);

			const messageData: Record<string, unknown> = {};
			messageData.circular = messageData;

			expect(() =>
				server.sendMessage('test-runner', {
					type: 'broker:taskdataresponse',
					taskId: 'taskId',
					requestId: 'requestId',
					data: messageData,
				}),
			).not.toThrow();

			expect(ws.send).toHaveBeenCalledWith(
				'{"type":"broker:taskdataresponse","taskId":"taskId","requestId":"requestId","data":{"circular":"[Circular Reference]"}}',
			);
		});
	});
});
