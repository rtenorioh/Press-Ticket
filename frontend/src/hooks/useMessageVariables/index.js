import { useMemo } from "react";
import { defaultMessageVariables } from "../../config/messageVariables";

const useMessageVariables = (customVariables = []) => {
    return useMemo(() => {
        return [...defaultMessageVariables, ...customVariables];
    }, [customVariables]);
};

export default useMessageVariables;
