import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  CardActionArea,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SaveIcon from "@mui/icons-material/Save";

import { AuthContext } from "../../context/Auth/AuthContext";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { Can } from "../../components/Can";
import toastError from "../../errors/toastError";
import ConfirmationModal from "../../components/ConfirmationModal";

const ButtonContainer = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  [theme.breakpoints.down("sm")]: {
    marginTop: theme.spacing(1),
    justifyContent: "space-between",
    width: "100%",
  },
}));

const VideoGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const VideoCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  borderRadius: theme.spacing(1.5),
  overflow: "hidden",
  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.08)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 20px rgba(0, 0, 0, 0.15)",
  },
}));

const VideoCardMedia = styled(CardMedia)(({ theme }) => ({
  paddingTop: "56.25%", 
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.1)",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  "&:hover::after": {
    opacity: 1,
  },
}));

const PlayIconOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  borderRadius: "50%",
  width: 60,
  height: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  opacity: 0.8,
  transition: "opacity 0.3s, transform 0.3s",
  "&:hover": {
    opacity: 1,
    transform: "translate(-50%, -50%) scale(1.1)",
  },
}));

const VideoCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
}));

const VideoPlayerDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    maxWidth: "900px",
    width: "90%",
    margin: 0,
    borderRadius: theme.spacing(1),
    overflow: "hidden",
  },
}));

const VideoPlayerContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  paddingTop: "56.25%", 
  width: "100%",
  backgroundColor: "#000",
}));

