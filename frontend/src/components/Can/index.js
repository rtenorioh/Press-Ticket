import PropTypes from "prop-types";
import rules from "../../rules";

const check = (role, action, data) => {
	const permissions = rules[role];
	if (!permissions) {
		console.warn(`Role "${role}" não encontrada nas regras.`);
		return false;
	}

	const staticPermissions = permissions.static;

	if (staticPermissions && staticPermissions.includes(action)) {
		return true;
	}

	const dynamicPermissions = permissions.dynamic;

	if (dynamicPermissions) {
		const permissionCondition = dynamicPermissions[action];
		if (!permissionCondition) {
			return false;
		}

		return permissionCondition(data);
	}

	return false;
};

const Can = ({ role, perform, data, yes, no }) =>
	check(role, perform, data) ? yes() : no();

Can.defaultProps = {
	yes: () => null,
	no: () => null,
};

Can.propTypes = {
	role: PropTypes.string.isRequired,
	perform: PropTypes.string.isRequired,
	data: PropTypes.object,
	yes: PropTypes.func,
	no: PropTypes.func,
};

export { Can };

