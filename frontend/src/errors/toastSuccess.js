import { toast } from "react-toastify";

const toastSuccess = (msg) => {
  toast.success(msg, {
    toastId: msg,
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export default toastSuccess;
