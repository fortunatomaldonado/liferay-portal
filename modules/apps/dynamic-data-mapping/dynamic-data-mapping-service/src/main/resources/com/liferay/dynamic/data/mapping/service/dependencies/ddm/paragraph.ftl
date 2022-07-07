<#include "../init.ftl">

<@liferay_aui["field-wrapper"]
	cssClass="form-builder-field"
	data=data
>
	<#assign style = fieldStructure.style!"" />

	<p style="${escapeAttribute(style)}">
		${escape(label)}

		${fieldStructure.children}
	</p>
</@>