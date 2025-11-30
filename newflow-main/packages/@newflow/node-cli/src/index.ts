/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import Build from './commands/build';
import Dev from './commands/dev';
import Lint from './commands/lint';
import New from './commands/new';
import Prerelease from './commands/prerelease';
import Release from './commands/release';

export const commands = {
	new: New,
	build: Build,
	dev: Dev,
	prerelease: Prerelease,
	release: Release,
	lint: Lint,
};
