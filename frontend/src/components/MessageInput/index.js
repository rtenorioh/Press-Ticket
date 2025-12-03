import {
  Box,
  CircularProgress,
  ClickAwayListener,
  FormControlLabel,
  Hidden,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Tooltip,
  Fade
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  AttachFile,
  CheckCircleOutline,
  Clear,
  Code,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  HighlightOff,
  Mic,
  Mood,
  MoreVert,
  Send
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import MicRecorder from "mic-recorder-to-mp3";
import PropTypes from "prop-types";
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback
} from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import UploadModal from "../UploadModal";
import AttachmentMenu from "../AttachmentMenu";
import PollCreator from "../PollCreator";
import toastError from "../../errors/toastError";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import api from "../../services/api";
import openSocket from "../../services/socket-io";
import RecordingTimer from "./RecordingTimer";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const MainWrapper = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? theme.palette.background.paper : "#f5f5f5",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderTop: `1px solid ${theme.palette.divider}`,
  borderRadius: 0,
  [theme.breakpoints.down('sm')]: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    zIndex: 10,
  },
}));

const DropInfo = styled(Box)(({ theme, show }) => ({
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: 16,
  left: 0,
  right: 0,
  borderRadius: "8px 8px 0 0",
  boxShadow: theme.shadows[3],
  transition: "all 0.3s ease",
  position: "absolute",
  top: 0,
  zIndex: 10,
  ...(show ? {
    opacity: 1,
    transform: "translateY(0)",
  } : { 
    display: "none",
    opacity: 0,
    transform: "translateY(20px)"
  }),
}));

const FormatMenu = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderRadius: 8,
  boxShadow: theme.shadows[3],
  padding: '6px 10px',
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  zIndex: 1200,
  border: `1px solid ${theme.palette.divider}`,
  '& .MuiIconButton-root': {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
    }
  },
}));

const NewMessageBox = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  width: "100%",
  display: "flex",
  padding: "10px 12px",
  alignItems: "center",
  gap: "8px",
  '& .MuiIconButton-root': {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
    }
  },
  '& .MuiIconButton-root.Mui-disabled': {
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
  }
}));

const InputWrapper = styled(Box)(({ theme }) => ({
  padding: '8px 12px',
  background: theme.palette.background.paper,
  display: "flex",
  borderRadius: 12,
  flex: 1,
  position: "relative",
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
  },
}));

const InputBaseStyled = styled(InputBase)(({ theme }) => ({
  flex: 1,
  width: "100%",
  padding: '0 4px',
  fontSize: '0.95rem',
  '& .MuiInputBase-input': {
    padding: '4px 0',
  },
}));

const EmojiBoxStyled = styled(Box)(({ theme}) => ({
  position: "absolute",
  bottom: 63,
  left: 0,
  zIndex: 1100,
  borderRadius: 8,
  boxShadow: theme.shadows[4],
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
}));

const RecorderWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
}));

const ReplyingMsgWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 12px",
}));

const ReplyingMsgContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  marginRight: 8,
  overflowY: "hidden",
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
  borderRadius: 8,
  display: "flex",
  position: "relative",
  maxHeight: "80px",
}));

const ReplyingMsgBody = styled(Box)(({ theme }) => ({
  padding: 10,
  height: "auto",
  display: "block",
  whiteSpace: "pre-wrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: '0.9rem',
}));

const SideColor = styled(Box)(({ theme, messageFromMe }) => ({
  backgroundColor: messageFromMe ? theme.palette.success.main : theme.palette.primary.main,
  flex: "none",
  width: "4px",
  borderRadius: "4px 0 0 4px",
}));
  
const MessageContactName = styled(Box)(({ theme }) => ({
  display: "flex",
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '0.85rem',
  marginBottom: 2,
}));

const MessageQuickAnswersWrapper = styled('ul')(({ theme }) => ({
  margin: 0,
  position: "absolute",
  bottom: "60px",
  background: theme.palette.background.paper,
  padding: 0,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  left: 0,
  width: "100%",
  maxHeight: "350px",
  overflowY: "auto",
  boxShadow: theme.shadows[3],
  zIndex: 1050,
  "& li": {
    listStyle: "none",
    "& a": {
      display: "block",
      padding: "10px 12px",
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      fontSize: '0.9rem',
      color: theme.palette.text.primary,
      borderBottom: `1px solid ${theme.palette.divider}`,
      transition: 'all 0.2s ease',
      "&:hover": {
        background: theme.palette.action.hover,
        cursor: "pointer",
      },
    },
    "&:last-child a": {
      borderBottom: "none",
    },
  },
  scrollbarWidth: "thin",
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    borderRadius: '3px',
  },
}));

