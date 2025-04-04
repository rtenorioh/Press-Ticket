import {
  Avatar,
  CircularProgress,
  ClickAwayListener,
  FormControlLabel,
  Grid,
  Hidden,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Paper,
  Switch,
  Typography
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import {
  AttachFile,
  Cancel,
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
} from "@material-ui/icons";
import clsx from "clsx";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import MicRecorder from "mic-recorder-to-mp3";
import PropTypes from "prop-types";
import React, {
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { EditMessageContext } from "../../context/EditingMessage/EditingMessageContext";
import { ReplyMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";
import toastError from "../../errors/toastError";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import api from "../../services/api";
import RecordingTimer from "./RecordingTimer";

const Mp3Recorder = new MicRecorder({ bitRate: 128 });

const useStyles = makeStyles((theme) => ({
  mainWrapper: {
    background: "#eee",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      bottom: 0,
      width: "100%",
    },
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "25%"
  },
  dropInfo: {
    background: "#eee",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: 15,
    left: 0,
    right: 0,
  },
  dropInfoOut: {
    display: "none",
  },
  formatMenu: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: 30,
    boxShadow: theme.shadows[2],
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
  },
  gridFiles: {
    maxHeight: "100%",
    overflow: "scroll",
  },
  newMessageBox: {
    background: theme.palette.background.default,
    width: "100%",
    display: "flex",
    padding: "7px",
    alignItems: "center",
  },
  messageInputWrapper: {
    padding: 6,
    marginRight: 7,
    background: theme.palette.background.paper,
    display: "flex",
    borderRadius: 20,
    flex: 1,
    position: "relative",
  },
  
  messageInputField: {
    flex: 1,
    width: "100%",
    paddingLeft: 10,
  },
  sendMessageIcons: {
    color: theme.palette.text.primary,
  },
  uploadInput: {
    display: "none",
  },
  viewMediaInputWrapper: {
    maxHeight: "80%",
    display: "flex",
    padding: "10px 13px",
    position: "relative",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eee",
    borderTop: "1px solid rgba(0, 0, 0, 0.12)",
  },
  emojiBox: {
    position: "absolute",
    bottom: 63,
    width: 40,
    borderTop: "1px solid #e8e8e8",
  },
  circleLoading: {
    color: green[500],
    opacity: "70%",
    position: "absolute",
    top: "20%",
    left: "50%",
    marginLeft: -12,
  },
  audioLoading: {
    color: green[500],
    opacity: "70%",
  },
  recorderWrapper: {
    display: "flex",
    alignItems: "center",
    alignContent: "middle",
  },
  cancelAudioIcon: {
    color: "red",
  },
  sendAudioIcon: {
    color: "green",
  },
  replyginMsgWrapper: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    paddingLeft: 73,
    paddingRight: 7,
  },
  replyginMsgContainer: {
    flex: 1,
    marginRight: 5,
    overflowY: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: "7.5px",
    display: "flex",
    position: "relative",
  },
  replyginMsgBody: {
    padding: 10,
    height: "auto",
    display: "block",
    whiteSpace: "pre-wrap",
    overflow: "hidden",
  },
  replyginContactMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#35cd96",
  },
  replyginSelfMsgSideColor: {
    flex: "none",
    width: "4px",
    backgroundColor: "#6bcbef",
  },
  messageContactName: {
    display: "flex",
    color: "#6bcbef",
    fontWeight: 500,
  },
  messageQuickAnswersWrapper: {
    margin: 0,
    position: "absolute",
    bottom: "55px",
    background: theme.palette.background.default,
    padding: 0,
    border: "none",
    left: 0,
    width: "100%",
    maxHeight: "350px",
    overflowY: "auto",
    "& li": {
      listStyle: "none",
      "& a": {
        display: "block",
        padding: "8px",
        textOverflow: "ellipsis",
        overflowY: "hidden",
        maxHeight: "30px",
        "&:hover": {
          background: theme.palette.background.paper,
          cursor: "pointer",
        },
      },
    },
  }
}));

