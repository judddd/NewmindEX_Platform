/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Container } from '../di';
import { ServiceA } from './fixtures/service-a';
import { ServiceB } from './fixtures/service-b';

describe('DI Container', () => {
	describe('circular dependency', () => {
		it('should detect multilevel circular dependencies', () => {
			expect(() => Container.get(ServiceA)).toThrow(
				'[DI] Circular dependency detected in ServiceB at index 0.\nServiceA -> ServiceB',
			);

			expect(() => Container.get(ServiceB)).toThrow(
				'[DI] Circular dependency detected in ServiceB at index 0.\nServiceB',
			);
		});
	});
});
