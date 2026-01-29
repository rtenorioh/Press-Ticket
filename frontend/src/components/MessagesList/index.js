import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  styled,
} from "@mui/material";
import {
  blue,
  red
} from "@mui/material/colors";
import {
  AccessTime,
  Block,
  Done,
  DoneAll,
  Error,
  ExpandMore,
  GetApp,
  KeyboardArrowDown,
  PictureAsPdf,
  Description,
  InsertDriveFile,
} from "@mui/icons-material";

import {
  format,
  parseISO,
  isToday,
  isYesterday,
  isSameDay
} from "date-fns";
import { ptBR } from "date-fns/locale";
import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import Audio from "../Audio";
import LocationPreview from "../LocationPreview";
import WhatsMarked from "react-whatsmarked";
import MessageOptionsMenu from "../MessageOptionsMenu";
import ModalImageCors from "../ModalImageCors";
import MultiVcardPreview from "../MultiVcardPreview";
import VcardPreview from "../VcardPreview";
import ForwardingBar from "../ForwardingBar";
import ForwardMessageModal from "../ForwardMessageModal";
import { useForwardingMessage } from "../../context/ForwardingMessage";
import { useTheme } from "@mui/material/styles";
import MessageReactionsModal from "../MessageReactionsModal";
import PollMessage from "../PollMessage";
import AlbumPreview from "../AlbumPreview";

const MessagesListWrapper = styled("div")(({ theme }) => ({
  overflow: "hidden",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
}));

const TicketNumber = styled("div")(({ theme }) => ({
  color: theme.palette.secondary.main,
  padding: 8,
}));

const DateSeparator = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "16px 0",
  "& > span": {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#e1f5fe',
    color: theme.palette.text.primary,
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
    textTransform: "uppercase",
    boxShadow: theme.shadows[1],
  }
}));

const MessagesListStyled = styled("div")(({ theme }) => ({
  backgroundImage: theme.backgroundImage,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    padding: "20px 20px 20px 20px",
    overflowY: "scroll",
    [theme.breakpoints.down("sm")]: {
      paddingBottom: "90px",
    },
    ...theme.scrollbarStyles,
    "& > div:not(:first-child)": {
      marginTop: "5px",
    }
}));

const CircularProgressStyled = styled(CircularProgress)(({ theme }) => ({
  color: blue[500],
  position: "absolute",
  opacity: "70%",
  top: 0,
  left: "50%",
  marginTop: 12,
}));

const MessageLeft = styled("div")(({ theme }) => ({
  marginRight: 20,
  marginTop: 2,
  minWidth: 100,
  maxWidth: 600,
  height: "auto",
  display: "block",
  position: "relative",
  "&:hover #messageActionsButton": {
    display: "flex",
    position: "absolute",
    top: 0,
    right: 0,
  },
  whiteSpace: "pre-wrap",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  alignSelf: "flex-start",
  borderTopLeftRadius: 0,
  borderTopRightRadius: 8,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
  paddingLeft: 5,
  paddingRight: 5,
  paddingTop: 5,
  paddingBottom: 0,
  boxShadow: theme.mode === "light" ? "0 1px 1px #b3b3b3" : "0 1px 1px #000000",
  transition: "background-color 0.5s ease-in-out",
  fontSize: "14px",
  wordBreak: "break-word",
}));

const QuotedMsgStyled = styled("div")(({ theme }) => ({
  padding: 10,
  maxWidth: 300,
  height: "auto",
  display: "block",
  whiteSpace: "pre-wrap",
  overflow: "hidden",
  fontSize: "13px",
  lineHeight: "1.4",
  borderRadius: "4px",
  backgroundColor: theme.palette.action.hover,
}));

const SystemMessage = styled("div")(({ theme }) => ({
  margin: "10px auto",
  padding: "6px 12px",
  maxWidth: "80%",
  textAlign: "center",
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
  color: theme.palette.text.secondary,
  borderRadius: "8px",
  fontSize: "13px",
  fontStyle: "italic",
  wordBreak: "break-word",
}));

const MessageRight = styled("div")(({ theme }) => ({
  marginLeft: 20,
    marginTop: 2,
    minWidth: 100,
    maxWidth: 600,
    height: "auto",
    display: "block",
    position: "relative",
    "&:hover #messageActionsButton": {
      display: "flex",
      position: "absolute",
      top: 0,
      right: 0,
    },
    whiteSpace: "pre-wrap",
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.success.light,
    color: theme.palette.text.primary,
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: theme.shadows[1],
    transition: "background-color 0.5s ease-in-out",
    fontSize: "14px",
    wordBreak: "break-word",
}));

const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  display: "none",
  position: "relative",
  color: theme.palette.text.secondary,
  zIndex: 1,
  backgroundColor: "inherit",
  opacity: "90%",
  "&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
}))

const MessageContactNameStyled = styled("span")(({ theme }) => ({
  display: "flex",
  color: theme.palette.primary.main,
  fontWeight: 500,
  fontSize: "13px",
  marginBottom: "3px",
}));

const ContactImageContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: "3px",
}));

const ContactImage = styled("img")(({ theme }) => ({
  width: "30px",
  height: "30px",
  borderRadius: "7px",
  marginRight: "5px",
  objectFit: "cover",
  border: `2px solid ${theme.palette.primary.light}`,
  boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
	transition: "all 0.3s ease",
	"&:hover": {
		transform: "scale(1.05)",
		boxShadow: "0 5px 12px rgba(0,0,0,0.2)",
	},
	[theme.breakpoints.down("sm")]: {
		width: "42px",
		height: "42px",
		borderRadius: "12px",
	},
}));

const MessageItem = styled("div")(({ theme, message }) => ({
  overflowWrap: "break-word",
  padding: "3px 80px 6px 6px",
  lineHeight: "19px",
  fontSize: "14px",
  display: "block",
  width: "100%",
  ...(message.isDeleted && {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.36)",
  }),
  ...(message.isEdited && {
    padding: "3px 120px 6px 6px",
  }),
  ...(message.mediaUrl && !message.body && {
  }),
}));

