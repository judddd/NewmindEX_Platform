/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import * as Comlink from 'comlink';
import type { RunDataWorker } from '@/workers/run-data/worker';

const worker = new Worker(new URL('./worker.ts', import.meta.url), {
	type: 'module',
});

export const runDataWorker = Comlink.wrap<RunDataWorker>(worker);
