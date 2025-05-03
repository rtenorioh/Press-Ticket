import { toast } from "react-toastify";

const ToastManager = {
  success: (message, prefix = "success") => {
    toast.dismiss();
    
    const uniqueId = `${prefix}-${Date.now()}`;
    
    return toast.success(message, {
      toastId: uniqueId,
      autoClose: 3000,
      position: "top-right",
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
  
  error: (message, prefix = "error") => {
    toast.dismiss();
    
    const uniqueId = `${prefix}-${Date.now()}`;
    
    return toast.error(message, {
      toastId: uniqueId,
      autoClose: 5000,
      position: "top-right",
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  },
  
  info: (message, prefix = "info", options = {}) => {
    toast.dismiss();
    const uniqueId = `${prefix}-${Date.now()}`;
    
    return toast.info(message, {
      toastId: uniqueId,
      autoClose: options.autoClose !== undefined ? options.autoClose : 3000,
      position: "top-right",
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },
  
  clearAll: () => {
    toast.dismiss();
  }
};

export default ToastManager;
