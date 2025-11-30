/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { RuleTester } from '@typescript-eslint/rule-tester';
import { NoInternalPackageImportRule } from './no-internal-package-import.js';

const ruleTester = new RuleTester();

ruleTester.run('no-internal-package-import', NoInternalPackageImportRule, {
	valid: [
		{ code: 'import { SomeDto } from "@newflow/api-types"' },
		{ code: 'import { Logger } from "@newflow/backend-common"' },
		{ code: 'import { NodeHelpers } from "@newflow/workflow"' },
		{ code: 'import lodash from "lodash"' },
		{ code: 'import { helper } from "./local-file"' },
		{ code: 'import { utils } from "../utils"' },
		{ code: 'import express from "express"' },
		{ code: 'import { something } from "@other-org/package/src/file"' },
	],

	invalid: [
		{
			code: 'import { UpdateDataStoreDto } from "@newflow/api-types/src/dto/data-store/update-data-store.dto"',
			output: 'import { UpdateDataStoreDto } from "@newflow/api-types"',
			errors: [{ messageId: 'noInternalPackageImport' }],
		},
		{
			code: 'import { helper } from "@newflow/backend-common/src/utils/helper"',
			output: 'import { helper } from "@newflow/backend-common"',
			errors: [{ messageId: 'noInternalPackageImport' }],
		},
	],
});
