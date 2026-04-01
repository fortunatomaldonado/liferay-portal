/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {contentSecurityPolicyPagesTest} from '../../../fixtures/contentSecurityPolicyPagesTest';
import {isolatedLayoutTest} from '../../../fixtures/isolatedLayoutTest';
import {loginTest} from '../../../fixtures/loginTest';
import {systemSettingsPageTest} from '../../../fixtures/systemSettingsPageTest';
import performLogin, {performLogout} from '../../../utils/performLogin';

export const test = mergeTests(
	contentSecurityPolicyPagesTest,
	isolatedLayoutTest({publish: false}),
	loginTest(),
	systemSettingsPageTest
);

test(
	'Check there is no CSP error when logging in',
	{
		tag: '@LPD-83856',
	},
	async ({contentSecurityPolicyPage, page}) => {
		await contentSecurityPolicyPage.gotoAndConfigurePolicy(
			`style-src '[$NONCE$]'`
		);

		const errors = [];

		page.on('console', (msg) => {
			if (
				msg.type() === 'error' &&
				msg.text().includes('Content Security Policy directive:')
			) {
				errors.push({text: msg.text(), type: msg.type()});
			}
		});

		await performLogout(page);

		await performLogin(page, 'test');

		expect(errors).toHaveLength(0);
	}
);
