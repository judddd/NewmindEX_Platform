/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { ExecutionError } from '../execution-error';

describe('ExecutionError', () => {
	const defaultStack = `TypeError: a.unknown is not a function
    at VmCodeWrapper (evalmachine.<anonymous>:2:3)
    at evalmachine.<anonymous>:7:2
    at Script.runInContext (node:vm:148:12)
    at Script.runInNewContext (node:vm:153:17)
    at runInNewContext (node:vm:309:38)
    at JsTaskRunner.runForAllItems (/n8n/packages/@newflow/task-runner/dist/js-task-runner/js-task-runner.js:90:65)
    at JsTaskRunner.executeTask (/n8n/packages/@newflow/task-runner/dist/js-task-runner/js-task-runner.js:71:26)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async JsTaskRunner.receivedSettings (/n8n/packages/@newflow/task-runner/dist/task-runner.js:190:26)`;

	it('should parse error details from stack trace without itemIndex', () => {
		const error = new Error('a.unknown is not a function');
		error.stack = defaultStack;

		const executionError = new ExecutionError(error);
		expect(executionError.message).toBe('a.unknown is not a function [line 2]');
		expect(executionError.lineNumber).toBe(2);
		expect(executionError.description).toBe('TypeError');
		expect(executionError.context).toBeUndefined();
	});

	it('should parse error details from stack trace with itemIndex', () => {
		const error = new Error('a.unknown is not a function');
		error.stack = defaultStack;

		const executionError = new ExecutionError(error, 1);
		expect(executionError.message).toBe('a.unknown is not a function [line 2, for item 1]');
		expect(executionError.lineNumber).toBe(2);
		expect(executionError.description).toBe('TypeError');
		expect(executionError.context).toEqual({ itemIndex: 1 });
	});

	it('should serialize correctly', () => {
		const error = new Error('a.unknown is not a function');
		Object.defineProperty(error, 'stack', {
			value: defaultStack,
			enumerable: true,
		});
		// error.stack = defaultStack;

		const executionError = new ExecutionError(error, 1);

		expect(JSON.stringify(executionError)).toBe(
			JSON.stringify({
				stack: defaultStack,
				message: 'a.unknown is not a function [line 2, for item 1]',
				description: 'TypeError',
				itemIndex: 1,
				context: { itemIndex: 1 },
				lineNumber: 2,
			}),
		);
	});
});
