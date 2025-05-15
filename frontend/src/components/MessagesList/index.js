import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  styled
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
  ExpandMore,
  GetApp,
  KeyboardArrowDown
} from "@mui/icons-material";

import {
  format,
  isSameDay,
  parseISO
} from "date-fns";
import React, { useEffect, useReducer, useRef, useState } from "react";
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
import { useTheme } from "@mui/material/styles";

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
  backgroundColor: "#ffffff",
  color: "#303030",
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
  backgroundColor: "rgba(0, 0, 0, 0.05)",
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
    backgroundColor: "#dcf8c6",
    color: "#303030",
    alignSelf: "flex-end",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 0,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 5,
    paddingBottom: 0,
    boxShadow: theme.mode === "light" ? "0 1px 1px #b3b3b3" : "0 1px 1px #000000",
    transition: "background-color 0.5s ease-in-out",
    fontSize: "14px",
    wordBreak: "break-word",
}));

const IconButtonStyled = styled(IconButton)(({ theme }) => ({
  display: "none",
  position: "relative",
  color: "#999",
  zIndex: 1,
  backgroundColor: "inherit",
  opacity: "90%",
  "&:hover, &.Mui-focusVisible": { backgroundColor: "inherit" },
}))

const MessageContactNameStyled = styled("span")(({ theme }) => ({
  display: "flex",
  color: "#6bcbef",
  fontWeight: 500,
  fontSize: "13px",
  marginBottom: "3px",
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
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
}));

