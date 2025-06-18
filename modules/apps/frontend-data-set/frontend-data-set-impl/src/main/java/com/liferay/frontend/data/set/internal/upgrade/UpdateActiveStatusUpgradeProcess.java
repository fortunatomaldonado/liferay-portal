package com.liferay.frontend.data.set.internal.upgrade;

import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;



public class UpdateActiveStatusUpgradeProcess extends UpgradeProcess {

	private static final Log _log = LogFactoryUtil.getLog(UpdateActiveStatusUpgradeProcess.class);


	@Override
	protected void doUpgrade() throws Exception {
		_log.info("Starting upgrade for active_ status in DDM Structures...");

		try {
			//Where to get table name
			//active_ is now in L_#_Dataset in latest master. I believe it was in L_#_Dataset_x in 2025.Q2.0
			runSQL("UPDATE L_87314286262267_DataSet_x SET active_ = 1 WHERE active_ = 0");

		} catch (Exception e) {
			_log.error("Error during active_ status upgrade: " + e.getMessage(), e);
			throw e;
		}

		_log.info("Finished upgrade for active_ status.");
	}


}

