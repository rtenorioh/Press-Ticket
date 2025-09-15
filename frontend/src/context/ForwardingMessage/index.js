import React, { createContext, useContext, useReducer } from "react";

const ForwardingMessageContext = createContext();

const initialState = {
  isForwardingMode: false,
  selectedMessages: [],
};

const forwardingReducer = (state, action) => {
  switch (action.type) {
    case "ENTER_FORWARDING_MODE":
      return {
        ...state,
        isForwardingMode: true,
        selectedMessages: [],
      };
    case "EXIT_FORWARDING_MODE":
      return {
        ...state,
        isForwardingMode: false,
        selectedMessages: [],
      };
    case "TOGGLE_MESSAGE_SELECTION":
      const messageId = action.payload;
      const isSelected = state.selectedMessages.some(msg => msg.id === messageId);
      
      if (isSelected) {
        return {
          ...state,
          selectedMessages: state.selectedMessages.filter(msg => msg.id !== messageId),
        };
      } else {
        const message = action.message;
        return {
          ...state,
          selectedMessages: [...state.selectedMessages, message],
        };
      }
    case "CLEAR_SELECTED_MESSAGES":
      return {
        ...state,
        selectedMessages: [],
      };
    default:
      return state;
  }
};

const ForwardingMessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(forwardingReducer, initialState);

  const enterForwardingMode = () => {
    dispatch({ type: "ENTER_FORWARDING_MODE" });
  };

  const exitForwardingMode = () => {
    dispatch({ type: "EXIT_FORWARDING_MODE" });
  };

  const toggleMessageSelection = (message) => {
    dispatch({ 
      type: "TOGGLE_MESSAGE_SELECTION", 
      payload: message.id,
      message: message
    });
  };

  const clearSelectedMessages = () => {
    dispatch({ type: "CLEAR_SELECTED_MESSAGES" });
  };

  const value = {
    ...state,
    enterForwardingMode,
    exitForwardingMode,
    toggleMessageSelection,
    clearSelectedMessages,
  };

  return (
    <ForwardingMessageContext.Provider value={value}>
      {children}
    </ForwardingMessageContext.Provider>
  );
};

const useForwardingMessage = () => {
  const context = useContext(ForwardingMessageContext);
  if (!context) {
    throw new Error("useForwardingMessage must be used within a ForwardingMessageProvider");
  }
  return context;
};

export { ForwardingMessageProvider, useForwardingMessage };
