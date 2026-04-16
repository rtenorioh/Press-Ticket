import PropTypes from "prop-types";
import { createContext, useState } from "react";

const EditMessageContext = createContext();

const EditMessageProvider = ({ children }) => {
	const [editingMessage, setEditingMessage] = useState(null);

	return (
		<EditMessageContext.Provider
			value={{ editingMessage, setEditingMessage }}
		>
			{children}
		</EditMessageContext.Provider>
	);
};

EditMessageProvider.propTypes = {
	children: PropTypes.array
}

export { EditMessageContext, EditMessageProvider };
