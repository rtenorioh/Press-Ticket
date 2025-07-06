const rules = {
	user: {
		static: [],
	},
	admin: {
		static: [
			"drawer-admin-items:view",
			"dashboard-admin-items:view",
			"tickets-manager:showall",
			"user-modal:editProfile",
			"user-modal:editQueues",
			"user-modal:editWhatsapps",
			"user-table:editTricked",
			"ticket-options:deleteTicket",
			"ticket-options:transferWhatsapp",
			"contacts-page:deleteContact",
			"documentation-admin:view",
			"documentation-api:view",
			"videos:create"
		],
	},
	masteradmin: {
		static: [
			"drawer-admin-items:view",
			"dashboard-admin-items:view",
			"tickets-manager:showall",
			"user-modal:editProfile",
			"user-modal:editQueues",
			"user-modal:editWhatsapps",
			"user-table:editTricked",
			"ticket-options:deleteTicket",
			"ticket-options:transferWhatsapp",
			"contacts-page:deleteContact",
			"settings:personalize",
			"documentation-admin:view",
			"documentation-api:view",
			"documentation-system:view"
		],
	}
};

export default rules;