const MessageInput = ({ ticketStatus }) => {
  const classes = useStyles();
  const { ticketId } = useParams();
  const [medias, setMedias] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [quickAnswers, setQuickAnswer] = useState([]);
  const [typeBar, setTypeBar] = useState(false);
  const inputRef = useRef();
  const [onDragEnter, setOnDragEnter] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { setReplyingMessage, replyingMessage } = useContext(ReplyMessageContext);
  const { setEditingMessage, editingMessage } = useContext(EditMessageContext);
  const { user = {} } = useContext(AuthContext);
  const [settings, setSettings] = useState([]);
  const [signMessage, setSignMessage] = useLocalStorage("signOption", true);
  const [channelType, setChannelType] = useState(null);
  const { t } = useTranslation();

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
    const fetchChannelType = async () => {
      try {
        const { data } = await api.get(`/tickets/${ticketId}`);
        setChannelType(data.whatsapp?.type);
      } catch (err) {
        toastError(err);
      }
    };

    fetchChannelType();
  }, [ticketId]);

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
    setTimeout(() => {
      setOnDragEnter(false);
    }, 10000);
    // eslint-disable-next-line
  }, [onDragEnter === true]);

  const showFormatMenu = () => {
    const selection = window.getSelection();
    const menuElement = document.getElementById('format-menu');
    if (!selection?.toString()) {
      menuElement.style.display = 'none';
    } else {
      // Position the formatting menu near the selection
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
    setInputMessage(e.target.value);
    handleLoadQuickAnswer(e.target.value);
  };

  const handleQuickAnswersClick = (value) => {
    setInputMessage(value);
    setTypeBar(false);
  };

  const handleAddEmoji = (e) => {
    let emoji = e.native;
    setInputMessage((prevState) => prevState + emoji);
  };

  const handleChangeMedias = (e) => {
    if (!e.target.files) {
      return;
    }
    const selectedMedias = Array.from(e.target.files);
    setMedias(selectedMedias);
  };

  const handleInputPaste = (e) => {
    if (e.clipboardData.files[0]) {
      const selectedMedias = Array.from(e.clipboardData.files);
      setMedias(selectedMedias);
    }
  };

  const handleInputDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
      const selectedMedias = Array.from(e.dataTransfer.files);
      setMedias(selectedMedias);
    }
  };

  const handleUploadMedia = async (e) => {
    if (!e || !e.preventDefault) {
      console.error("Evento inválido ou não fornecido!");
      return;
    }
    setLoading(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append("fromMe", true);
    medias.forEach((media) => {
      formData.append("medias", media);
      formData.append("body", media.name);
    });

    try {
      if (channelType !== null) {
        await api.post(`/hub-message/${ticketId}`, formData);
      } else {
        await api.post(`/messages/${ticketId}`, formData);
      }
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
    setMedias([]);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;
    setLoading(true);
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: "",
      body: signMessage
        ? `*${user?.name}:*\n${inputMessage.trim()}`
        : inputMessage.trim(),
      quotedMsg: replyingMessage,
    };
    try {
      if (editingMessage !== null) {
        await api.post(`/messages/edit/${editingMessage.id}`, message);
      } else {
        if (channelType !== null) {
          await api.post(`/hub-message/${ticketId}`, message);
        } else {
          await api.post(`/messages/${ticketId}`, message);
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
  };

  const handleStartRecording = async () => {
    setLoading(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await Mp3Recorder.start();
      setRecording(true);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
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
        return;
      }

      const formData = new FormData();
      const filename = `${new Date().getTime()}.mp3`;
      formData.append("medias", blob, filename);
      formData.append("body", filename);
      formData.append("fromMe", true);
      if (channelType !== null) {
        await api.post(`/hub-message/${ticketId}`, formData);
      } else {
        await api.post(`/messages/${ticketId}`, formData);
      }
    } catch (err) {
      toastError(err);
    }

    setRecording(false);
    setLoading(false);
  };

  const handleCancelAudio = async () => {
    try {
      await Mp3Recorder.stop().getMp3();
      setRecording(false);
    } catch (err) {
      toastError(err);
    }
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
      <div className={classes.replyginMsgWrapper}>
        <div className={classes.replyginMsgContainer}>
          <span
            className={clsx(classes.replyginContactMsgSideColor, {
              [classes.replyginSelfMsgSideColor]: !message.fromMe,
            })}
          ></span>
          <div className={classes.replyginMsgBody}>
            {!message.fromMe && (
              <span className={classes.messageContactName}>
                {message.contact?.name}
              </span>
            )}
            {message.body}
          </div>
        </div>
        <IconButton
          aria-label="showRecorder"
          component="span"
          disabled={loading || ticketStatus !== "open"}
          onClick={() => {
            setReplyingMessage(null);
            setEditingMessage(null);
          }}
        >
          <Clear className={classes.sendMessageIcons} />
        </IconButton>
      </div>
    );
  };

  if (medias.length > 0)
    return (
      <Paper
        elevation={0}
        square
        className={classes.viewMediaInputWrapper}
        onDragEnter={() => setOnDragEnter(true)}
        onDrop={(e) => handleInputDrop(e)}
      >
        <IconButton
          aria-label="cancel-upload"
          component="span"
          onClick={(e) => setMedias([])}
        >
          <Cancel className={classes.sendMessageIcons} />
        </IconButton>

        {loading ? (
          <div>
            <CircularProgress className={classes.circleLoading} />
          </div>
        ) : (
          <Grid item className={classes.gridFiles}>
            <Typography variant="h6" component="div">
              {t("uploads.titles.titleFileList")} ({medias.length})
            </Typography>
            <List>
              {medias.map((value, index) => {
                return (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar className={classes.avatar} alt={value.name} src={URL.createObjectURL(value)} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${value.name}`}
                      secondary={`${parseInt(value.size / 1024)} kB`}
                    />
                  </ListItem>
                );
              })}
            </List>
            <InputBase
              style={{ width: "0", height: "0" }}
              inputRef={(input) => {
                if (input !== null) {
                  input.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUploadMedia(e);
                }
              }}
              defaultValue={medias[0].name}
            />
          </Grid>
        )}
        <IconButton
          aria-label="send-upload"
          component="span"
          onClick={handleUploadMedia}
          disabled={loading}
        >
          <Send className={classes.sendMessageIcons} />
        </IconButton>
      </Paper>
    );
  else {
    return (
      <Paper
        square
        elevation={0}
        className={classes.mainWrapper}
        onDragEnter={() => setOnDragEnter(true)}
        onDrop={(e) => handleInputDrop(e)}
      >
        <div className={onDragEnter ? classes.dropInfo : classes.dropInfoOut}>
          {t("uploads.titles.titleUploadMsgDragDrop")}
        </div>
        {(replyingMessage && renderReplyingMessage(replyingMessage)) || (editingMessage && renderReplyingMessage(editingMessage))}
        <div className={classes.newMessageBox}>
          <Hidden only={["sm", "xs"]}>
            <IconButton
              aria-label="emojiPicker"
              component="span"
              disabled={loading || recording || ticketStatus !== "open"}
              onClick={(e) => setShowEmoji((prevState) => !prevState)}
            >
              <Mood className={classes.sendMessageIcons} />
            </IconButton>
            {showEmoji ? (
              <div className={classes.emojiBox}>
                <ClickAwayListener onClickAway={(e) => setShowEmoji(true)}>
                  <Picker
                    perLine={16}
                    theme={"dark"}
                    i18n={t}
                    showPreview={true}
                    showSkinTones={false}
                    onSelect={handleAddEmoji}
                  />
                </ClickAwayListener>
              </div>
            ) : null}

            <input
              multiple
              type="file"
              id="upload-button"
              disabled={loading || recording || ticketStatus !== "open"}
              className={classes.uploadInput}
              onChange={handleChangeMedias}
            />
            <label htmlFor="upload-button">
              <IconButton
                aria-label="upload"
                component="span"
                disabled={loading || recording || ticketStatus !== "open"}
                onMouseOver={() => setOnDragEnter(true)}
              >
                <AttachFile className={classes.sendMessageIcons} />
              </IconButton>
            </label>
            {canSignMessage() && (
            <FormControlLabel
              style={{ marginRight: 7, color: "primary" }}
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
                  <Mood className={classes.sendMessageIcons} />
                </IconButton>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                <input
                  multiple
                  type="file"
                  id="upload-button"
                  disabled={loading || recording || ticketStatus !== "open"}
                  className={classes.uploadInput}
                  onChange={handleChangeMedias}
                />
                <label htmlFor="upload-button">
                  <IconButton
                    aria-label="upload"
                    component="span"
                    disabled={loading || recording || ticketStatus !== "open"}
                  >
                    <AttachFile className={classes.sendMessageIcons} />
                  </IconButton>
                </label>
              </MenuItem>
              <MenuItem onClick={handleMenuItemClick}>
                {canSignMessage() && (
                <FormControlLabel
                  style={{ marginRight: 7, color: "gray" }}
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
          <div className={classes.messageInputWrapper}>
            <InputBase
              className={classes.messageInputField}
              inputRef={inputRef}
              placeholder={
                ticketStatus === "open"
                  ? t("messagesInput.placeholderOpen")
                  : t("messagesInput.placeholderClosed")
              }
              multiline
              maxRows={5}
              value={capitalizeFirstLetter(inputMessage)}
              onChange={handleChangeInput}
              disabled={recording || loading || ticketStatus !== "open"}
              onPaste={(e) => {
                ticketStatus === "open" && handleInputPaste(e);
              }}
              onMouseUp={showFormatMenu}
              onKeyUp={showFormatMenu}
              onKeyDown={(e) => {
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
            <div
              id="format-menu"
              className={classes.formatMenu}
              style={{ display: 'none', position: 'absolute', zIndex: 1000 }}
            >
              <IconButton 
                size="small" 
                onClick={() => formatText('*','*')}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <Typography style={{ fontWeight: 'bold', fontSize: '15px', color: '#444' }}>B</Typography>
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => formatText('_','_')}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <Typography style={{ fontStyle: 'italic', fontSize: '15px', color: '#444' }}>I</Typography>
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => formatText('~','~')}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <Typography style={{ textDecoration: 'line-through', fontSize: '15px', color: '#444' }}>S</Typography>
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatCode}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <Code fontSize="small" style={{ color: '#444' }} />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatListNumbered}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <FormatListNumbered fontSize="small" style={{ color: '#444' }} />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatListBulleted}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <FormatListBulleted fontSize="small" style={{ color: '#444' }} />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={formatQuote}
                style={{ padding: '6px', margin: '0 2px' }}
              >
                <FormatQuote fontSize="small" style={{ color: '#444' }} />
              </IconButton>
            </div>
            {typeBar ? (
              <ul className={classes.messageQuickAnswersWrapper}>
                {quickAnswers.map((value, index) => {
                  return (
                    <li
                      className={classes.messageQuickAnswersWrapperItem}
                      key={index}
                    >
                      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                      <a onClick={() => handleQuickAnswersClick(value.message)}>
                        {`${value.shortcut} - ${value.message}`}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div></div>
            )}
          </div>
          {inputMessage ? (
            <IconButton
              aria-label="sendMessage"
              component="span"
              onClick={handleSendMessage}
              disabled={loading}
            >
              <Send className={classes.sendMessageIcons} />
            </IconButton>
          ) : recording ? (
            <div className={classes.recorderWrapper}>
              <IconButton
                aria-label="cancelRecording"
                component="span"
                fontSize="large"
                disabled={loading}
                onClick={handleCancelAudio}
              >
                <HighlightOff className={classes.cancelAudioIcon} />
              </IconButton>
              {loading ? (
                <div>
                  <CircularProgress className={classes.audioLoading} />
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
                <CheckCircleOutline className={classes.sendAudioIcon} />
              </IconButton>
            </div>
          ) : (
            <IconButton
              aria-label="showRecorder"
              component="span"
              disabled={loading || ticketStatus !== "open"}
              onClick={handleStartRecording}
            >
              <Mic className={classes.sendMessageIcons} />
            </IconButton>
          )}
        </div>
      </Paper>
    );
  }
};

MessageInput.propTypes = {
  ticketStatus: PropTypes.string
}

export default MessageInput;