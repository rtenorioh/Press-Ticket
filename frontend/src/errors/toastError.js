import { toast } from "react-toastify";
import { i18n } from "../translate/i18n";

const toastError = (err) => {

	const errorMsg =
		err?.response?.data?.message || err?.response?.data?.error;

	if (errorMsg) {
		const translatedMsgKey = `backendErrors.${errorMsg}`;
		const translatedMsg = i18n.exists(translatedMsgKey)
			? i18n.t(translatedMsgKey)
			: errorMsg;

		toast.error(translatedMsg, {
			toastId: errorMsg,
		});
	} else if (err?.message) {
		toast.error(err.message, {
			toastId: err.message,
		});
	} else {
		const fallbackMsg = i18n.exists("backendErrors.genericError")
			? i18n.t("backendErrors.genericError")
			: "An unexpected error occurred!";

		toast.error(fallbackMsg, {
			toastId: "genericError",
		});
	}
};

export default toastError;
