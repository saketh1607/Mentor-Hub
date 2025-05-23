import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [initializing, setInitializing] = useState(true);
  const INITIAL_STATE = {
    chatId: "null",
    user: {},
  };

  useEffect(() => {
    // Wait for currentUser to be initialized
    if (currentUser !== undefined && currentUser !== null) {
      setInitializing(false);
    }
  }, [currentUser]);

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        if (!currentUser || !action.payload) {
          return state;
        }
        
        const combinedId = currentUser.uid > action.payload.uid
          ? currentUser.uid + action.payload.uid
          : action.payload.uid + currentUser.uid;

        return {
          user: action.payload,
          chatId: combinedId,
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data: state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