const VideoIframe = styled("iframe")(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  border: "none",
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const Videos = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [searchParam, setSearchParam] = useState("");
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState(true);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [currentVideoTitle, setCurrentVideoTitle] = useState("");

  useEffect(() => {
    fetchVideos();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchParam) {
      const filtered = videos.filter(video => 
        video.title.toLowerCase().includes(searchParam.toLowerCase())
      );
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(videos);
    }
  }, [searchParam, videos]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/videos");
      setVideos(data);
      setFilteredVideos(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.users);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenModal = () => {
    setSelectedVideo(null);
    setTitle("");
    setVideoUrl("");
    setStatus(true);
    setSelectedUsers([]);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVideo(null);
  };

  const handleEditVideo = (video) => {
    setSelectedVideo(video);
    setTitle(video.title);
    setVideoUrl(video.url);
    setStatus(video.active);
    setSelectedUsers(video.users?.map(u => u.id) || []);
    setModalOpen(true);
  };

  const handleDeleteVideo = async () => {
    try {
      await api.delete(`/videos/${videoToDelete.id}`);
      toast.success(t("videos.toasts.deleted"));
      fetchVideos();
    } catch (err) {
      toastError(err);
    } finally {
      setConfirmModalOpen(false);
      setVideoToDelete(null);
    }
  };

  const handleSaveVideo = async () => {
    try {
      if (!title || !videoUrl) {
        toast.error(t("videos.toasts.required"));
        return;
      }

      const videoData = {
        title,
        url: videoUrl,
        active: status,
        users: selectedUsers,
      };

      if (selectedVideo) {
        await api.put(`/videos/${selectedVideo.id}`, videoData);
        toast.success(t("videos.toasts.updated"));
      } else {
        await api.post("/videos", videoData);
        toast.success(t("videos.toasts.added"));
      }

      handleCloseModal();
      fetchVideos();
    } catch (err) {
      toastError(err);
    }
  };

  const handleUserSelection = (event) => {
    const { value } = event.target;
    setSelectedUsers(value);
  };

  const getYoutubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVideoThumbnail = (url) => {
    const videoId = getYoutubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : "";
  };

  const canUserSeeVideo = (video) => {
    if (!video.users || video.users.length === 0) return true;
    
    return video.users.some(u => u.id === user.id);
  };

  const toggleView = () => {
    setShowTable(!showTable);
  };

  const handleSearchChange = (e) => {
    setSearchParam(e.target.value);
  };

  const handleOpenPlayer = (video) => {
    const videoId = getYoutubeVideoId(video.url);
    if (videoId) {
      setCurrentVideoUrl(`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`);
      setCurrentVideoTitle(video.title);
      setPlayerOpen(true);
    } else {
      toast.error(t("videos.toasts.invalidUrl"));
    }
  };

  const handleClosePlayer = () => {
    setPlayerOpen(false);
    setCurrentVideoUrl("");
  };

  const renderVideoCards = () => {
    return (
      <VideoGrid container spacing={3}>
        {filteredVideos
          .filter(video => video.active && canUserSeeVideo(video))
          .map(video => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={video.id}>
              <VideoCard>
                <CardActionArea onClick={() => handleOpenPlayer(video)}>
                  <Box sx={{ position: "relative" }}>
                    <VideoCardMedia
                      image={getVideoThumbnail(video.url)}
                      title={video.title}
                    />
                    <PlayIconOverlay>
                      <PlayArrowIcon sx={{ fontSize: 40, color: "white" }} />
                    </PlayIconOverlay>
                  </Box>
                  <VideoCardContent>
                    <Typography gutterBottom variant="h6" component="h2" noWrap>
                      {video.title}
                    </Typography>
                  </VideoCardContent>
                </CardActionArea>
              </VideoCard>
            </Grid>
          ))}
      </VideoGrid>
    );
  };

  const renderVideoTable = () => {
    return (
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>{t("videos.table.title")}</TableCell>
            <TableCell>{t("videos.table.status")}</TableCell>
            <TableCell>{t("videos.table.visibility")}</TableCell>
            <TableCell>{t("videos.table.actions")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredVideos.map(video => (
            <TableRow key={video.id}>
              <TableCell>{video.id}</TableCell>
              <TableCell>{video.title}</TableCell>
              <TableCell>
                {video.active ? 
                  <Chip label={t("videos.active")} color="success" size="small" /> : 
                  <Chip label={t("videos.inactive")} color="error" size="small" />
                }
              </TableCell>
              <TableCell>
                <Tooltip 
                  title={
                    video.users && video.users.length > 0 
                      ? video.users.map(u => u.name).join(", ") 
                      : t("videos.allUsers")
                  }
                >
                  <IconButton size="small">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
              <TableCell>
                <Tooltip title={t("videos.buttons.edit")}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEditVideo(video)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("videos.buttons.delete")}>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setVideoToDelete(video);
                      setConfirmModalOpen(true);
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderTopButtons = () => {
    return (
      <MainHeader>
        <Title>{t("videos.title")}</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={t("videos.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ mr: 2 }}
          />
          <ButtonContainer>
            {(user.profile === "admin" || user.profile === "master") && (
              <Tooltip title={showTable ? t("videos.buttons.cards") : t("videos.buttons.table")}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={toggleView}
                  size="small"
                  sx={{
                    minWidth: "40px",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    p: 0,
                    mr: 1
                  }}
                >
                  {showTable ? <ViewModuleIcon /> : <ViewListIcon />}
                </Button>
              </Tooltip>
            )}
            <Can
              role={user.profile}
              perform="videos:create"
              yes={() => (
                <Tooltip title={t("videos.buttons.add")}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenModal}
                    sx={{
                      minWidth: "40px",
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      p: 0
                    }}
                  >
                    <AddIcon />
                  </Button>
                </Tooltip>
              )}
            />
          </ButtonContainer>
        </MainHeaderButtonsWrapper>
      </MainHeader>
    );
  };

return (
  <MainContainer>
    {renderTopButtons()}
    <ConfirmationModal
      title={t("videos.confirmationModal.deleteTitle")}
      open={confirmModalOpen}
      onClose={() => setConfirmModalOpen(false)}
      onConfirm={handleDeleteVideo}
    >
      {t("videos.confirmationModal.deleteMessage")}
    </ConfirmationModal>
    <Paper>
      {loading ? (
        <Typography variant="body2" color="textSecondary" align="center" style={{ padding: 20 }}>
          {t("videos.loading")}
        </Typography>
      ) : (
        <>
          {user.profile === "user" || !showTable ? (
            renderVideoCards()
          ) : (
            renderVideoTable()
          )}
        </>
      )}
    </Paper>

    <Dialog 
      open={modalOpen} 
      onClose={handleCloseModal}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {selectedVideo ? t("videos.dialog.edit") : t("videos.dialog.add")}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label={t("videos.dialog.title")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              variant="outlined"
              margin="dense"
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t("videos.dialog.url")}
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              fullWidth
              variant="outlined"
              margin="dense"
              required
              helperText={t("videos.dialog.urlHelp")}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  color="primary"
                />
              }
              label={t("videos.dialog.active")}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" margin="dense">
              <InputLabel id="users-select-label">
                {t("videos.dialog.users")}
              </InputLabel>
              <Select
                labelId="users-select-label"
                multiple
                value={selectedUsers}
                onChange={handleUserSelection}
                input={<OutlinedInput label={t("videos.dialog.users")} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.length === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        {t("videos.allUsers")}
                      </Typography>
                    ) : (
                      selected.map((value) => {
                        const user = users.find(u => u.id === value);
                        return (
                          <Chip key={value} label={user?.name || value} />
                        );
                      })
                    )}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Checkbox checked={selectedUsers.indexOf(user.id) > -1} />
                    <ListItemText primary={user.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="textSecondary">
              {t("videos.dialog.usersHelp")}
            </Typography>
          </Grid>
          {videoUrl && (
            <>
              {showTable ? (
                renderVideoTable()
              ) : (
                renderVideoCards()
              )}
            </>
          )}
        </Grid>
      </DialogContent>

      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedVideo ? t("videos.dialog.edit") : t("videos.dialog.add")}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label={t("videos.dialog.title")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                variant="outlined"
                margin="dense"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("videos.dialog.url")}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                fullWidth
                variant="outlined"
                margin="dense"
                required
                helperText={t("videos.dialog.urlHelp")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                    color="primary"
                  />
                }
                label={t("videos.dialog.active")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" margin="dense">
                <InputLabel id="users-select-label">
                  {t("videos.dialog.users")}
                </InputLabel>
                <Select
                  labelId="users-select-label"
                  multiple
                  value={selectedUsers}
                  onChange={handleUserSelection}
                  input={<OutlinedInput label={t("videos.dialog.users")} />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.length === 0 ? (
                        <Typography variant="body2" color="textSecondary">
                          {t("videos.allUsers")}
                        </Typography>
                      ) : (
                        selected.map((value) => {
                          const user = users.find(u => u.id === value);
                          return (
                            <Chip key={value} label={user?.name || value} />
                          );
                        })
                      )}
                    </Box>
                  )}
                  MenuProps={MenuProps}
                >
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Checkbox checked={selectedUsers.indexOf(user.id) > -1} />
                      <ListItemText primary={user.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="textSecondary">
                {t("videos.dialog.usersHelp")}
              </Typography>
            </Grid>
            {videoUrl && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  {t("videos.dialog.preview")}
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: 0,
                    paddingTop: "56.25%", 
                    position: "relative",
                    marginTop: 1,
                    marginBottom: 2,
                    backgroundColor: "#f0f0f0",
                    backgroundImage: `url(${getVideoThumbnail(videoUrl)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Tooltip title={t("videos.buttons.cancel")}>
            <Button 
              onClick={handleCloseModal} 
              color="secondary"
              sx={{
                minWidth: "40px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                p: 0,
              }}
            >
              <CloseIcon />
            </Button>
          </Tooltip>
          <Tooltip title={t("videos.buttons.save")}>
            <Button 
              onClick={handleSaveVideo} 
              color="primary" 
              variant="contained"
              sx={{
                minWidth: "40px",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                p: 0,
              }}
            >
              <SaveIcon />
            </Button>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </Dialog>
    
    <VideoPlayerDialog
      open={playerOpen}
      onClose={handleClosePlayer}
      maxWidth={false}
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1, pr: 2 }}>
          {currentVideoTitle}
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleClosePlayer} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <VideoPlayerContainer>
          {currentVideoUrl && (
            <VideoIframe
              src={currentVideoUrl}
              title={currentVideoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          )}
        </VideoPlayerContainer>
      </DialogContent>
    </VideoPlayerDialog>
  </MainContainer>
  )
};

export default Videos;