const MentionsListWrapper = styled('ul')(({ theme }) => ({
  margin: 0,
  position: "absolute",
  bottom: "60px",
  background: theme.palette.background.paper,
  padding: 0,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  left: 0,
  width: "100%",
  maxHeight: "300px",
  overflowY: "auto",
  boxShadow: theme.shadows[3],
  zIndex: 1060,
  "& li": {
    listStyle: "none",
    "& a": {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "10px 12px",
      fontSize: '0.9rem',
      color: theme.palette.text.primary,
      borderBottom: `1px solid ${theme.palette.divider}`,
      transition: 'all 0.2s ease',
      "&:hover": {
        background: theme.palette.action.hover,
        cursor: "pointer",
      },
      "& .mention-avatar": {
        width: 36,
        height: 36,
        borderRadius: '50%',
        objectFit: 'cover',
        backgroundColor: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 600,
        fontSize: '0.9rem',
      },
      "& .mention-info": {
        flex: 1,
        overflow: 'hidden',
        "& .mention-name": {
          fontWeight: 500,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        "& .mention-number": {
          fontSize: '0.8rem',
          color: theme.palette.text.secondary,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },
    },
    "&:last-child a": {
      borderBottom: "none",
    },
  },
  scrollbarWidth: "thin",
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    borderRadius: '3px',
  },
}));

const MessageInput = ({ ticketStatus }) => {
  const { ticketId } = useParams();
  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [quickAnswers, setQuickAnswer] = useState([]);
  const [typeBar, setTypeBar] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionsList, setMentionsList] = useState([]);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const [selectedMentions, setSelectedMentions] = useState([]);
  const inputRef = useRef();
  const [onDragEnter, setOnDragEnter] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [attachmentMenuAnchor, setAttachmentMenuAnchor] = useState(null);
  const { setReplyingMessage, replyingMessage } = useContext(ReplyMessageContext);
  const { setEditingMessage, editingMessage } = useContext(EditMessageContext);
  const { user = {} } = useContext(AuthContext);
  const [settings, setSettings] = useState([]);
  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);
  const [channelType, setChannelType] = useState(null);
  const [contactId, setContactId] = useState(null);
  const [isContactBlocked, setIsContactBlocked] = useState(false);
  const [isGroup, setIsGroup] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [initialCaption, setInitialCaption] = useState("");
  const [showPollCreator, setShowPollCreator] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  const mainWrapperRef = useRef(null);
  const waveformCanvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  const streamRef = useRef(null);
  const levelRef = useRef(0);

  useEffect(() => {
    const handleClickAway = (event) => {
      const menu = document.getElementById('format-menu');
      if (menu && !menu.contains(event.target)) {
        menu.style.display = 'none';
      }
    };
    document.addEventListener('mousedown', handleClickAway);
    return () => document.removeEventListener('mousedown', handleClickAway);
  }, []);

  useEffect(() => {
    inputRef.current.focus();
  }, [replyingMessage, editingMessage]);

  useEffect(() => {
    return () => {
      try { stopAudioVisualizer(); } catch (_) {}
    };
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);
      } catch (err) {
        console.error(err);
        toastError(err);
        setSettings([]);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (editingMessage) {
      setInputMessage(editingMessage.body || "");
    } else {
      setInputMessage("");
    }
  }, [editingMessage]);

  useEffect(() => {
    const fetchTicketAndStatus = async () => {
      try {
        const { data } = await api.get(`/tickets/${ticketId}`);
        setChannelType(data.whatsapp?.type);
        const cId = data.contact?.id;
        setContactId(cId || null);
        
        const isGroupChat = Boolean(data.contact?.isGroup);
        setIsGroup(isGroupChat);
        if (isGroupChat) {
          const gId = data.contact?.number || data.contact?.remoteJid;
          setGroupId(gId);
          if (gId) {
            try {
              const { data: groupData } = await api.get(`/groups/${encodeURIComponent(gId)}/participants`);
              setMentionsList(groupData.participants || []);
            } catch (err) {
              console.error("Erro ao carregar participantes:", err);
              setMentionsList([]);
            }
          }
        } else {
          setMentionsList([]);
        }
        
        if (cId && !isGroupChat) {
          try {
            const { data: status } = await api.get(`/contacts/${cId}/block-status`);
            setIsContactBlocked(Boolean(status?.isBlocked));
          } catch (_) {
            setIsContactBlocked(false);
          }
        } else {
          setIsContactBlocked(false);
        }
      } catch (err) {
        toastError(err, t);
      }
    };

    fetchTicketAndStatus();
  }, [ticketId]);

  const refreshBlockedStatus = useCallback(async () => {
    if (!contactId || isGroup) return;
    try {
      const { data } = await api.get(`/contacts/${contactId}/block-status`);
      setIsContactBlocked(Boolean(data?.isBlocked));
    } catch (_) {}
  }, [contactId, isGroup]);

  useEffect(() => {
    let intervalId;

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshBlockedStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    intervalId = setInterval(refreshBlockedStatus, 10000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (intervalId) clearInterval(intervalId);
    };
  }, [contactId, refreshBlockedStatus]);

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      setInputMessage("");
      setShowEmoji(false);
      setMedias([]);
      setReplyingMessage(null);
      setEditingMessage(null);
    };
  }, [ticketId, setReplyingMessage, setEditingMessage]);

  useEffect(() => {
    let timeout;
    if (onDragEnter) {
      timeout = setTimeout(() => {
        setOnDragEnter(false);
      }, 5000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [onDragEnter]);
  
  useEffect(() => {
    const wrapper = mainWrapperRef.current;
    if (!wrapper) return;
    
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOnDragEnter(true);
    };
    
    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        e.relatedTarget === null ||
        !wrapper.contains(e.relatedTarget)
      ) {
        setOnDragEnter(false);
      }
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOnDragEnter(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        setMedias(droppedFiles);
        setShowUploadModal(true);
      }
    };
    
    wrapper.addEventListener('dragover', handleDragOver);
    wrapper.addEventListener('dragleave', handleDragLeave);
    wrapper.addEventListener('drop', handleDrop);
    
    return () => {
      wrapper.removeEventListener('dragover', handleDragOver);
      wrapper.removeEventListener('dragleave', handleDragLeave);
      wrapper.removeEventListener('drop', handleDrop);
    };
  }, []);

  const showFormatMenu = () => {
    const selection = window.getSelection();
    const menuElement = document.getElementById('format-menu');
    if (!selection?.toString()) {
      menuElement.style.display = 'none';
    } else {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      menuElement.style.display = 'flex';
      menuElement.style.top = `${rect.top - 40}px`;
      menuElement.style.left = `${rect.left}px`;
    }
  };

  const formatText = (prefix, suffix) => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText) {
      let formattedText = `${prefix}${selectedText}${suffix}`;
      const textArea = inputRef.current;
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;
      const textBefore = inputMessage.substring(0, start);
      const textAfter = inputMessage.substring(end);
      
      const prevChar = textBefore.charAt(start - 1);
      if (prevChar && prevChar !== ' ' && prevChar !== '\n') {
        formattedText = ` ${formattedText}`;
      }
      
      const nextChar = textAfter.charAt(0);
      if (nextChar && nextChar !== ' ' && nextChar !== '\n') {
        formattedText = `${formattedText} `;
      }
      
      setInputMessage(textBefore + formattedText + textAfter);
      document.getElementById('format-menu').style.display = 'none';
      setTimeout(() => {
        textArea.focus();
        textArea.setSelectionRange(
          start + prefix.length - 1,
          start + prefix.length + formattedText.length - 1
        );
        showFormatMenu();
      }, 0);
    }
  };

  const splitSelectionLines = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    if (selectedText) {
      const textArea = inputRef.current;
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;

      const firstLineStart = inputMessage.substring(0, start).lastIndexOf("\n")+1;
      const lastLineEnd = end+inputMessage.substring(end).indexOf("\n");
      const textBefore = inputMessage.substring(0, firstLineStart);
      const textAfter = inputMessage.substring(lastLineEnd);

      const lines = inputMessage.substring(firstLineStart, lastLineEnd).split('\n');
      return { lines, textBefore, textAfter };
    }
    return { lines: [], textBefore: inputMessage, textAfter: "" };
  };

  const formatCode = () => {
    const selection = window.getSelection();
    if (selection.toString().indexOf('\n') === -1) {
      formatText('`', '`');
      return;
    }
      
    const { lines, textBefore, textAfter } = splitSelectionLines();
    if (lines.length > 0) {
      const formattedText = "```\n" + lines.join('\n') + "\n```\n";
      setInputMessage(textBefore + formattedText + textAfter);
      setTimeout(() => {
        const textArea = inputRef.current;
        textArea.focus();
        textArea.setSelectionRange(
          textBefore.length,
          textBefore.length + formattedText.length
        );
        showFormatMenu();
      }, 0);
    }
  };
          
  const formatListNumbered = () => {
    const { lines, textBefore, textAfter } = splitSelectionLines();
    if (lines.length > 0) {
      const formattedLines = lines.map((line, index) => `${index + 1}. ${line}`);
      const formattedText = formattedLines.join('\n');

      setInputMessage(textBefore + formattedText + textAfter);
      setTimeout(() => {
        const textArea = inputRef.current;
        textArea.focus();
        textArea.setSelectionRange(
          textBefore.length,
          textBefore.length + formattedText.length
        );
        showFormatMenu();
      }, 0);
    }
  };

  const formatListBulleted = () => {
    const { lines, textBefore, textAfter } = splitSelectionLines();
    if (lines.length > 0) {
      const formattedLines = lines.map(line => `* ${line}`);
      const formattedText = formattedLines.join('\n');

      setInputMessage(textBefore + formattedText + textAfter);
      setTimeout(() => {
        const textArea = inputRef.current;
        textArea.focus();
        textArea.setSelectionRange(
          textBefore.length,
          textBefore.length + formattedText.length
        );
        showFormatMenu();
      }, 0);
    }
  };

  const formatQuote = () => {
    const { lines, textBefore, textAfter } = splitSelectionLines();
    if (lines.length > 0) {
      const formattedLines = lines.map(line => `> ${line}`);
      const formattedText = formattedLines.join('\n');

      setInputMessage(textBefore + formattedText + textAfter);
      setTimeout(() => {
        const textArea = inputRef.current;
        textArea.focus();
        textArea.setSelectionRange(
          textBefore.length,
          textBefore.length + formattedText.length
        );
        showFormatMenu();
      }, 0);
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleChangeInput = (e) => {
    const value = e.target.value;
    setInputMessage(value);
    handleLoadQuickAnswer(value);
    
    if (isGroup && mentionsList.length > 0) {
      const cursorPos = e.target.selectionStart;
      const textBeforeCursor = value.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
          setMentionSearch(textAfterAt.toLowerCase());
          setMentionStartPos(lastAtIndex);
          setShowMentions(true);
        } else {
          setShowMentions(false);
        }
      } else {
        setShowMentions(false);
      }
    }
  };

  const handleQuickAnswersClick = async (quickAnswer) => {
    setTypeBar(false);
    setInputMessage("");
    
    const message = quickAnswer.message;
    const mediaPath = quickAnswer.mediaPath;
    
    if (mediaPath) {
      try {
        const mediaUrl = `${process.env.REACT_APP_BACKEND_URL}/public/${mediaPath}`;
        
        const response = await fetch(mediaUrl);
        const blob = await response.blob();
        
        const fileName = mediaPath.split('/').pop();
        const file = new File([blob], fileName, { type: blob.type });
        
        setInitialCaption(message);
        setMedias([file]);
        setShowUploadModal(true);
      } catch (err) {
        toastError(err);
      }
    } else {
      if (message.includes('|q')) {
        const parts = message.split(/\|+q/g).map(part => part.trim()).filter(part => part.length > 0);
        
        if (parts.length > 1) {
          await handleSendMultipleMessages(parts, message);
        } else {
          setInputMessage(message.replace(/\|+q/g, '').trim());
        }
      } else {
        setInputMessage(message);
      }
    }
  };

  const handleSendMultipleMessages = async (parts, originalMessage) => {
    setLoading(true);
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      const textBeforePart = originalMessage.substring(0, originalMessage.indexOf(part));
      const pipeCount = (textBeforePart.match(/\|/g) || []).length;
      
      if (i > 0) {
        const previousPart = parts[i - 1];
        const textBetween = originalMessage.substring(
          originalMessage.indexOf(previousPart) + previousPart.length,
          originalMessage.indexOf(part)
        );
        const pipesCount = (textBetween.match(/\|/g) || []).length;
        const delayTime = pipesCount * 4000;
        
        await new Promise(resolve => setTimeout(resolve, delayTime));
      }
      
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: "",
        body: signMessage
          ? `*${user?.name}:*\n${part}`
          : part,
        quotedMsg: replyingMessage,
      };
      
      try {
        let response;
        if (channelType === "wwebjs") {
          response = await api.post(`/messages/${ticketId}`, message);
        } else {
          response = await api.post(`/hub-message/${ticketId}`, message);
        }
        
        if (response && response.data) {
          const messageData = {
            ...message,
            id: response.data.id || new Date().getTime().toString(),
            ticketId: parseInt(ticketId),
            createdAt: new Date().toISOString(),
            userId: user?.id,
            fromMe: true,
            read: 1
          };
          
          setTimeout(() => {
            const event = new CustomEvent('newMessage', { 
              detail: { 
                message: messageData,
                ticketId: ticketId 
              } 
            });
            document.dispatchEvent(event);
            
            const messagesContainer = document.querySelector('.messages-list-scrollable');
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 0);
          
          const socket = openSocket();
          if (socket) {
            socket.emit("appMessage", {
              action: "create",
              message: messageData,
              ticket: { id: ticketId }
            });
          }
        }
      } catch (err) {
        toastError(err, t);
        break;
      }
    }
    
    setLoading(false);
    setReplyingMessage(null);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleAddEmoji = (emojiObject) => {
    setInputMessage((prevState) => prevState + emojiObject.emoji);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }
    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
    setShowUploadModal(true);
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const selectedMedias = Array.from(e.clipboardData.files);
      setMedias(selectedMedias);
      setShowUploadModal(true);
    }
  };

  const handleUploadMedia = async (files, caption = '') => {
    setLoading(true);
    const formData = new FormData();
    const captionText = caption && caption.trim() !== '' ? caption : '';
    files.forEach((media) => {
      formData.append("medias", media);
    });
    
    if (captionText) {
      formData.append("body", captionText);
    } else {
      formData.append("body", files[0].name);
    }
    formData.append("fromMe", true);

    try {
      if (channelType === "wwebjs") {
        await api.post(`/messages/${ticketId}`, formData);
      } else {
        await api.post(`/hub-message/${ticketId}`, formData);
      }
    } catch (err) {
      toastError(err, t);
    }
    setLoading(false);
    setMedias([]);
    setShowUploadModal(false);
  };

  const handleMentionClick = (participant) => {
    const textBefore = inputMessage.substring(0, mentionStartPos);
    const textAfter = inputMessage.substring(inputRef.current.selectionStart);
    const newText = `${textBefore}@${participant.number} ${textAfter}`;
    
    setInputMessage(newText);
    setShowMentions(false);
    setMentionSearch("");
    
    const mentionId = `${participant.number}@c.us`;
    if (!selectedMentions.includes(mentionId)) {
      setSelectedMentions([...selectedMentions, mentionId]);
    }
    
    setTimeout(() => {
      inputRef.current.focus();
      const newCursorPos = mentionStartPos + participant.number.length + 2;
      inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);
    
    const mentionsInText = [];
    const mentionRegex = /@(\d+)/g;
    let match;
    while ((match = mentionRegex.exec(inputMessage)) !== null) {
      const mentionId = `${match[1]}@c.us`;
      if (!mentionsInText.includes(mentionId)) {
        mentionsInText.push(mentionId);
      }
    }
    
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
      mentions: mentionsInText.length > 0 
        ? mentionsInText 
        : undefined,
    };
    try {
      let response;
      if (editingMessage !== null) {
        response = await api.post(`/messages/edit/${editingMessage.id}`, message);
        
        if (response) {
          const updatedMessage = {
            ...editingMessage,
            body: message.body,
            isEdited: true,
            updatedAt: new Date().toISOString(),
            _forceUpdate: Date.now()
          };
          
          setTimeout(() => {
            const event = new CustomEvent('updateMessage', { 
              detail: { 
                message: updatedMessage,
                ticketId: ticketId 
              } 
            });
            document.dispatchEvent(event);
          }, 0);
          
          const socket = openSocket();
          if (socket) {
            socket.emit("appMessage", {
              action: "update",
              message: updatedMessage,
              ticket: { id: ticketId }
            });
          }
        }
      } else {
        if (channelType === "wwebjs") {
          response = await api.post(`/messages/${ticketId}`, message);
        } else {
          response = await api.post(`/hub-message/${ticketId}`, message);
        }
        
        if (response && response.data) {
          const messageData = {
            ...message,
            id: response.data.id || new Date().getTime().toString(),
            ticketId: parseInt(ticketId),
            createdAt: new Date().toISOString(),
            userId: user?.id,
            fromMe: true,
            read: 1
          };
          
          setTimeout(() => {
            const event = new CustomEvent('newMessage', { 
              detail: { 
                message: messageData,
                ticketId: ticketId 
              } 
            });
            document.dispatchEvent(event);
            
            const messagesContainer = document.querySelector('.messages-list-scrollable');
            if (messagesContainer) {
              messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
          }, 0);
          
          const socket = openSocket();
          if (socket) {
            socket.emit("appMessage", {
              action: "create",
              message: messageData,
              ticket: { id: ticketId }
            });
          }
        }
      }
    } catch (err) {
      toastError(err, t);
    }
    setInputMessage("");
    setShowEmoji(false);
    setLoading(false);
    setReplyingMessage(null);
    setEditingMessage(null);
    setSelectedMentions([]);
    setShowMentions(false);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      try {
        await Mp3Recorder.start(stream);
      } catch (e) {
        await Mp3Recorder.start();
      }
      setRecording(true);
      setLoading(false);
      requestAnimationFrame(() => {
        if (!waveformCanvasRef.current) {
          setTimeout(() => startAudioVisualizer(stream), 50);
        } else {
          startAudioVisualizer(stream);
        }
      });
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const startAudioVisualizer = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      const canvas = waveformCanvasRef.current;
      if (!canvas) {
        console.warn('[wave] canvas não disponível');
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.warn('[wave] contexto 2d indisponível');
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      let cssWidth = Math.floor(rect.width) || 200;
      let cssHeight = Math.floor(rect.height) || 24;
      if (cssWidth === 0) {
        setTimeout(() => startAudioVisualizer(stream), 100);
        return;
      }
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let lastDebug = 0;
      const draw = (ts) => {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        const r = canvas.getBoundingClientRect();
        if (Math.floor(r.width) !== cssWidth || Math.floor(r.height) !== cssHeight) {
          cssWidth = Math.floor(r.width) || 200;
          cssHeight = Math.floor(r.height) || 24;
          canvas.width = Math.floor(cssWidth * dpr);
          canvas.height = Math.floor(cssHeight * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        const width = cssWidth;
        const height = cssHeight;
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = 1;

        let maxAbs = 0;
        for (let i = 0; i < bufferLength; i += 4) {
          const v = Math.abs((dataArray[i] - 128) / 128);
          if (v > maxAbs) maxAbs = v;
        }
        const prevLevel = levelRef.current || 0;
        const smoothed = prevLevel * 0.9 + maxAbs * 0.1;
        levelRef.current = smoothed;

        const speakThreshold = 0.025;

        if (smoothed < speakThreshold) {
          ctx.strokeStyle = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(0, height / 2);
          ctx.lineTo(width, height / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          const barCount = Math.min(60, Math.floor(width / 6));
          const step = Math.max(1, Math.floor(bufferLength / barCount));
          for (let i = 0; i < barCount; i++) {
            const v = (dataArray[i * step] - 128) / 128;
            let amp = Math.max(4, Math.abs(v) * height * 0.7);
            amp = Math.max(amp, smoothed * height * 0.6);
            const barWidth = 3;
            const x = i * 6 + 1.5;
            const y = (height - amp) / 2;
            ctx.fillStyle = theme.palette.mode === 'dark' ? '#9e9e9e' : '#6b6f75';
            ctx.globalAlpha = 0.95;
            ctx.fillRect(x, y, barWidth, amp);
          }
        }
        if (!lastDebug || ts - lastDebug > 1000) {
          lastDebug = ts;
        }
        animationRef.current = requestAnimationFrame(draw);
      };
      animationRef.current = requestAnimationFrame(draw);
    } catch (e) {
      console.warn('Falha ao iniciar visualizador de áudio:', e);
    }
  };

  const stopAudioVisualizer = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch (_) {}
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(t => t.stop());
      } catch (_) {}
      streamRef.current = null;
    }
    const canvas = waveformCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleLoadQuickAnswer = async (value) => {
    if (value && value.indexOf("/") === 0) {
      try {
        const shortcut = value.substring(1).trim();
        const { data } = await api.get("/quickAnswers/", {
          params: { searchParam: shortcut },
        });
        setQuickAnswer(data.quickAnswers);
        if (data.quickAnswers.length > 0) {
          setTypeBar(true);
        } else {
          setTypeBar(false);
        }
      } catch (err) {
        setTypeBar(false);
      }
    } else {
      setTypeBar(false);
    }
  };

  const handleUploadAudio = async () => {
    setLoading(true);
    try {
      const [, blob] = await Mp3Recorder.stop().getMp3();
      if (blob.size < 10000) {
        setLoading(false);
        setRecording(false);
        stopAudioVisualizer();
        return;
      }

      const formData = new FormData();
      const filename = `${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);
      if (channelType === "wwebjs") {
        await api.post(`/messages/${ticketId}`, formData);
      } else {
        await api.post(`/hub-message/${ticketId}`, formData);
      }
    } catch (err) {
      toastError(err, t);
    }

    setRecording(false);
    setLoading(false);
    stopAudioVisualizer();
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
    stopAudioVisualizer();
  };

  const handleOpenMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event) => {
    setAnchorEl(null);
  };

  const canSignMessage = () => {
    return (
      (settings && settings.some(s => s.key === "signOption" && s.value === "enabled")) ||
      (user && user.profile === "admin")
    );
  };

  const renderReplyingMessage = (message) => {
    return (
      <ReplyingMsgWrapper>
        <ReplyingMsgContainer>
          <SideColor messageFromMe={message.fromMe} />
          <ReplyingMsgBody>
            {!message.fromMe && (
              <MessageContactName>
                {message.contact?.name}
              </MessageContactName>
            )}
            {message.body}
          </ReplyingMsgBody>
        </ReplyingMsgContainer>
        <Tooltip title={t("messagesInput.buttons.clearReply")} arrow placement="top">
          <IconButton
            aria-label="clearReplyingMessage"
            component="span"
            disabled={loading || ticketStatus !== "open"}
            onClick={() => {
              setReplyingMessage(null);
              setEditingMessage(null);
            }}
            size="small"
            sx={{
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <Clear fontSize="small" />
          </IconButton>
        </Tooltip>
      </ReplyingMsgWrapper>
    );
  };

  const handleAttachmentMenuClick = (event) => {
    setAttachmentMenuAnchor(event.currentTarget);
  };

  const handleAttachmentMenuClose = () => {
    setAttachmentMenuAnchor(null);
  };

  const handleDocumentSelect = (files) => {
    setMedias(files);
    setShowUploadModal(true);
  };

  const handlePhotoVideoSelect = (files) => {
    setMedias(files);
    setShowUploadModal(true);
  };

  const handleCameraSelect = (files) => {
    setMedias(files);
    setShowUploadModal(true);
  };

  const handleAudioSelect = (files) => {
    setMedias(files);
    setShowUploadModal(true);
  };

  const handlePollClick = () => {
    setShowPollCreator(true);
  };

  const handleContactSelect = (contacts) => {
    if (contacts && contacts.length > 0) {
      const contactsData = contacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        number: contact.number,
        profilePicUrl: contact.profilePicUrl
      }));

      handleSendContacts(contactsData);
    }
  };

  const handleSendContacts = async (contacts) => {
    if (contacts.length === 0) return;

    setLoading(true);
    try {
      const { data } = await api.post(`/messages/${ticketId}/contacts`, {
        contacts: contacts,
        userId: user?.id
      });

      if (data) {
        setTimeout(() => {
          const messagesContainer = document.querySelector('.messages-list-scrollable');
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }, 100);
      }
    } catch (err) {
      toastError(err, t);
    } finally {
      setLoading(false);
    }
  };

  return (
      <MainWrapper
        ref={mainWrapperRef}
        square
        elevation={0}
        sx={{ position: 'relative' }}
      >
        <Fade in={onDragEnter}>
          <DropInfo show={onDragEnter}>
            {t("uploads.titles.titleUploadMsgDragDrop")}
          </DropInfo>
        </Fade>
        {(replyingMessage && renderReplyingMessage(replyingMessage)) || (editingMessage && renderReplyingMessage(editingMessage))}
        <NewMessageBox>
          <Hidden only={["sm", "xs"]}>
            <Tooltip title={t("messagesInput.buttons.emoji")} arrow placement="top">
              <span>
                <IconButton
                  aria-label="emojiPicker"
                  component="span"
                  disabled={loading || recording || ticketStatus !== "open"}
                  onClick={(e) => setShowEmoji((prevState) => !prevState)}
                  color={showEmoji ? "primary" : "default"}
                  size="medium"
                >
                  <Mood />
                </IconButton>
              </span>
            </Tooltip>
            {showEmoji ? (
              <EmojiBoxStyled>
                <ClickAwayListener onClickAway={(e) => setShowEmoji(false)}>
                  <div sx={{ position: 'absolute', zIndex: 1000, bottom: '60px', left: '10px' }}>
                    <EmojiPicker 
                      theme={theme.palette.mode === 'dark' ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                      onEmojiClick={(emojiObject) => handleAddEmoji(emojiObject)}
                      emojiStyle={"facebook"}
                      searchDisabled={false}
                      searchPlaceholder={t("messagesInput.emoji.searchPlaceholder")}
                      skinTonesDisabled={false}
                      previewConfig={{ showPreview: false }}
                      width={450}
                      height={400}
                    />
                  </div>
                </ClickAwayListener>
              </EmojiBoxStyled>
            ) : null}

            <Tooltip title={t("messagesInput.buttons.attach")} arrow placement="top">
              <span>
                <IconButton
                  aria-label="attachment-menu"
                  component="span"
                  disabled={loading || recording || ticketStatus !== "open"}
                  onClick={handleAttachmentMenuClick}
                  size="medium"
                >
                  <AttachFile />
                </IconButton>
              </span>
            </Tooltip>

            <AttachmentMenu
              anchorEl={attachmentMenuAnchor}
              open={Boolean(attachmentMenuAnchor)}
              onClose={handleAttachmentMenuClose}
              onDocumentSelect={handleDocumentSelect}
              onPhotoVideoSelect={handlePhotoVideoSelect}
              onCameraSelect={handleCameraSelect}
              onAudioSelect={handleAudioSelect}
              onContactSelect={handleContactSelect}
              onPollClick={handlePollClick}
              disabled={loading || recording || ticketStatus !== "open"}
            />

            <PollCreator
              open={showPollCreator}
              onClose={() => setShowPollCreator(false)}
              ticketId={ticketId}
            />

            {canSignMessage() && (
            <FormControlLabel
              sx={{ marginRight: 7 }}
              label={t("messagesInput.signMessage")}
              labelPlacement="start"
              control={
                <Switch
                  size="small"
                  checked={signMessage || false}
                  onChange={(e) => {
                    try {
                      setSignMessage(e.target.checked);
                    } catch (err) {
                      console.error(err);
                      toastError(err);
                    }
                  }}
                  name="showAllTickets"
                  color="secondary"
                />
              }
            />
            )}
          </Hidden>
          <Hidden only={["md", "lg", "xl"]}>
            <IconButton
              aria-controls="simple-menu"
              aria-haspopup="true"
              onClick={handleOpenMenuClick}
            >
              <MoreVert></MoreVert>
            </IconButton>
            <Menu
              id="simple-menu"
              keepMounted
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuItemClick}
            >
              <MenuItem onClick={handleMenuItemClick}>
                <IconButton
                  aria-label="emojiPicker"
                  component="span"
                  disabled={loading || recording || ticketStatus !== "open"}
                  onClick={(e) => setShowEmoji((prevState) => !prevState)}
                >
                  <Mood sx={{ color: theme.palette.text.primary }} />
                </IconButton>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                <input
                  multiple
                  type="file"
                  id="upload-button"
                  disabled={loading || recording || ticketStatus !== "open"}
                  sx={{ display: "none" }}
                  onChange={handleChangeMedias}
                />
                <label htmlFor="upload-button">
                  <IconButton
                    aria-label="upload"
                    component="span"
                    disabled={loading || recording || ticketStatus !== "open"}
                  >
                    <AttachFile sx={{ color: theme.palette.text.primary }} />
                  </IconButton>
                </label>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                {canSignMessage() && (
                <FormControlLabel
                  sx={{ marginRight: 7, color: "gray" }}
                  label={t("messagesInput.signMessage")}
                  labelPlacement="start"
                  control={
                    <Switch
                      size="small"
                      checked={signMessage || false}
                      onChange={(e) => {
                        try {
                          setSignMessage(e.target.checked);
                        } catch (err) {
                          console.error(err);
                          toastError(err);
                        }
                      }}
                      name="showAllTickets"
                      color="primary"
                    />
                  }
                />
                )}
              </MenuItem>
            </Menu>
          </Hidden>
          <InputWrapper onMouseEnter={() => {
            refreshBlockedStatus();
          }}>
            <InputBaseStyled
              inputRef={inputRef}
              placeholder={
                isContactBlocked
                  ? t("messagesInput.placeholderBlocked")
                  : ticketStatus === "open"
                    ? t("messagesInput.placeholderOpen")
                    : t("messagesInput.placeholderClosed")
              }
              multiline
              maxRows={5}
              value={capitalizeFirstLetter(inputMessage)}
              onChange={handleChangeInput}
              disabled={recording || loading || ticketStatus !== "open" || isContactBlocked}
              onPaste={(e) => {
                ticketStatus === "open" && handleInputPaste(e);
              }}
              onMouseUp={showFormatMenu}
              onKeyUp={showFormatMenu}
              onKeyPress={(e) => {
                if (e.ctrlKey && e.key === 'b') {
                  e.preventDefault();
                  formatText('*', '*');
                } else if (e.ctrlKey && e.key === 'i') {
                  e.preventDefault();
                  formatText('_', '_');
                } else if (e.ctrlKey && e.key === 's') {
                  e.preventDefault();
                  formatText('~', '~');
                } else if (e.ctrlKey && e.key === 'm') {
                  e.preventDefault();
                  formatCode();
                } else if (e.ctrlKey && e.key === 'q') {
                  e.preventDefault();
                  formatQuote();
                } else if (e.ctrlKey && e.key === 'n') {
                  e.preventDefault();
                  formatListNumbered();
                } else if (e.ctrlKey && e.key === 'l') {
                  e.preventDefault();
                  formatListBulleted();
                } else if (loading || e.shiftKey) return;
                else if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <FormatMenu
              id="format-menu"
              sx={{
                display: 'none',
                position: 'absolute',
                zIndex: 1000
              }}
            >
              <IconButton 
                size="small" 
                onClick={() => formatText('*','*')}
                sx={{ 
                  padding: '6px', 
                  margin: '0 2px'
                }}
              >
                <FormatBoldIcon />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => formatText('_','_')}
                sx={{ 
                  padding: '6px', 
                  margin: '0 2px'
                }}
              >
                <FormatItalicIcon />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => formatText('~','~')}
                sx={{ 
                  padding: '6px', 
                  margin: '0 2px'
                }}
              >
                <StrikethroughSIcon />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatCode}
                sx={{ 
                  padding: '6px', 
                  margin: '0 2px'
                }}
              >
                <Code />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatListNumbered}
                sx={{ 
                  padding: '6px', 
                  margin: '0 2px'
                }}
              >
                <FormatListNumbered />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatListBulleted}
                sx={{ 
                  padding: '6px', 
                  margin: '0 2px'
                }}
              >
                <FormatListBulleted />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatQuote}
                sx={{ 
                  padding: '6px', 
                  margin: '0 2px'
                }}
              >
                <FormatQuote />
              </IconButton>
            </FormatMenu>
            {showMentions && isGroup ? (
              <ClickAwayListener onClickAway={() => setShowMentions(false)}>
                <MentionsListWrapper>
                  {mentionsList
                    .filter(p => {
                      const searchLower = mentionSearch.toLowerCase();
                      return (
                        p.name.toLowerCase().includes(searchLower) ||
                        p.number.includes(mentionSearch)
                      );
                    })
                    .slice(0, 10)
                    .map((participant, index) => {
                      const initial = participant.name ? participant.name.charAt(0).toUpperCase() : '?';
                      return (
                        <li key={index}>
                          <a onClick={() => handleMentionClick(participant)}>
                            {participant.avatar ? (
                              <img 
                                src={participant.avatar} 
                                alt={participant.name}
                                className="mention-avatar"
                              />
                            ) : (
                              <div className="mention-avatar">{initial}</div>
                            )}
                            <div className="mention-info">
                              <div className="mention-name">{participant.name}</div>
                              <div className="mention-number">+{participant.number}</div>
                            </div>
                          </a>
                        </li>
                      );
                    })}
                </MentionsListWrapper>
              </ClickAwayListener>
            ) : typeBar ? (
              <MessageQuickAnswersWrapper>
                {quickAnswers.map((value, index) => {
                  return (
                    <li
                      key={index}
                    >
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a onClick={() => handleQuickAnswersClick(value)}>
                        {`${value.shortcut} - ${value.message}${value.mediaPath ? ' 📎' : ''}`}
                      </a>
                    </li>
                  );
                })}
              </MessageQuickAnswersWrapper>
            ) : (
              <div></div>
            )}
          </InputWrapper>
          {inputMessage ? (
            <Tooltip title={t("messagesInput.buttons.send")} arrow placement="top">
              <span>
                <IconButton
                  aria-label="sendMessage"
                  component="span"
                  onClick={handleSendMessage}
                  disabled={loading}
                  color="primary"
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                    '&.Mui-disabled': {
                      backgroundColor: theme.palette.action.disabledBackground,
                    }
                  }}
                >
                  <Send />
                </IconButton>
              </span>
            </Tooltip>
          ) : recording ? (
            <RecorderWrapper>
              <IconButton
                aria-label="cancelRecording"
                component="span"
                fontSize="large"
                disabled={loading}
                onClick={handleCancelAudio}
              >
                <HighlightOff sx={{ color: theme.palette.error.main }} />
              </IconButton>
              <Box sx={{
                width: 220,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                borderRadius: '18px',
                padding: '4px 8px',
                border: `1px solid ${theme.palette.divider}`
              }}>
                <canvas
                  ref={waveformCanvasRef}
                  style={{ width: 200, height: 24, display: 'block' }}
                />
              </Box>
              {loading ? (
                <div>
                  <CircularProgress sx={{ color: theme.palette.success.main, opacity: "70%" }} />
                </div>
              ) : (
                <RecordingTimer />
              )}

              <IconButton
                aria-label="sendRecordedAudio"
                component="span"
                onClick={handleUploadAudio}
                disabled={loading}
              >
                <CheckCircleOutline sx={{ color: theme.palette.success.main }} />
              </IconButton>
            </RecorderWrapper>
          ) : (
            <Tooltip title={t("messagesInput.buttons.record")} arrow placement="top">
              <span>
                <IconButton
                  aria-label="showRecorder"
                  component="span"
                  disabled={loading || ticketStatus !== "open"}
                  onClick={handleStartRecording}
                  size="medium"
                >
                  <Mic />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </NewMessageBox>
        <UploadModal 
          open={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setMedias([]);
            setInitialCaption("");
          }}
          files={medias}
          onSend={handleUploadMedia}
          loading={loading}
          initialCaption={initialCaption}
        />
      </MainWrapper>
    );
};

MessageInput.propTypes = {
  ticketStatus: PropTypes.string
};

export default MessageInput;