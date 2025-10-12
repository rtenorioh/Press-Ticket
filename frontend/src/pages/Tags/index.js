import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Chip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import DeleteForever from "@mui/icons-material/DeleteForever";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Edit from "@mui/icons-material/Edit";
import Search from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import openSocket from "../../services/socket-io";

const reducer = (state, action) => {
  if (action.type === "LOAD_TAGS") {
    const tags = action.payload;
    const newTags = [];

    tags.forEach((tag) => {
      const tagIndex = state.findIndex((s) => s.id === tag.id);
      if (tagIndex !== -1) {
        state[tagIndex] = tag;
      } else {
        newTags.push(tag);
      }
    });

    return [...state, ...newTags];
  }

  if (action.type === "UPDATE_TAGS") {
    const tag = action.payload;
    const tagIndex = state.findIndex((s) => s.id === tag.id);

    if (tagIndex !== -1) {
      state[tagIndex] = tag;
      return [...state];
    } else {
      return [tag, ...state];
    }
  }

  if (action.type === "DELETE_TAG") {
    const tagId = action.payload;

    const tagIndex = state.findIndex((s) => s.id === tagId);
    if (tagIndex !== -1) {
      state.splice(tagIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  overflowY: "scroll",
  ...theme.scrollbarStyles,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  [theme.breakpoints.down("md")]: {
    marginBottom: theme.spacing(1),
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  [theme.breakpoints.down("md")]: {
    marginTop: theme.spacing(1),
  },
}));

const Tags = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [deletingAllTags, setDeletingAllTags] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  const fetchTags = useCallback(async () => {
    try {
      const { data } = await api.get("/tags/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_TAGS", payload: data.tags });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err, t);
    }
  }, [searchParam, pageNumber, t]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchTags();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, fetchTags]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("tags", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_TAGS", payload: data.tags });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_TAGS", payload: +data.tagId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = (tagData) => {
    setSelectedTag(null);
    setTagModalOpen(false);
    
    if (tagData) {
      dispatch({ type: "UPDATE_TAGS", payload: tagData });
    }
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(t("tags.toasts.deleted"));
      
      dispatch({ type: "DELETE_TAG", payload: tagId });
    } catch (err) {
      toastError(err, t);
    }
    setDeletingTag(null);
  };

  const handleDeleteAllTags = async () => {
    try {
      await api.delete(`/tags`);
      toast.success(t("tags.toasts.deletedAll"));
      dispatch({ type: "RESET" });
    } catch (err) {
      toastError(err, t);
    }
    setDeletingAllTags(null);
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleViewContacts = (tag) => {
    navigate('/contacts', { state: { tagFilter: tag } });
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingTag ? `${t("tags.confirmationModal.deleteTitle")}`
            : `${t("tags.confirmationModal.deleteAllTitle")}`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() =>
          deletingTag ? handleDeleteTag(deletingTag.id)
            : handleDeleteAllTags(deletingAllTags)
        }
      >
        {
          deletingTag ? `${t("tags.confirmationModal.deleteMessage")}`
            : `${t("tags.confirmationModal.deleteAllMessage")}`
        }
      </ConfirmationModal>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        reload={fetchTags}
        aria-labelledby="form-dialog-title"
        tagId={selectedTag && selectedTag.id}
      />
      <MainHeader>
        <Title>{t("tags.title")} {tags.length > 0 ? `(${tags.length})` : ""}</Title>
        <MainHeaderButtonsWrapper>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            width: '100%',
            gap: 1
          }}>
            <SearchContainer>
              <TextField
                placeholder={t("contacts.searchPlaceholder")}
                type="search"
                fullWidth
                size="small"
                value={searchParam}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="secondary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  py: 0,
                  '& .MuiOutlinedInput-root': {
                    height: 40
                  }
                }}
              />
            </SearchContainer>
            <ButtonContainer>
              <Tooltip title={t("tags.buttons.add")}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenTagModal}
                  sx={{
                    minWidth: { xs: '100%', md: 'auto' },
                    height: 40
                  }}
                >
                  <AddCircleOutline />
                </Button>
              </Tooltip>
              <Tooltip title={t("tags.buttons.deleteAll")}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    setConfirmModalOpen(true);
                    setDeletingAllTags(tags);
                  }}
                  sx={{
                    minWidth: { xs: '100%', md: 'auto' },
                    height: 40
                  }}
                >
                  <DeleteForever />
                </Button>
              </Tooltip>
            </ButtonContainer>
          </Box>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <MainPaper
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">{t("tags.table.id")}</TableCell>
              <TableCell align="center">{t("tags.table.name")}</TableCell>
              <TableCell align="center">{t("tags.table.color")}</TableCell>
              <TableCell align="center">{t("tags.table.contacts")}</TableCell>
              <TableCell align="center">{t("tags.table.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell align="center">
                    {tag.id}
                  </TableCell>
                  <TableCell align="center">
                    {tag.name}
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{
                        backgroundColor: tag.color,
                        width: 40,
                        height: 20,
                        margin: "0 auto",
                        borderRadius: 10
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={t("tags.buttons.viewContacts", { defaultValue: "Ver contatos com esta tag" })}>
                      <Chip
                        label={tag.contacttag && tag.contacttag.length > 0 ? tag.contacttag.length : 0}
                        onClick={() => handleViewContacts(tag)}
                        icon={<VisibilityIcon />}
                        color="primary"
                        variant="outlined"
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'white'
                          }
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditTag(tag)}
                    >
                      <Edit color="info" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingTag(tag);
                      }}
                    >
                      <DeleteOutline color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={3} />}
            </>
          </TableBody>
        </Table>
      </MainPaper>
    </MainContainer>
  );
};

export default Tags;
