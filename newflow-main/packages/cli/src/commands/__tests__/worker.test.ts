/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { mockInstance } from '@newflow/backend-test-utils';
import { Container } from '@newflow/di';

import { PubSubRegistry } from '@/scaling/pubsub/pubsub.registry';
import { Subscriber } from '@/scaling/pubsub/subscriber.service';
import { WorkerStatusService } from '@/scaling/worker-status.service.ee';
import { RedisClientService } from '@/services/redis-client.service';

import { Worker } from '../worker';

mockInstance(RedisClientService);
mockInstance(PubSubRegistry);
mockInstance(Subscriber);
mockInstance(WorkerStatusService);

test('should instantiate WorkerStatusService during orchestration setup', async () => {
	const containerGetSpy = jest.spyOn(Container, 'get');

	await new Worker().initOrchestration();

	expect(containerGetSpy).toHaveBeenCalledWith(WorkerStatusService);
});
