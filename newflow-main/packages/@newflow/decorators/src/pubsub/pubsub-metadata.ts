/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { InstanceRole, InstanceType } from '@newflow/constants';
import { Service } from '@newflow/di';

import type { EventHandler } from '../types';

export type PubSubEventName =
	| 'add-webhooks-triggers-and-pollers'
	| 'remove-triggers-and-pollers'
	| 'clear-test-webhooks'
	| 'display-workflow-activation'
	| 'display-workflow-deactivation'
	| 'display-workflow-activation-error'
	| 'community-package-install'
	| 'community-package-uninstall'
	| 'community-package-update'
	| 'get-worker-status'
	// External secrets enterprise feature has been removed
	| 'reload-license'
	| 'reload-oidc-config'
	| 'reload-saml-config'
	| 'response-to-get-worker-status'
	| 'restart-event-bus'
	| 'relay-execution-lifecycle-event';

export type PubSubEventFilter =
	| {
			instanceType: 'main';
			instanceRole?: Omit<InstanceRole, 'unset'>;
	  }
	| {
			instanceType: Omit<InstanceType, 'main'>;
			instanceRole?: never;
	  };

type PubSubEventHandler = EventHandler<PubSubEventName> & { filter?: PubSubEventFilter };

@Service()
export class PubSubMetadata {
	private readonly handlers: PubSubEventHandler[] = [];

	register(handler: PubSubEventHandler) {
		this.handlers.push(handler);
	}

	getHandlers(): PubSubEventHandler[] {
		return this.handlers;
	}
}
