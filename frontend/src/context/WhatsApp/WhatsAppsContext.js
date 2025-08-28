import React, { createContext } from "react";

import useWhatsApps from "../../hooks/useWhatsApps";

const WhatsAppsContext = createContext();

const WhatsAppsProvider = ({ children }) => {
	const { loading, whatsApps, fetchWhatsApps } = useWhatsApps();

	return (
		<WhatsAppsContext.Provider value={{ whatsApps, loading, fetchWhatsApps }}>
			{children}
		</WhatsAppsContext.Provider>
	);
};

export { WhatsAppsContext, WhatsAppsProvider };
