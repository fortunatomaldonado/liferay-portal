/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from "../../../../../fixtures/apiHelpersTest";
import {featureFlagsTest} from "../../../../../fixtures/featureFlagsTest";
import {isolatedSiteTest} from "../../../../../fixtures/isolatedSiteTest";
import {loginTest} from '../../../../../fixtures/loginTest';
import {pageEditorPagesTest} from "../../../../../fixtures/pageEditorPagesTest";
import {liferayConfig} from "../../../../../liferay.config";
import getRandomString from "../../../../../utils/getRandomString";
import {waitForAlert} from "../../../../../utils/waitForAlert";
import getPageDefinition
	from "../../../../layout-content-page-editor-web/utils/getPageDefinition";
import getWidgetDefinition
	from "../../../../layout-content-page-editor-web/utils/getWidgetDefinition";

const test = mergeTests(
	apiHelpersTest,
	featureFlagsTest({
		'LPS-178052': true,
	}),
	isolatedSiteTest,
	loginTest(),
	pageEditorPagesTest
);

test(
	'Check various accessibility in pagination',
	{tag: ['@LPD-38101', '@LPD-38653', '@LPD-38653']},
	async ({page}) => {
		await test.step('Use searchbar to go to search page', async () => {
			await page.goto('/');

			const searchBar = page.getByPlaceholder('Search...');

			await searchBar.waitFor({state: 'visible'});

			await searchBar.fill('png');

			await searchBar.press('Enter');

			await page
				.getByRole('heading', {name: 'Search Results'})
				.waitFor({state: 'visible'});
		});

		await test.step('Check pagination button is selected and contains option role', async () => {
			await page.getByLabel('Items per Page').click();

			const paginationFourSelection = page.getByRole('option', {
				name: '4  Entries per Page',
			});

			await paginationFourSelection.click();

			const pagination = page.getByLabel('Items per Page');

			await pagination.waitFor({state: 'visible'});

			const paginationLinkSelected = page.locator(
				'a[aria-selected="true"][role="option"][id="4"]'
			);

			await expect(paginationLinkSelected).toBeHidden();
		});

		await test.step('Check pagination list has aria-labelledby', async () => {
			const element = page.locator('.dropdown-menu.dropdown-menu-top');

			await expect(element).toHaveAttribute('aria-labelledby');
		});

		await test.step('Check aria-label is being translated', async () => {
			await page.goto('/es/web/guest/search?q=png');

			await page
				.getByRole('heading', {name: 'Barra de búsqueda'})
				.waitFor({state: 'visible'});

			const paginationTranslated = page.getByLabel('Paginación');

			await expect(paginationTranslated).toBeVisible();
		});
	}
);



test(
	'Check intermediant button work with arrow keys',
	{tag: '@LPD-42610'},
	async ({apiHelpers, page, pageEditorPage, site}) => {
		let layout: Layout;

		const widgetId = getRandomString();

		await test.step('Create a content site and the ckeditor sample widget', async () => {
			const widgetDefinition = getWidgetDefinition({
				id: widgetId,
				widgetName:
					'com_liferay_asset_publisher_web_portlet_AssetPublisherPortlet',
			});

			layout = await apiHelpers.headlessDelivery.createSitePage({
				pageDefinition: getPageDefinition([widgetDefinition]),
				siteId: site.id,
				title: getRandomString(),
			});
		});

		await test.step('add DM', async () =>{
			await page.goto('/');

			const openProductButton = page.getByLabel('Open Product Menu');

			if (await openProductButton.isVisible()) {
				await openProductButton.click();
			}

			const contentAndDataTab = page.getByRole('menuitem', {
				name: 'Content & Data',
			});

			await contentAndDataTab.waitFor({state: 'visible'});

			await contentAndDataTab.click();

			const documentsAndMediaButton = page.getByRole('menuitem', {
				name: 'Documents and Media',
			});

			await documentsAndMediaButton.waitFor({state: 'visible'});

			await documentsAndMediaButton.click();

			const number = 20;

			for (let i = 0; i < number; i++) {

				const newPageButton = page.getByRole('button', {name: 'New'});

				await newPageButton.waitFor({state: 'visible'});

				await newPageButton.click();

				const fileUploadButton = page.getByRole(
					'menuitem', {name: 'File Upload'})

				await fileUploadButton.waitFor({state: 'visible'});

				await fileUploadButton.click();

				const title = page.getByLabel('Title Required');

				await title.fill('a' + getRandomString());

				const publishButton = page.getByRole(
					'button', {name: 'Publish'});

				await publishButton.waitFor({state: 'visible'});

				await publishButton.click();

				await waitForAlert(page);
			}
		});

		await test.step('Change Asset Publisher settings', async () => {
			// await page.goto(
			// 	`${liferayConfig.environment.baseUrl}/web${site.friendlyUrlPath}${layout.friendlyUrlPath}`
			// );

			await pageEditorPage.goto(layout, site.friendlyUrlPath);

			await pageEditorPage.goToWidgetConfiguration(widgetId);

		});
	}
);