const VideoStyled = styled("video")(({ theme }) => ({
  width: 250,
  maxHeight: 445,
  borderRadius: 8,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.common.white,
  border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.divider : 'rgba(0, 0, 0, 0.1)'}`,
  boxShadow: theme.shadows[1],
}));

const MessageTimestamp = styled("span")(({ theme }) => ({
  fontSize: 11,
  position: "absolute",
  bottom: 0,
  right: 5,
  color: theme.palette.text.secondary,
  lineHeight: "1.5",
  marginBottom: "3px",
  paddingTop: "0",
  paddingRight: "0",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "2px",
  minWidth: "40px",
}));

const DownloadMedia = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "inherit",
  padding: 10,
}));

const DocumentPreview = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
  borderRadius: "8px",
  overflow: "hidden",
  maxWidth: "400px",
  minWidth: "300px",
}));

const DocumentThumbnail = styled("div")(({ theme }) => ({
  width: "100%",
  height: "200px",
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : '#ffffff',
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  overflow: "hidden",
  transition: "background-color 0.2s ease",
  borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  "&:hover": {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.02)',
  },
  "& img": {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  "& object": {
    border: "none",
  }
}));

const DocumentHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "12px",
  gap: "12px",
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
}));

const DocumentIcon = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px",
  height: "48px",
  borderRadius: "8px",
  backgroundColor: theme.palette.mode === 'dark' ? '#d32f2f' : '#e53935',
  color: "#fff",
  flexShrink: 0,
}));

const DocumentInfo = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
}));

const DocumentName = styled("div")(({ theme }) => ({
  fontSize: "14px",
  fontWeight: 500,
  color: theme.palette.text.primary,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  marginBottom: "4px",
}));

const DocumentDetails = styled("div")(({ theme }) => ({
  fontSize: "12px",
  color: theme.palette.text.secondary,
  display: "flex",
  gap: "4px",
}));

const DocumentDownloadButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#4caf50' : '#2e7d32',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(46, 125, 50, 0.08)',
  },
}));

const MessageCenter = styled("div")(({ theme }) => ({
  messageCenter: {
    marginTop: 5,
    alignItems: "center",
    verticalAlign: "center",
    alignContent: "center",
    backgroundColor: "#E1F5FEEB",
    fontSize: "12px",
    minWidth: 100,
    maxWidth: 270,
    color: "#272727",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: "0 1px 1px #b3b3b3",
  },
}));

const ScrollToBottomButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  bottom: 25,
  right: 25,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 2px 5px 0 rgba(0, 0, 0, 0.26)",
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
  },
}));

const style = document.createElement('style');
style.textContent = `
  @keyframes highlightMessage {
    0% { background-color: transparent; }
    100% { background-color: rgba(0, 128, 0, 0.2); }
  }
  
  .highlight-new-message {
    animation: highlightMessage 2s ease-out;
  }
`;
document.head.appendChild(style);

const reducer = (state, action) => {
  if (action.type === "LOAD_MESSAGES") {
    const messages = action.payload;
    const newMessages = [];

    messages.forEach((message) => {
      if (!message || !message.id) {
        console.warn('[LOAD_MESSAGES] Mensagem sem ID ignorada:', message);
        return;
      }
      
      const messageIndex = state.findIndex((m) => m && m.id && m.id === message.id);
      if (messageIndex !== -1) {
        state[messageIndex] = message;
      } else {
        newMessages.push(message);
      }
    });

    return [...newMessages, ...state];
  }

  if (action.type === "ADD_MESSAGE") {
    const newMessage = action.payload;
    
    if (!newMessage || !newMessage.id) {
      console.warn('[ADD_MESSAGE] Mensagem sem ID ignorada:', newMessage);
      return state;
    }
    
    const messageIndex = state.findIndex((m) => m && m.id && m.id === newMessage.id);

    if (messageIndex !== -1) {
      state[messageIndex] = newMessage;
    } else {
      state.push(newMessage);
    }

    const sortedState = [...state].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedState;
  }

  function ToastDisplay(props) {
    return (
    <>
      <h4>"Mensagem apagada"</h4>
      <WhatsMarked>{props.body}</WhatsMarked>
    </>
    );
  }

  if (action.type === "UPDATE_MESSAGE") {
    const timestamp = new Date().toISOString();
    const messageToUpdate = action.payload;
    
    if (!messageToUpdate || !messageToUpdate.id) {
      console.warn('[UPDATE_MESSAGE] Mensagem sem ID ignorada:', messageToUpdate);
      return state;
    }

    const messageIndex = state.findIndex((m) => m && m.id && m.id === messageToUpdate.id);
    
    if (messageIndex !== -1) {
      const oldMessage = state[messageIndex];   
      
      const ackChanged = oldMessage.ack !== messageToUpdate.ack;
      const bodyChanged = oldMessage.body !== messageToUpdate.body;
      const editedChanged = oldMessage.isEdited !== messageToUpdate.isEdited;
      const oldMessagesChanged = messageToUpdate.oldMessages && 
        (!oldMessage.oldMessages || oldMessage.oldMessages.length !== messageToUpdate.oldMessages.length);
      
      if (ackChanged || bodyChanged || editedChanged || oldMessagesChanged) {
        
        const newState = [...state];
        newState[messageIndex] = { 
          ...oldMessage,
          ...messageToUpdate,
          oldMessages: messageToUpdate.oldMessages || oldMessage.oldMessages || [],
          _forceUpdate: Date.now()
        };
        
        if (bodyChanged || editedChanged) {
          setTimeout(() => {
            const messageElement = document.getElementById(messageToUpdate.id);
            if (messageElement) {
              messageElement.classList.add("highlight-new-message");
              setTimeout(() => {
                messageElement.classList.remove("highlight-new-message");
              }, 2000);
            }
          }, 100);
        }
        
        return newState;
      } else {
        const newState = [...state];
        newState[messageIndex] = { 
          ...oldMessage, 
          ...messageToUpdate,
          oldMessages: messageToUpdate.oldMessages || oldMessage.oldMessages || []
        };
        return newState;
      }
    } 

    if (messageToUpdate.isDeleted === true) {
      toast.info(<ToastDisplay
        body={messageToUpdate.body}
      />);
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "UPDATE_MESSAGE_REACTIONS") {
    const { messageId, emoji, actionType } = action.payload;
    
    if (!messageId) {
      console.warn('[UPDATE_MESSAGE_REACTIONS] messageId está undefined');
      return state;
    }
    
    const idx = state.findIndex(m => m && m.id && m.id === messageId);
    
    if (idx === -1) {
      console.warn('[UPDATE_MESSAGE_REACTIONS] Mensagem não encontrada:', messageId);
      return state;
    }
    
    const msg = state[idx];
    const current = { ...(msg.reactions || {}) };
    const currCount = current[emoji] || 0;
    
    if (actionType === "update") {
      current[emoji] = currCount + 1;
    } else if (actionType === "remove") {
      current[emoji] = Math.max(0, currCount - 1);
      if (current[emoji] === 0) delete current[emoji];
    }
    
    const newState = [...state];
    newState[idx] = { ...msg, reactions: current };
    
    return newState;
  }
};

const MessagesList = ({ ticketId, isGroup, onClick }) => {
  const [messagesList, dispatch] = useReducer(reducer, []);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lastMessageRef = useRef();
  const { t } = useTranslation();
  const [selectedMessage, setSelectedMessage] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const messageOptionsMenuOpen = Boolean(anchorEl);
  const currentTicketId = useRef(ticketId);
  
  useEffect(() => {
    if (selectedMessage?.id) {
      const updatedMessage = messagesList.find(m => m.id === selectedMessage.id);
      if (updatedMessage && updatedMessage !== selectedMessage) {
        setSelectedMessage(updatedMessage);
      }
    }
  }, [messagesList, selectedMessage]);
  const theme = useTheme();
  const [reactionsModalOpen, setReactionsModalOpen] = useState(false);
  const [reactionsMessageId, setReactionsMessageId] = useState(null);
  const {
    isForwardingMode,
    selectedMessages,
    toggleMessageSelection,
    exitForwardingMode,
    clearSelectedMessages
  } = useForwardingMessage();
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [isViewingOldMessages, setIsViewingOldMessages] = useState(false);
  const lastScrollUpTime = useRef(0);
  const defaultImage = '/default-profile.png';
  const lastSocketEventTime = useRef(Date.now());

  const handleExitForwardingMode = () => {
    exitForwardingMode();
    clearSelectedMessages();
  };

  const handleOpenForwardModal = () => {
    if (selectedMessages.length > 0) {
      setForwardModalOpen(true);
    }
  };

  const handleCloseForwardModal = () => {
    setForwardModalOpen(false);
    handleExitForwardingMode();
  };

  const handleMessageClick = (message) => {
    if (isForwardingMode) {
      toggleMessageSelection(message);
    }
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    setShouldAutoScroll(true);
    setIsViewingOldMessages(false);

    currentTicketId.current = ticketId;
  }, [ticketId]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchMessages = async () => {
        try {
          const { data } = await api.get("/messages/" + ticketId, {
            params: { pageNumber },
          });

          if (currentTicketId.current === ticketId) {
            dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
            setHasMore(data.hasMore);
            setLoading(false);
            
            if (pageNumber === 1) {
              setTimeout(() => {
                const messagesContainer = document.getElementById('messagesList');
                if (messagesContainer) {
                  messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
              }, 100);
            }
          }

        } catch (err) {
          setLoading(false);
          toastError(err, t);
        }
      };
      fetchMessages();
    }, 500);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [pageNumber, ticketId]);

  const scrollToBottom = useCallback((force = false) => {
    
    if (force) {
      const messagesContainer = document.getElementById('messagesList');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        setIsViewingOldMessages(false);
        setShouldAutoScroll(true);
      } else if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: "auto" });
        setIsViewingOldMessages(false);
      }
    } else if (shouldAutoScroll && !isViewingOldMessages) {
      const messagesContainer = document.getElementById('messagesList');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [shouldAutoScroll, isViewingOldMessages, lastMessageRef, lastScrollUpTime, setIsViewingOldMessages]);

  useEffect(() => {
    const processMessage = (data) => {
      
      lastSocketEventTime.current = Date.now();
      
      const messageTicketId = data.ticket?.id || data.message?.ticketId;
      
      const messageTicketIdStr = messageTicketId ? String(messageTicketId).trim() : null;
      const currentTicketIdStr = ticketId ? String(ticketId).trim() : null;
      
      
      if (messageTicketIdStr && currentTicketIdStr && messageTicketIdStr === currentTicketIdStr) {
        
        if (data.action === "create") {
          const messageExists = messagesList.some(m => m.id === data.message.id);
          
          if (!messageExists) {
            
            try {
              dispatch({ type: "ADD_MESSAGE", payload: data.message });
              
              setTimeout(() => {
                try {
                  scrollToBottom(true);
                  
                  const messageElement = document.getElementById(data.message.id);
                  if (messageElement) {
                    messageElement.classList.add("highlight-new-message");
                    
                    setTimeout(() => {
                      messageElement.classList.remove("highlight-new-message");
                    }, 2000);
                  }
                } catch (scrollError) {
                  console.error(scrollError);
                }
              }, 0);
            } catch (dispatchError) {
              console.error(dispatchError);
            }
          }
        }

        if (data.action === "update") {
          try {
            dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
          } catch (updateError) {
            console.error(updateError);
          }
        }
      }
    };
    
    const socket = openSocket();
    const timestamp = new Date().toISOString();
    
    if (!socket) {
      console.error(`[FRONT_SOCKET_ERRO][${timestamp}] Não foi possível conectar ao socket`);
      return;
    }

    const handleAppMessage = (data) => {
      try {
        processMessage(data);
      } catch (error) {
        console.error(`[FRONT_SOCKET_ERRO_PROCESSAMENTO][${timestamp}] Erro ao processar evento appMessage:`, error);
      }
    };

    socket.off("appMessage", handleAppMessage);
    socket.on("appMessage", handleAppMessage);

    const handleMessageReaction = (data) => {
      try {
        const { messageId, emoji, action: actionType } = data || {};
        
        if (!messageId) {
          console.warn('[handleMessageReaction] messageId está undefined');
          return;
        }
        
        dispatch({ type: "UPDATE_MESSAGE_REACTIONS", payload: { messageId, emoji, actionType } });
      } catch (e) { 
        console.error('[handleMessageReaction] Erro ao processar reação:', e); 
      }
    };
    socket.off("messageReaction", handleMessageReaction);
    socket.on("messageReaction", handleMessageReaction);
    
    if (socket.connected) {
      socket.emit("joinChatBox", ticketId);
      socket.emit("syncMessages", { ticketId });
    } else {
      socket.on("connect", () => {
        socket.emit("joinChatBox", ticketId);
        socket.emit("syncMessages", { ticketId });
      });
    }

    const handleNewMessage = (event) => {
      const { message, ticketId: messageTicketId } = event.detail;
      
      if (parseInt(messageTicketId) === parseInt(ticketId)) {
        
        const messageExists = messagesList.some(m => m.id === message.id);
        
        if (!messageExists) {
          dispatch({ type: "ADD_MESSAGE", payload: message });
          
          setTimeout(() => {
            scrollToBottom(true);
          }, 0);
        }
      }
    };

    const handleUpdateMessage = (event) => {
      const { message, ticketId: messageTicketId } = event.detail;
      
      if (parseInt(messageTicketId) === parseInt(ticketId)) {
        dispatch({ type: "UPDATE_MESSAGE", payload: message });
      }
    };
    
    document.addEventListener('newMessage', handleNewMessage);
    document.addEventListener('updateMessage', handleUpdateMessage);

    let isPollingActive = true;
    
    const refreshInterval = setInterval(() => {
      const timestamp = new Date().toISOString();
      const timeSinceLastSocketUpdate = Date.now() - lastSocketEventTime.current;
      
      if (timeSinceLastSocketUpdate < 5000) {
        return;
      }
      
      if (!isPollingActive) {
        return;
      }
      
      const fetchLatestMessages = async () => {
        try {
          isPollingActive = false;
          
          const { data } = await api.get(`/messages/${ticketId}`, {
            params: { pageNumber: 1 }
          });
          
          if (data && data.messages && data.messages.length > 0) {
            let hasNewMessages = false;
            let updatedMessages = 0;
            
            data.messages.forEach(message => {
              const existingMessageIndex = messagesList.findIndex(m => m.id === message.id);
              
              if (existingMessageIndex === -1) {
                dispatch({ type: "ADD_MESSAGE", payload: message });
                hasNewMessages = true;
              } else if (messagesList[existingMessageIndex].ack !== message.ack) {
                dispatch({ type: "UPDATE_MESSAGE", payload: message });
                updatedMessages++;
              }
            });
            
            if (hasNewMessages) {
              setTimeout(() => {
                scrollToBottom(true);
              }, 0);
            }
          
          }
        } catch (err) {
          console.error(`[FRONT_POLLING_ERRO][${timestamp}] Erro ao buscar mensagens recentes:`, err);
        } finally {
          isPollingActive = true;
        }
      };
      
      fetchLatestMessages();
    }, 5000);

    return () => {
      socket.off("appMessage", handleAppMessage);
      socket.off("messageReaction", handleMessageReaction);
      socket.off("connect");
      document.removeEventListener('newMessage', handleNewMessage);
      document.removeEventListener('updateMessage', handleUpdateMessage);
      clearInterval(refreshInterval);
      socket.emit("leaveChatBox", ticketId);
    };
  }, [ticketId, messagesList, scrollToBottom]);

  const renderReactions = (message) => {
    const reactions = message.reactions || {};
    const entries = Object.entries(reactions).filter(([, count]) => count > 0);
    if (entries.length === 0) return null;
    return (
      <span
        onClick={() => { setReactionsMessageId(message.id); setReactionsModalOpen(true); }}
        title={t("messageReactions.open", { defaultValue: "Ver reações" })}
        style={{ display: 'inline-flex', gap: 6, alignItems: 'center', marginRight: 6, cursor: 'pointer' }}
      >
        {entries.map(([emoji, count]) => (
          <span key={`${message.id}-${emoji}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(0,0,0,0.06)', borderRadius: 12, padding: '1px 6px', fontSize: 11
          }}>
            <span style={{ fontSize: 13 }}>{emoji}</span>
            <span>{count}</span>
          </span>
        ))}
      </span>
    );
  };

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const unsupportedMediaTypes = [
    "ciphertext",
    "list",
    "template_button_reply",
    "unknown",
    "buttons_response",
    "notification_template",
    "groups_v4_invite",
    "event_creation"
  ];

  const prevScrollTopRef = useRef(0);
  
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const prevScrollTop = prevScrollTopRef.current;

    const scrollPosition = scrollHeight - scrollTop - clientHeight;
    
    const isScrollingUp = scrollTop < prevScrollTop;
    
    prevScrollTopRef.current = scrollTop;
    
    if (isScrollingUp && scrollPosition > 300) {
      setIsViewingOldMessages(true);
      lastScrollUpTime.current = Date.now();
    }
    
    if (scrollPosition < 100) {
      setIsViewingOldMessages(false);
    }
    
    setShowScrollButton(scrollPosition > 100);
    
    setShouldAutoScroll(scrollPosition < 100);

    if (scrollTop === 0) {
      document.getElementById("messagesList").scrollTop = 1;
    }

    if (loading) {
      return;
    }

    if (!hasMore) return;
    if (scrollTop < 50) {
      loadMore();
    }
  };

  const handleOpenMessageOptionsMenu = (e, message) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedMessage(message);
  };

  const handleCloseMessageOptionsMenu = (e) => {
    setAnchorEl(null);
  };

  const processLocationMessage = (message) => {
    if (!message || !message.body) return message;
    
    if (message.mediaType !== "location") return message;
    
    const processedMessage = { ...message };
    
    try {
      const parts = message.body.split('|');
      if (parts.length < 2) return message;
      
      processedMessage.locationData = {
        image: parts[0],
        link: parts[1],
        description: parts.length > 2 ? parts[2] : null
      };
      
      processedMessage.body = "[Localização]";
      
      return processedMessage;
    } catch (error) {
      console.error("Erro ao processar mensagem de localização:", error);
      return message;
    }
  };

  const checkMessageMedia = (message) => {
    const processedMessage = processLocationMessage(message);
    
    if (processedMessage.mediaType === "location" && processedMessage.locationData) {
      try {
        const { image, link, description } = processedMessage.locationData;
        
        return (
          <div className="location-container" style={{ width: '100%' }}>
            <LocationPreview 
              image={image}
              link={link}
              description={description}
            />
          </div>
        );
      } catch (error) {
        console.error("Erro ao exibir localização:", error);
        return null;
      }
    }
    else if (message.mediaType === "vcard") {
      try {
        let contactData = message.body;
        let contact = "";
        let numbers = [];
        
        if (typeof contactData === 'string') {
          try {
            const parsedData = JSON.parse(contactData);
            contact = parsedData.name || "";
            
            if (parsedData.allNumbers && Array.isArray(parsedData.allNumbers)) {
              numbers = parsedData.allNumbers;
            } else if (parsedData.number) {
              numbers = [parsedData.number];
            }
          } catch (e) {
            const array = message.body.split("\n");
            const obj = [];
            for (let index = 0; index < array.length; index++) {
              const v = array[index];
              const values = v.split(":");
              for (let ind = 0; ind < values.length; ind++) {
                if (values[ind].indexOf("+") !== -1) {
                  obj.push({ number: values[ind] });
                }
                if (values[ind].indexOf("FN") !== -1) {
                  contact = values[ind + 1];
                }
              }
            }
            
            if (obj.length > 0) {
              numbers = obj.map(item => item.number);
            }
          }
        }
        
        return <VcardPreview contact={contact} numbers={numbers} />
      } catch (error) {
        console.error("Error processing vcard in MessagesList:", error);
        return <VcardPreview contact="Contato" numbers={["Número não disponível"]} />
      }
    }
    else if (message.mediaType === "multi_vcard") {
      if (message.body !== null && message.body !== "") {
        try {
          let contacts = message.body;

          if (typeof contacts === 'string') {
            try {
              contacts = JSON.parse(contacts);
            } catch (parseError) {
              console.error("Erro ao fazer parse do JSON:", parseError);
              const cleanContacts = contacts.replace(/\\n/g, '').replace(/\\r/g, '').replace(/\\\\/g, '').replace(/\\"/g, '"');
              try {
                contacts = JSON.parse(cleanContacts);
              } catch (cleanParseError) {
                console.error("Erro ao fazer parse do JSON após limpeza:", cleanParseError);
                return null;
              }
            }
          }

          if (!Array.isArray(contacts)) {
            console.warn("O corpo da mensagem não é um array, convertendo:", contacts);
            contacts = [contacts];
          }

          if (contacts.length > 0) {
            return (
              <Box sx={{
                display: "flex",
                justifyContent: message.fromMe ? "flex-end" : "flex-start",
                width: "100%"
              }}>
                <MultiVcardPreview contacts={contacts} timestamp={message.createdAt} />
              </Box>
            );
          }
        } catch (error) {
          console.error("Erro ao processar mensagem multi_vcard:", error);
        }
      }
    }
    else if (message.mediaType === "image") {
      return <ModalImageCors imageUrl={message.mediaUrl} isDeleted={message.isDeleted} />;
    } else if (message.mediaType === "audio") {
      return <Audio url={message.mediaUrl} />
    } else if (message.mediaType === "video") {
      return (
        <VideoStyled
          src={message.mediaUrl}
          controls
        />
      );
    } else {
      const filename = message.body || "documento";
      const docInfo = getDocumentInfo(filename, message.mediaType);
      const DocumentIconComponent = docInfo.icon;
      
      const fileSize = message.fileSize || null;
      const isPdf = docInfo.type === "PDF";
      
      return (
        <DocumentPreview>
          {/* Thumbnail/Preview do documento */}
          {isPdf && message.mediaUrl && (
            <DocumentThumbnail
              onClick={() => window.open(message.mediaUrl, '_blank')}
              sx={{ cursor: 'pointer' }}
            >
              <object
                data={message.mediaUrl}
                type="application/pdf"
                style={{
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <PictureAsPdf sx={{ fontSize: 64, color: '#d32f2f' }} />
                  <span style={{ fontSize: '12px', color: '#666' }}>Clique para visualizar</span>
                </Box>
              </object>
            </DocumentThumbnail>
          )}
          
          <DocumentHeader>
            <DocumentIcon>
              <DocumentIconComponent sx={{ fontSize: 28 }} />
            </DocumentIcon>
            <DocumentInfo>
              <DocumentName title={filename}>
                {filename}
              </DocumentName>
              <DocumentDetails>
                {docInfo.type && <span>{docInfo.type}</span>}
                {fileSize && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(fileSize)}</span>
                  </>
                )}
              </DocumentDetails>
            </DocumentInfo>
            <DocumentDownloadButton
              component="a"
              href={message.mediaUrl}
              target="_blank"
              download={filename}
              size="small"
            >
              <GetApp />
            </DocumentDownloadButton>
          </DocumentHeader>
        </DocumentPreview>
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "Tamanho desconhecido";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  const getDocumentInfo = (filename, mediaType) => {
    if (!filename) return { icon: InsertDriveFile, type: "Documento", pages: null };
    
    const ext = filename.split('.').pop().toLowerCase();
    
    if (ext === 'pdf') {
      return { icon: PictureAsPdf, type: "PDF", pages: null };
    } else if (['doc', 'docx'].includes(ext)) {
      return { icon: Description, type: "DOC", pages: null };
    } else if (['xls', 'xlsx'].includes(ext)) {
      return { icon: Description, type: "XLS", pages: null };
    } else if (['ppt', 'pptx'].includes(ext)) {
      return { icon: Description, type: "PPT", pages: null };
    } else if (['txt'].includes(ext)) {
      return { icon: Description, type: "TXT", pages: null };
    } else if (['zip', 'rar', '7z'].includes(ext)) {
      return { icon: InsertDriveFile, type: "ZIP", pages: null };
    }
    
    return { icon: InsertDriveFile, type: ext.toUpperCase(), pages: null };
  };

  const renderMessageAck = (message) => {
    // ACK_ERROR: -1
    // ACK_PENDING: 0
    // ACK_SERVER: 1
    // ACK_DEVICE: 2
    // ACK_READ: 3
    // ACK_PLAYED: 4
    
    if (!message.fromMe) {
      return null;
    }
    
    if (message.ack === -1) {
      return <Error fontSize="small" sx={{ fontSize: 16, verticalAlign: "middle", color: "red" }} />;
    }
    
    if (message.ack === 0) {
      return <AccessTime fontSize="small" sx={{ fontSize: 16, verticalAlign: "middle" }} />;
    }
    
    if (message.ack === 1) {
      return <Done fontSize="small" sx={{ fontSize: 16, verticalAlign: "middle" }} />;
    }
    
    if (message.ack === 2) {
      return <DoneAll fontSize="small" sx={{ fontSize: 16, verticalAlign: "middle" }} />;
    }
    
    if (message.ack === 3 || message.ack === 4) {
      return <DoneAll fontSize="small" sx={{ fontSize: 16, verticalAlign: "middle", color: blue[500] }} />;
    }
    
    return <AccessTime fontSize="small" sx={{ fontSize: 16, verticalAlign: "middle", color: "orange" }} />;
  };
  
  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return null;
    }

    const currentMessageDate = parseISO(message.createdAt);
    const previousMessage = messagesList[index - 1];
    
    if (!previousMessage) {
      return null;
    }

    const previousMessageDate = parseISO(previousMessage.createdAt);

    if (!isSameDay(currentMessageDate, previousMessageDate)) {
      let dateLabel = "";
      
      if (isToday(currentMessageDate)) {
        dateLabel = t("messagesList.message.today");
      } else if (isYesterday(currentMessageDate)) {
        dateLabel = t("messagesList.message.yesterday");
      } else {
        dateLabel = format(currentMessageDate, "dd/MM/yyyy", { locale: ptBR });
      }

      return (
        <DateSeparator key={`date-${message.id}`}>
          <span>{dateLabel}</span>
        </DateSeparator>
      );
    }

    if (index === messagesList.length - 1) {
      return (
        <div
          key={`ref-${message.createdAt}`}
          ref={lastMessageRef}
          style={{ float: "left", clear: "both" }}
        />
      );
    }

    return null;
  };

  const renderNumberTicket = (message, index) => {
    if (index < messagesList.length && index > 0) {
      let messageTicket = message.ticketId;
      let previousMessageTicket = messagesList[index - 1].ticketId;

      if (messageTicket !== previousMessageTicket) {
        return (
          <TicketNumber key={`ticket-${message.id}`}>
            {t("messagesList.message.ticketNumber")} {messageTicket}
            <hr />
          </TicketNumber>
        );
      }
    }
  };

  const renderMessageDivider = (message, index) => {
    if (index < messagesList.length && index > 0) {
      let messageUser = messagesList[index].fromMe;
      let previousMessageUser = messagesList[index - 1].fromMe;

      if (messageUser !== previousMessageUser) {
        return (
          <span style={{ marginTop: 16 }} key={`divider-${message.id}`}></span>
        );
      }
    }
  };

  const scrollToMessage = async (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      element.style.backgroundColor = theme.palette.primary.main;
      setTimeout(() => {
        element.style.backgroundColor = "";
      }, 2000);
      checkScroll();
    } else {
      try {
        setLoading(true);
        let currentPage = pageNumber;
        let messageFound = false;

        while (!messageFound && hasMore) {
          currentPage += 1;
          const { data } = await api.get("/messages/" + ticketId, {
            params: { pageNumber: currentPage }
          });

          if (data.messages.some(msg => msg.id === id)) {
            messageFound = true;
          }

          dispatch({ type: "LOAD_MESSAGES", payload: data.messages });
          setHasMore(data.hasMore);

          if (!data.hasMore && !messageFound) {
            break;
          }
        }

        setPageNumber(currentPage);
        setLoading(false);

        setTimeout(() => {
          const loadedElement = document.getElementById(id);
          if (loadedElement) {
            loadedElement.scrollIntoView({ behavior: 'smooth' });
            loadedElement.style.backgroundColor = theme.palette.primary.main;
            setTimeout(() => {
              loadedElement.style.backgroundColor = "";
            }, 2000);
            checkScroll();
          }
        }, 100);
      } catch (err) {
        setLoading(false);
        toastError(err);
      }
    }
  };

  const checkScroll = useCallback(() => {
    const messagesList = document.getElementById("messagesList");
    if (messagesList) {
      const { scrollTop, scrollHeight, clientHeight } = messagesList;
      const scrollPosition = scrollHeight - scrollTop - clientHeight;
      setShowScrollButton(scrollPosition > 100);
    }
  }, [setShowScrollButton]);

  useEffect(() => {
    if (!loading && messagesList.length > 0) {
      checkScroll();
      
      if (pageNumber === 1 && shouldAutoScroll) {
        setTimeout(() => {
          const messagesContainer = document.getElementById('messagesList');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 200);
      }
    }
  }, [loading, messagesList, checkScroll, pageNumber, shouldAutoScroll]);

  const renderQuotedMessage = (message) => {
    return (
      <div
        onClick={() => scrollToMessage(message.quotedMsg.id)}
        style={{
          margin: "3px 0px 6px 0px",
          overflow: "hidden",
          backgroundColor: message.fromMe ? "#cfe9ba" : "#f0f0f0",
          borderRadius: "7.5px",
          display: "flex",
          position: "relative",
          cursor: "pointer",
          fontSize: "13px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 1px 1px rgba(0, 0, 0, 0.1)"
        }}
      >
        <div
          style={{
            flex: "none",
            width: "4px",
            backgroundColor: message.quotedMsg?.fromMe ? "#35cd96" : "#6bcbef",
          }}
        ></div>
        <QuotedMsgStyled>
          <MessageContactNameStyled style={{ fontWeight: 'bold', color: message.quotedMsg?.fromMe ? '#35cd96' : '#6bcbef' }}>
            {!message.quotedMsg?.fromMe ? message.quotedMsg?.contact?.name : 'Você'}
          </MessageContactNameStyled>
          {message.quotedMsg.mediaType === "audio" && (
            <DownloadMedia>
              <audio controls>
                <source src={message.quotedMsg.mediaUrl} type="audio/ogg" />
              </audio>
            </DownloadMedia>
          )}
          {message.quotedMsg.mediaType === "video" && (
            <VideoStyled
              src={message.quotedMsg.mediaUrl}
              controls
            />
          )}
          {message.quotedMsg.mediaType === "application" && (
            <DocumentPreview style={{ maxWidth: "250px", minWidth: "200px" }}>
              <DocumentHeader style={{ padding: "8px" }}>
                <DocumentIcon style={{ width: "32px", height: "32px" }}>
                  <PictureAsPdf sx={{ fontSize: 20 }} />
                </DocumentIcon>
                <DocumentInfo>
                  <DocumentName style={{ fontSize: "12px" }} title={message.quotedMsg.body || "documento"}>
                    {message.quotedMsg.body || "documento"}
                  </DocumentName>
                </DocumentInfo>
              </DocumentHeader>
            </DocumentPreview>
          )}
          {message.quotedMsg.mediaType === "image" ? (
            <ModalImageCors imageUrl={message.quotedMsg.mediaUrl} />
          ) : (
            <div style={{ marginTop: '4px', color: 'rgba(0, 0, 0, 0.7)' }}>
              {message.quotedMsg?.body}
            </div>
          )}
        </QuotedMsgStyled>
      </div>

    );
  };

  const renderMessages = () => {
    if (messagesList.length > 0) {
      // Agrupar mensagens por albumId
      const albumGroups = {};
      const processedAlbumIds = new Set();
      
      messagesList.forEach((message) => {
        if (message.albumId && (message.mediaType === "image" || message.mediaType === "video")) {
          if (!albumGroups[message.albumId]) {
            albumGroups[message.albumId] = [];
          }
          albumGroups[message.albumId].push(message);
        }
      });

      const viewMessagesList = messagesList.map((message, index) => {
        // Se a mensagem faz parte de um álbum e ainda não foi processada
        if (message.albumId && albumGroups[message.albumId] && albumGroups[message.albumId].length > 1) {
          if (processedAlbumIds.has(message.albumId)) {
            // Já renderizamos este álbum, pular esta mensagem
            return null;
          }
          
          // Marcar este albumId como processado
          processedAlbumIds.add(message.albumId);
          
          // Renderizar o álbum completo
          const albumMessages = albumGroups[message.albumId];
          const firstMessage = albumMessages[0];
          
          if (!firstMessage.fromMe) {
            // Álbum recebido (esquerda)
            const isSelected = selectedMessages.some(msg => albumMessages.some(am => am.id === msg.id));
            return (
              <React.Fragment key={`album-${message.albumId}`}>
                {renderDailyTimestamps(firstMessage, index)}
                {renderMessageDivider(firstMessage, index)}
                {renderNumberTicket(firstMessage, index)}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    gap: isForwardingMode ? 1 : 0,
                    marginBottom: 1
                  }}
                >
                  {isForwardingMode && (
                    <Box
                      onClick={() => albumMessages.forEach(msg => handleMessageClick(msg))}
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: isSelected ? 'none' : '2px solid #8696a0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        marginTop: 1,
                        flexShrink: 0,
                        '&:hover': {
                          backgroundColor: isSelected ? '#00a884' : 'rgba(134, 150, 160, 0.1)',
                        }
                      }}
                    >
                      {isSelected && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                          <path
                            d="M4.5 6.5L1.5 3.5L0.5 4.5L4.5 8.5L11.5 1.5L10.5 0.5L4.5 6.5Z"
                            fill="white"
                            strokeWidth="1"
                          />
                        </svg>
                      )}
                    </Box>
                  )}
                  <MessageLeft 
                    id={firstMessage.id}
                    onClick={!isForwardingMode ? undefined : () => albumMessages.forEach(msg => handleMessageClick(msg))}
                    sx={{ 
                      cursor: isForwardingMode ? 'pointer' : 'default',
                      border: isSelected ? '2px solid #00a884' : 'none',
                      flex: 1
                    }}
                  >
                    {!isForwardingMode && (
                      <IconButtonStyled
                        variant="contained"
                        size="small"
                        id="messageActionsButton"
                        disabled={firstMessage.isDeleted}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMessageOptionsMenu(e, firstMessage);
                        }}
                      >
                        <ExpandMore />
                      </IconButtonStyled>
                    )}
                    {isGroup && (
                      <ContactImageContainer
                        onClick={() => onClick(firstMessage.contact)}
                        sx={{ cursor: "pointer" }}
                      >
                        <ContactImage src={firstMessage.contact.profilePicUrl || defaultImage} alt={firstMessage.contact?.name} />
                        <MessageContactNameStyled>
                          {firstMessage.contact?.name}
                        </MessageContactNameStyled>
                      </ContactImageContainer>
                    )}
                    <AlbumPreview messages={albumMessages} />
                    {firstMessage.body && firstMessage.body.trim() !== "" && (
                      <MessageItem message={firstMessage}>
                        <WhatsMarked sx={{ fontSize: 'inherit', lineHeight: 'inherit', display: 'flex', width: '100%' }}>
                          {firstMessage.body}
                        </WhatsMarked>
                      </MessageItem>
                    )}
                    {renderReactions(firstMessage)}
                    <MessageTimestamp>
                      {format(parseISO(firstMessage.createdAt), "HH:mm")}
                    </MessageTimestamp>
                  </MessageLeft>
                </Box>
              </React.Fragment>
            );
          } else {
            // Álbum enviado (direita)
            const isSelected = selectedMessages.some(msg => albumMessages.some(am => am.id === msg.id));
            return (
              <React.Fragment key={`album-${message.albumId}`}>
                {renderDailyTimestamps(firstMessage, index)}
                {renderMessageDivider(firstMessage, index)}
                {renderNumberTicket(firstMessage, index)}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start',
                    gap: isForwardingMode ? 1 : 0,
                    marginBottom: 1,
                    justifyContent: 'flex-end'
                  }}
                >
                  <MessageRight 
                    id={firstMessage.id}
                    onClick={!isForwardingMode ? undefined : () => albumMessages.forEach(msg => handleMessageClick(msg))}
                    sx={{ 
                      cursor: isForwardingMode ? 'pointer' : 'default',
                      border: isSelected ? '2px solid #00a884' : 'none',
                      flex: 1
                    }}
                  >
                    {!isForwardingMode && (
                      <IconButtonStyled
                        variant="contained"
                        size="small"
                        id="messageActionsButton"
                        disabled={firstMessage.isDeleted}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenMessageOptionsMenu(e, firstMessage);
                        }}
                      >
                        <ExpandMore />
                      </IconButtonStyled>
                    )}
                    <AlbumPreview messages={albumMessages} />
                    {firstMessage.body && firstMessage.body.trim() !== "" && (
                      <MessageItem message={firstMessage}>
                        <WhatsMarked sx={{ fontSize: 'inherit', lineHeight: 'inherit', display: 'flex', width: '100%' }}>
                          {firstMessage.body}
                        </WhatsMarked>
                      </MessageItem>
                    )}
                    {renderReactions(firstMessage)}
                    <MessageTimestamp>
                      {renderMessageAck(firstMessage)}
                      {format(parseISO(firstMessage.createdAt), "HH:mm")}
                    </MessageTimestamp>
                  </MessageRight>
                  {isForwardingMode && (
                    <Box
                      onClick={() => albumMessages.forEach(msg => handleMessageClick(msg))}
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: isSelected ? 'none' : '2px solid #8696a0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        marginTop: 1,
                        flexShrink: 0,
                        backgroundColor: isSelected ? '#00a884' : 'transparent',
                        '&:hover': {
                          backgroundColor: isSelected ? '#00a884' : 'rgba(134, 150, 160, 0.1)',
                        }
                      }}
                    >
                      {isSelected && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                          <path
                            d="M4.5 6.5L1.5 3.5L0.5 4.5L4.5 8.5L11.5 1.5L10.5 0.5L4.5 6.5Z"
                            fill="white"
                            strokeWidth="1"
                          />
                        </svg>
                      )}
                    </Box>
                  )}
                </Box>
              </React.Fragment>
            );
          }
        }
        
        // Renderização normal para mensagens que não são álbuns
        if (message.mediaType === "event") {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              <SystemMessage>
                {message.body}
              </SystemMessage>
            </React.Fragment>
          );
        }
        if (message.mediaType === "poll" || message.mediaType === "poll_creation") {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              {renderNumberTicket(message, index)}
              <div style={{ 
                display: 'flex', 
                justifyContent: message.fromMe ? 'flex-end' : 'flex-start',
                padding: '8px 16px'
              }}>
                <PollMessage message={message} />
              </div>
            </React.Fragment>
          );
        }
        if (message.mediaType === "call_log") {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              {renderNumberTicket(message, index)}
              <MessageCenter id={message.id}>
                <IconButtonStyled
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButtonStyled>
                {isGroup && (
                  <ContactImageContainer
                    onClick={() => onClick(message.contact)}
                    sx={{ cursor: "pointer" }}
                  >                    
                    <ContactImage src={message.contact.profilePicUrl || defaultImage} alt={message.contact?.name} />
                    <MessageContactNameStyled>
                      {message.contact?.name}
                    </MessageContactNameStyled>
                  </ContactImageContainer>
                )}
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 17" width="20" height="17">
                    <path fill="#df3333" d="M18.2 12.1c-1.5-1.8-5-2.7-8.2-2.7s-6.7 1-8.2 2.7c-.7.8-.3 2.3.2 2.8.2.2.3.3.5.3 1.4 0 3.6-.7 3.6-.7.5-.2.8-.5.8-1v-1.3c.7-1.2 5.4-1.2 6.4-.1l.1.1v1.3c0 .2.1.4.2.6.1.2.3.3.5.4 0 0 2.2.7 3.6.7.2 0 1.4-2 .5-3.1zM5.4 3.2l4.7 4.6 5.8-5.7-.9-.8L10.1 6 6.4 2.3h2.5V1H4.1v4.8h1.3V3.2z"></path>
                  </svg>
                  <span>{t("messagesList.message.voiceVideoLost")} {format(parseISO(message.createdAt), "HH:mm")}</span>
                </div>
              </MessageCenter>
            </React.Fragment>
          );
        }
        if (unsupportedMediaTypes.includes(message.mediaType)) {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              {renderNumberTicket(message, index)}
              <MessageLeft id={message.id} sx={{ backgroundColor: "#E1F5FEEB" }}>
                {isGroup && (
                  <ContactImageContainer
                    onClick={() => onClick(message.contact)}
                    sx={{ cursor: "pointer" }}
                  >
                    <ContactImage src={message.contact.profilePicUrl || defaultImage} alt={message.contact?.name} />
                    <MessageContactNameStyled>
                      {message.contact?.name}
                    </MessageContactNameStyled>
                  </ContactImageContainer>
                )}
                <b>{t("messagesList.message.type")}</b>: <i>{message.mediaType}</i> <br />
                {t("messagesList.message.notCompatibleWithSystem")} <br />
                {t("messagesList.message.viewOnMobile")} <br />
                {renderReactions(message)}
                <MessageTimestamp>
                  {format(parseISO(message.createdAt), "HH:mm")}
                </MessageTimestamp>
              </MessageLeft>
            </React.Fragment>
          );
        }
        if (!message.fromMe) {
          const isSelected = selectedMessages.some(msg => msg.id === message.id);
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              {renderNumberTicket(message, index)}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  gap: isForwardingMode ? 1 : 0,
                  marginBottom: 1
                }}
              >
                {isForwardingMode && (
                  <Box
                    onClick={() => handleMessageClick(message)}
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: isSelected ? 'none' : '2px solid #8696a0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      marginTop: 1,
                      flexShrink: 0,
                      '&:hover': {
                        backgroundColor: isSelected ? '#00a884' : 'rgba(134, 150, 160, 0.1)',
                      }
                    }}
                  >
                    {isSelected && (
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                        <path
                          d="M4.5 6.5L1.5 3.5L0.5 4.5L4.5 8.5L11.5 1.5L10.5 0.5L4.5 6.5Z"
                          fill="white"
                          strokeWidth="1"
                        />
                      </svg>
                    )}
                  </Box>
                )}
                <MessageLeft 
                  id={message.id}
                  onClick={!isForwardingMode ? undefined : () => handleMessageClick(message)}
                  sx={{ 
                    cursor: isForwardingMode ? 'pointer' : 'default',
                    border: isSelected ? '2px solid #00a884' : 'none',
                    flex: 1
                  }}
                >
                {!isForwardingMode && (
                  <IconButtonStyled
                    variant="contained"
                    size="small"
                    id="messageActionsButton"
                    disabled={message.isDeleted}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenMessageOptionsMenu(e, message);
                    }}
                  >
                    <ExpandMore />
                  </IconButtonStyled>
                )}
                {isGroup && (
                  <ContactImageContainer
                    onClick={() => onClick(message.contact)}
                    sx={{ cursor: "pointer" }}
                  >
                    <ContactImage src={message.contact.profilePicUrl || defaultImage} alt={message.contact?.name} />
                    <MessageContactNameStyled>
                      {message.contact?.name}
                    </MessageContactNameStyled>
                  </ContactImageContainer>
                )}
                {message.isDeleted && (
                  <div>
                    <span style={{ color: red[200] }}>
                      <Block
                        sx={{
                          fontSize: 18,
                          verticalAlign: "middle",
                          marginRight: 4,
                          color: red[200]
                        }}
                      />
                      <WhatsMarked>{t("messagesList.message.deleted")}</WhatsMarked>
                    </span>
                  </div>
                )}
                {(message.mediaUrl || message.mediaType === "location" || message.mediaType === "vcard"
                  || message.mediaType === "multi_vcard"
                ) && checkMessageMedia(message)}
                <MessageItem message={message}>
                  {message.quotedMsg && <div style={{ marginBottom: '8px' }}>{renderQuotedMessage(message)}</div>}

                  {message.mediaType !== "multi_vcard" && message.mediaType !== "location" && message.mediaType !== "vcard" && <WhatsMarked sx={{ fontSize: 'inherit', lineHeight: 'inherit', display: 'flex', width: '100%' }}>{message.body}</WhatsMarked>}
                  {renderReactions(message)}
                  <MessageTimestamp>
                    {message.isEdited && <span>{t("messagesList.message.edited")} </span>}
                    {format(parseISO(message.createdAt), "HH:mm")}
                  </MessageTimestamp>
                </MessageItem>
              </MessageLeft>
              </Box>
            </React.Fragment>
          );
        }
        const isSelected = selectedMessages.some(msg => msg.id === message.id);
        return (
          <React.Fragment key={message.id}>
            {renderDailyTimestamps(message, index)}
            {renderMessageDivider(message, index)}
            {renderNumberTicket(message, index)}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: isForwardingMode ? 1 : 0,
                marginBottom: 1,
                justifyContent: 'flex-end'
              }}
            >
              <MessageRight 
                id={message.id}
                onClick={!isForwardingMode ? undefined : () => handleMessageClick(message)}
                sx={{ 
                  cursor: isForwardingMode ? 'pointer' : 'default',
                  border: isSelected ? '2px solid #00a884' : 'none',
                  flex: 1
                }}
              >
                {!isForwardingMode && (
                  <IconButtonStyled
                    variant="contained"
                    size="small"
                    id="messageActionsButton"
                    disabled={message.isDeleted}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenMessageOptionsMenu(e, message);
                    }}
                  >
                    <ExpandMore />
                  </IconButtonStyled>
                )}
                {message.isDeleted && (
                  <div>
                    <span style={{ color: red[200] }}>
                      <Block
                        sx={{
                          fontSize: 18,
                          verticalAlign: "middle",
                          marginRight: 4,
                          color: red[200]
                        }}
                      />
                      <WhatsMarked>{t("messagesList.message.deleted")}</WhatsMarked>
                    </span>
                  </div>
                )}
                {(message.mediaUrl || message.mediaType === "location" || message.mediaType === "vcard"
                  || message.mediaType === "multi_vcard"
                ) && checkMessageMedia(message)}
                <MessageItem message={message}>
                  {message.quotedMsg && <div style={{ marginBottom: '8px' }}>{renderQuotedMessage(message)}</div>}
                  {message.mediaType !== "multi_vcard" && message.mediaType !== "location" && message.mediaType !== "vcard" && <WhatsMarked sx={{ fontSize: 'inherit', lineHeight: 'inherit', display: 'flex', width: '100%' }}>{message.body}</WhatsMarked>}
                  {renderReactions(message)}
                  <MessageTimestamp>
                    {message.isEdited && <span>{t("messagesList.message.edited")} </span>}
                    {format(parseISO(message.createdAt), "HH:mm")}
                    {renderMessageAck(message)}
                  </MessageTimestamp>
                </MessageItem>
              </MessageRight>
              {isForwardingMode && (
                <Box
                  onClick={() => handleMessageClick(message)}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: isSelected ? 'none' : '2px solid #8696a0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginTop: 1,
                    flexShrink: 0,
                    '&:hover': {
                      backgroundColor: isSelected ? '#00a884' : 'rgba(134, 150, 160, 0.1)',
                    }
                  }}
                >
                  {isSelected && (
                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                      <path
                        d="M4.5 6.5L1.5 3.5L0.5 4.5L4.5 8.5L11.5 1.5L10.5 0.5L4.5 6.5Z"
                        fill="white"
                        strokeWidth="1"
                      />
                    </svg>
                  )}
                </Box>
              )}
            </Box>
          </React.Fragment>
        );
      });
      // Filtrar mensagens null (álbuns já processados)
      return viewMessagesList.filter(msg => msg !== null);
    } else {
      return <div>Say hello to your new contact!</div>;
    }
  };

  return (
    <MessagesListWrapper>
      <MessageOptionsMenu
        message={selectedMessage}
        anchorEl={anchorEl}
        menuOpen={messageOptionsMenuOpen}
        handleClose={handleCloseMessageOptionsMenu}
      />
      <MessagesListStyled
        id="messagesList"
        className="messages-list-scrollable"
        onScroll={handleScroll}
      >
        {messagesList.length > 0 ? renderMessages() : []}
        <div ref={lastMessageRef} />
      </MessagesListStyled>
      <ScrollToBottomButton
        onClick={() => {
          const messagesContainer = document.querySelector('.messages-list-scrollable');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
          setIsViewingOldMessages(false);
        }}
        size="small"
        sx={{ display: showScrollButton ? "flex" : "none" }}
      >
        <KeyboardArrowDown />
      </ScrollToBottomButton>
      {loading && (
        <div>
          <CircularProgressStyled />
        </div>
      )}
      
      <ForwardingBar
        isVisible={isForwardingMode}
        selectedCount={selectedMessages.length}
        onClose={handleExitForwardingMode}
        onForward={handleOpenForwardModal}
      />
      
      <ForwardMessageModal
        open={forwardModalOpen}
        onClose={handleCloseForwardModal}
        selectedMessages={selectedMessages}
      />

      <MessageReactionsModal
        open={reactionsModalOpen}
        onClose={() => setReactionsModalOpen(false)}
        messageId={reactionsMessageId}
        t={t}
      />
    </MessagesListWrapper>

  );
};

export default MessagesList;