import { toast } from "react-toastify";
import WhatsMarked from "react-whatsmarked";

const toastError = (err, t) => {
	const errorMsg =
		err?.response?.data?.message || err?.response?.data?.error;

	if (errorMsg) {
		const translatedMsgKey = `backendErrors.${errorMsg}`;
		const translatedMsg = t(translatedMsgKey) !== translatedMsgKey
			? t(translatedMsgKey)
			: errorMsg;

		toast.error(<WhatsMarked>{translatedMsg}</WhatsMarked>, {
			toastId: errorMsg,
		});
	} else if (err?.message) {
		toast.error(<WhatsMarked>{err.message}</WhatsMarked>, {
			toastId: err.message,
		});
	} else {
		const fallbackMsg = t("backendErrors.genericError") !== "backendErrors.genericError"
			? t("backendErrors.genericError")
			: "An unexpected error occurred!";

		toast.error(<WhatsMarked>{fallbackMsg}</WhatsMarked>, {
			toastId: "genericError",
		});
	}
};

export default toastError;
