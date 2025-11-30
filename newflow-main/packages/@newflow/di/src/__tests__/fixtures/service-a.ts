/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// eslint-disable-next-line import-x/no-cycle
import { ServiceB } from './service-b';
import { Service } from '../../di';

@Service()
export class ServiceA {
	constructor(readonly b: ServiceB) {}
}
