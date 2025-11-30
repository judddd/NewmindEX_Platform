/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { BooleanLicenseFeature, NumericLicenseFeature } from '@newflow/constants';

export type FeatureReturnType = Partial<
	{
		planName: string;
	} & { [K in NumericLicenseFeature]: number } & { [K in BooleanLicenseFeature]: boolean }
>;

export interface LicenseProvider {
	/** Returns whether a feature is included in the user's license plan. */
	isLicensed(feature: BooleanLicenseFeature): boolean;

	/** Returns the value of a feature in the user's license plan, typically a boolean or integer. */
	getValue<T extends keyof FeatureReturnType>(feature: T): FeatureReturnType[T];
}