const MessageTimestamp = styled("span")(({ theme }) => ({
  fontSize: 11,
  position: "absolute",
  bottom: 0,
  right: 5,
  color: "#999",
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

const DailyTimestamp = styled("span")(({ theme }) => ({
  alignItems: "center",
    textAlign: "center",
    alignSelf: "center",
    width: "110px",
    backgroundColor: "#e1f3fb",
    margin: "10px auto",
    borderRadius: "10px",
    boxShadow: "0 1px 1px #b3b3b3",
    fontSize: "13px",
    display: "flex",
    justifyContent: "center",
}));

const DailyTimestampText = styled("div")(({ theme }) => ({
  color: "#808888",
  padding: 8,
  alignSelf: "center",
  marginLeft: "0px",
}));

const DownloadMedia = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "inherit",
  padding: 10,
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
    0% { background-color: rgba(0, 128, 0, 0.2); }
    100% { background-color: transparent; }
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
      const messageIndex = state.findIndex((m) => m.id === message.id);
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
    const messageIndex = state.findIndex((m) => m.id === newMessage.id);

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
    const messageToUpdate = action.payload;

    const messageIndex = state.findIndex((m) => m.id === messageToUpdate.id);

    if (messageToUpdate.isDeleted === true) {
      toast.info(<ToastDisplay
        body={messageToUpdate.body}
      />);
    }

    if (messageIndex !== -1) {
      state[messageIndex] = messageToUpdate;
    }

    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MessagesList = ({ ticketId, isGroup }) => {
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
  const theme = useTheme();

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);

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
          }

        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };
      fetchMessages();
    }, 500);
    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [pageNumber, ticketId]);

  useEffect(() => {
    const processMessage = (data) => {
      console.log("Mensagem recebida via socket:", data.action, data.message?.id, data);
      
      const messageTicketId = data.ticket?.id || data.message?.ticketId;
      
      if (messageTicketId && parseInt(messageTicketId) === parseInt(ticketId)) {
        if (data.action === "create") {
          const messageExists = messagesList.some(m => m.id === data.message.id);
          
          if (!messageExists) {
            console.log("Adicionando nova mensagem via socket:", data.message.id);
            
            dispatch({ type: "ADD_MESSAGE", payload: data.message });
            
            setTimeout(() => {
              scrollToBottom(true);
              
              const messageElement = document.getElementById(data.message.id);
              if (messageElement) {
                messageElement.classList.add("highlight-new-message");
                setTimeout(() => {
                  messageElement.classList.remove("highlight-new-message");
                }, 2000);
              }
            }, 0);
          }
        }

        if (data.action === "update") {
          dispatch({ type: "UPDATE_MESSAGE", payload: data.message });
        }
      }
    };
    
    const socket = openSocket();
    
    if (!socket) {
      console.error("Não foi possível conectar ao socket");
      return;
    }

    if (socket.connected) {
      console.log("Socket já conectado, entrando no chatbox:", ticketId);
      socket.emit("joinChatBox", ticketId);
    } else {
      socket.on("connect", () => {
        console.log("Socket conectado, entrando no chatbox:", ticketId);
        socket.emit("joinChatBox", ticketId);
      });
    }

    socket.off("appMessage");
    socket.on("appMessage", processMessage);

    const handleNewMessage = (event) => {
      const { message, ticketId: messageTicketId } = event.detail;
      
      if (parseInt(messageTicketId) === parseInt(ticketId)) {
        console.log("Mensagem recebida via evento personalizado:", message);
        
        const messageExists = messagesList.some(m => m.id === message.id);
        
        if (!messageExists) {
          dispatch({ type: "ADD_MESSAGE", payload: message });
          
          setTimeout(() => {
            scrollToBottom(true);
          }, 0);
        }
      }
    };
    
    document.addEventListener('newMessage', handleNewMessage);

    const refreshInterval = setInterval(() => {
      const fetchLatestMessages = async () => {
        try {
          const { data } = await api.get(`/messages/${ticketId}`, {
            params: { pageNumber: 1 }
          });
          
          if (data && data.messages && data.messages.length > 0) {
            let hasNewMessages = false;
            
            data.messages.forEach(message => {
              const messageExists = messagesList.some(m => m.id === message.id);
              
              if (!messageExists) {
                console.log("Adicionando mensagem da verificação periódica:", message.id);
                dispatch({ type: "ADD_MESSAGE", payload: message });
                hasNewMessages = true;
              }
            });
            
            if (hasNewMessages) {
              setTimeout(() => {
                scrollToBottom(true);
              }, 0);
            }
          }
        } catch (err) {
          console.error("Erro ao buscar mensagens recentes:", err);
        }
      };
      
      fetchLatestMessages();
    }, 3000);

    return () => {
      console.log("Desconectando socket do chatbox:", ticketId);
      socket.off("appMessage");
      socket.off("connect");
      document.removeEventListener('newMessage', handleNewMessage);
      clearInterval(refreshInterval);
      socket.emit("leaveChatBox", ticketId);
    };
  }, [ticketId]);

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [isViewingOldMessages, setIsViewingOldMessages] = useState(false);
  const lastScrollUpTime = useRef(0);
  
  const scrollToBottom = (force = false) => {
    const scrollUpTimeElapsed = Date.now() - lastScrollUpTime.current > 5000;
    
    if (((force && scrollUpTimeElapsed) || shouldAutoScroll) && !isViewingOldMessages && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const unsupportedMediaTypes = [
    "ciphertext",
    "list",
    "template_button_reply",
    "unknown",
    "buttons_response",
    "notification_template",
    "groups_v4_invite",
    "poll_creation",
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
      return (
        <>
          <DownloadMedia>
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={message.mediaUrl}
            >
              {t("messagesList.message.download")}
            </Button>
          </DownloadMedia>
          <Divider />
        </>
      );
    }
  };

  const renderMessageAck = (message) => {
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
  };

  const renderDailyTimestamps = (message, index) => {
    if (index === 0) {
      return (
        <DailyTimestamp key={`timestamp-${message.id}`}>
          <DailyTimestampText>
            {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
          </DailyTimestampText>
        </DailyTimestamp>
      );
    }
    if (index < messagesList.length - 1) {
      let messageDay = parseISO(messagesList[index].createdAt);
      let previousMessageDay = parseISO(messagesList[index - 1].createdAt);

      if (!isSameDay(messageDay, previousMessageDay)) {
        return (
          <DailyTimestamp key={`timestamp-${message.id}`}>
            <DailyTimestampText>
              {format(parseISO(messagesList[index].createdAt), "dd/MM/yyyy")}
            </DailyTimestampText>
          </DailyTimestamp>
        );
      }
    }
    if (index === messagesList.length - 1) {
      return (
        <div
          key={`ref-${message.createdAt}`}
          ref={lastMessageRef}
          sx={{ float: "left", clear: "both" }}
        />
      );
    }
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

  const checkScroll = () => {
    const messagesList = document.getElementById("messagesList");
    if (messagesList) {
      const { scrollTop, scrollHeight, clientHeight } = messagesList;
      const scrollPosition = scrollHeight - scrollTop - clientHeight;
      setShowScrollButton(scrollPosition > 100);
    }
  };

  useEffect(() => {
    if (!loading && messagesList.length > 0) {
      checkScroll();
    }
  }, [loading, messagesList]);

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
          }}></div>
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
            <DownloadMedia>
              <Button
                startIcon={<GetApp />}
                color="primary"
                variant="outlined"
                target="_blank"
                href={message.quotedMsg.mediaUrl}
              >
                {t("messagesList.message.download")}
              </Button>
            </DownloadMedia>
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
      const viewMessagesList = messagesList.map((message, index) => {
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
                  <MessageContactNameStyled>
                    {message.contact?.name}
                  </MessageContactNameStyled>
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
                  <MessageContactNameStyled>
                    {message.contact?.name}
                  </MessageContactNameStyled>
                )}
                <b>{t("messagesList.message.type")}</b>: <i>{message.mediaType}</i> <br />
                {t("messagesList.message.notCompatibleWithSystem")} <br />
                {t("messagesList.message.viewOnMobile")} <br />
                <MessageTimestamp>
                  {format(parseISO(message.createdAt), "HH:mm")}
                </MessageTimestamp>
              </MessageLeft>
            </React.Fragment>
          );
        }
        if (!message.fromMe) {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              {renderNumberTicket(message, index)}
              <MessageLeft id={message.id}>
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
                  <MessageContactNameStyled>
                    {message.contact?.name}
                  </MessageContactNameStyled>
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
                  <MessageTimestamp>
                    {message.isEdited && <span>{t("messagesList.message.edited")} </span>}
                    {format(parseISO(message.createdAt), "HH:mm")}
                  </MessageTimestamp>
                </MessageItem>
              </MessageLeft>
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment key={message.id}>
              {renderDailyTimestamps(message, index)}
              {renderMessageDivider(message, index)}
              {renderNumberTicket(message, index)}
              <MessageRight id={message.id}>
                <IconButtonStyled
                  variant="contained"
                  size="small"
                  id="messageActionsButton"
                  disabled={message.isDeleted}
                  onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
                >
                  <ExpandMore />
                </IconButtonStyled>
                {(message.mediaUrl || message.mediaType === "location" || message.mediaType === "vcard"
                  || message.mediaType === "multi_vcard"
                ) && checkMessageMedia(message)}
                <MessageItem message={message}>
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
                  {message.quotedMsg && <div style={{ marginBottom: '8px' }}>{renderQuotedMessage(message)}</div>}
                  {message.mediaType !== "multi_vcard" && message.mediaType !== "location" && message.mediaType !== "vcard" && <WhatsMarked sx={{ fontSize: 'inherit', lineHeight: 'inherit', display: 'flex', width: '100%' }}>{message.body}</WhatsMarked>}
                  <MessageTimestamp>
                    {message.isEdited && <span>{t("messagesList.message.edited")} </span>}
                    {format(parseISO(message.createdAt), "HH:mm")}
                    {renderMessageAck(message)}
                  </MessageTimestamp>
                </MessageItem>
              </MessageRight>
            </React.Fragment>
          );
        }
      });
      return viewMessagesList;
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
          setIsViewingOldMessages(false);
          scrollToBottom(true);
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
    </MessagesListWrapper>
  );
};

export default MessagesList;