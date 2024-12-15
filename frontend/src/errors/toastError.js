import { toast } from "react-toastify";

const toastError = (err, t) => {
	const errorMsg =
		err?.response?.data?.message || err?.response?.data?.error;

	if (errorMsg) {
		const translatedMsgKey = `backendErrors.${errorMsg}`;
		const translatedMsg = t(translatedMsgKey) !== translatedMsgKey
			? t(translatedMsgKey)
			: errorMsg;

		toast.error(translatedMsg, {
			toastId: errorMsg,
		});
	} else if (err?.message) {
		toast.error(err.message, {
			toastId: err.message,
		});
	} else {
		const fallbackMsg = t("backendErrors.genericError") !== "backendErrors.genericError"
			? t("backendErrors.genericError")
			: "An unexpected error occurred!";

		toast.error(fallbackMsg, {
			toastId: "genericError",
		});
	}
};

export default toastError;
