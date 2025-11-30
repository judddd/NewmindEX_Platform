/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { inTest } from '@newflow/backend-common';
import { createContext, Script } from 'vm';

const context = createContext({ require });
export const loadClassInIsolation = <T>(filePath: string, className: string) => {
	if (process.platform === 'win32') {
		filePath = filePath.replace(/\\/g, '/');
	}

	// Note: Skip the isolation because it breaks nock mocks in tests
	if (inTest) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
		return new (require(filePath)[className])() as T;
	} else {
		const script = new Script(`new (require('${filePath}').${className})()`);
		return script.runInContext(context) as T;
	}
};
