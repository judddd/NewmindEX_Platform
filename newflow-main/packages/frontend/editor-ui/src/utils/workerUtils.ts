/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export function averageWorkerLoadFromLoads(loads: number[]): number {
	return loads.reduce((prev, curr) => prev + curr, 0) / loads.length;
}

export function averageWorkerLoadFromLoadsAsString(loads: number[]): string {
	return averageWorkerLoadFromLoads(loads).toFixed(2);
}

export function memAsGb(mem: number): number {
	return mem / 1024 / 1024 / 1024;
}
