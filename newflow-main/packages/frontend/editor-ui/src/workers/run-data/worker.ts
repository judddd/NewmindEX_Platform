/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import * as Comlink from 'comlink';
import { databaseConfig } from '@/workers/run-data/db';
import { initializeDatabase } from '@/workers/database';
import type { Promiser, DbId } from '@sqlite.org/sqlite-wasm';
import type { NodeExecuteAfterData } from '@newflow/api-types/push/execution';

const state: {
	initialized: boolean;
	promiser: Promiser | undefined;
	dbId: DbId;
} = {
	initialized: false,
	promiser: undefined,
	dbId: undefined,
};

export const actions = {
	async initialize() {
		if (state.initialized) return;

		const { promiser, dbId } = await initializeDatabase(databaseConfig);

		state.promiser = promiser;
		state.dbId = dbId;
		state.initialized = true;
	},
	onNodeExecuteAfterData(buffer: ArrayBuffer) {
		const data = new TextDecoder('utf-8').decode(new Uint8Array(buffer));

		let parsedData: NodeExecuteAfterData;
		try {
			parsedData = JSON.parse(data);
		} catch (error) {
			return;
		}

		console.log('nodeExecuteAfterData in worker', parsedData);
	},
};

export type RunDataWorker = typeof actions;

Comlink.expose(actions);
