/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { spawn } from 'node:child_process';

import { NodeProcessOomDetector } from '../node-process-oom-detector';

describe('NodeProcessOomDetector', () => {
	test('should detect an out-of-memory error in a monitored process', (done) => {
		const childProcess = spawn(process.execPath, [
			// set low memory limit
			'--max-old-space-size=20',
			'-e',
			`
      const data = [];
			// fill memory until it crashes
      while (true) data.push(Array.from({ length: 10_000 }).map(() => Math.random().toString()).join());
      `,
		]);

		const detector = new NodeProcessOomDetector(childProcess);

		childProcess.on('exit', (code) => {
			expect(detector.didProcessOom).toBe(true);
			expect(code).not.toBe(0);
			done();
		});
	});

	test('should not detect an out-of-memory error in a process that exits normally', (done) => {
		const childProcess = spawn(process.execPath, [
			'-e',
			`
      console.log("Hello, World!");
      `,
		]);

		const detector = new NodeProcessOomDetector(childProcess);

		childProcess.on('exit', (code) => {
			expect(detector.didProcessOom).toBe(false);
			expect(code).toBe(0);
			done();
		});
	});
});
