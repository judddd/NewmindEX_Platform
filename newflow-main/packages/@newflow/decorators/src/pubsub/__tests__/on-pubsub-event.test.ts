/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Container, Service } from '@newflow/di';

import { NonMethodError } from '../../errors';
import { OnPubSubEvent } from '../on-pubsub-event';
import { PubSubMetadata } from '../pubsub-metadata';

describe('@OnPubSubEvent', () => {
	let metadata: PubSubMetadata;

	beforeEach(() => {
		Container.reset();

		metadata = new PubSubMetadata();
		Container.set(PubSubMetadata, metadata);
	});

	it('should register methods decorated with @OnPubSubEvent', () => {
		jest.spyOn(metadata, 'register');

		@Service()
		class TestService {
			@OnPubSubEvent('reload-license')
			async reloadProviders() {}

			@OnPubSubEvent('restart-event-bus', { instanceType: 'worker' })
			async restartEventBus() {}
		}

		expect(metadata.register).toHaveBeenNthCalledWith(1, {
			eventName: 'reload-license',
			methodName: 'reloadProviders',
			eventHandlerClass: TestService,
		});

		expect(metadata.register).toHaveBeenNthCalledWith(2, {
			eventName: 'restart-event-bus',
			methodName: 'restartEventBus',
			eventHandlerClass: TestService,
			filter: { instanceType: 'worker' },
		});
	});

	it('should throw an error if the decorated target is not a method', () => {
		expect(() => {
			@Service()
			class TestService {
				// @ts-expect-error Testing invalid code
				@OnPubSubEvent('reload-license')
				notAFunction = 'string';
			}

			new TestService();
		}).toThrowError(NonMethodError);
	});
});
