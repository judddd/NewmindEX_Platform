/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Service } from '@newflow/di';

import { TypedEmitter } from '@/typed-emitter';

import type { AiEventMap } from './maps/ai.event-map';
import type { QueueMetricsEventMap } from './maps/queue-metrics.event-map';
import type { RelayEventMap } from './maps/relay.event-map';

type EventMap = RelayEventMap & QueueMetricsEventMap & AiEventMap;

@Service()
export class EventService extends TypedEmitter<EventMap> {}
