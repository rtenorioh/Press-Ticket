import React, { useContext, useState, useEffect, useReducer, useCallback } from "react";
import { toast } from "react-toastify";
import openSocket from "socket.io-client";

import { makeStyles } from "@material-ui/core/styles";
import { CSVLink } from "react-csv";
import {
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
  Tooltip
} from "@material-ui/core";

import {
  AddCircleOutline,
  DeleteForever,
  DeleteOutline,
  Archive,
  Edit,
  Search
} from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { Can } from "../../components/Can"
import { AuthContext } from "../../context/Auth/AuthContext";


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

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const Tags = () => {
  const classes = useStyles();

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
  const { user } = useContext(AuthContext);

  const fetchTags = useCallback(async () => {
    try {
      const { data } = await api.get("/tags/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_TAGS", payload: data.tags });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

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
    const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

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

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
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
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchTags();
  };

  const handleDeleteAllTags = async () => {
    try {
      await api.delete(`/tags`);
      toast.success(i18n.t("tags.toasts.deletedAll"));
    } catch (err) {
      toastError(err);
    }
    setDeletingAllTags(null);
    setSearchParam("");
    setPageNumber();

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchTags();
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

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingTag ? `${i18n.t("tags.confirmationModal.deleteTitle")}`
            : `${i18n.t("tags.confirmationModal.deleteAllTitle")}`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() =>
          deletingTag ? handleDeleteTag(deletingTag.id)
            : handleDeleteAllTags(deletingAllTags)
        }
      >
        {
          deletingTag ? `${i18n.t("tags.confirmationModal.deleteMessage")}`
            : `${i18n.t("tags.confirmationModal.deleteAllMessage")}`
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
        <Title >{i18n.t("tags.title")} ({tags.length})</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="secondary" />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title={i18n.t("tags.buttons.add")}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenTagModal}
            >
              <AddCircleOutline />
            </Button>
          </Tooltip>




          <Can
            role={user.profile}
            perform="drawer-admin-items:view"
            yes={() => (//Função que identifica o usuario e bloqueia a visão caso não seja admin

              <CSVLink
                className={classes.csvbtn}
                separator=";"
                filename="mkthub-contacts.csv"
                data={tags.flatMap((tag) => tag.contacts.map((contact) => ({
                  tagName: tag.name,
                  contactName: contact.name,
                  contactNumber: contact.number
                })))}>


                <Tooltip title={i18n.t("tags.buttons.download")}>
                  <Button
                    variant="contained"
                    color="primary"
                  >
                    <Archive />
                  </Button>
                </Tooltip>
              </CSVLink>

            )}
          />

          <Can
            role={user.profile}
            perform="drawer-admin-items:view"
            yes={() => (//Função que identifica o usuario e bloqueia a visão caso não seja admin

              <Tooltip Tooltip title={i18n.t("tags.buttons.deleteAll")}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    setConfirmModalOpen(true);
                    setDeletingAllTags(tags);
                  }}
                >
                  <DeleteForever />
                </Button>
              </Tooltip>

            )}
          />



        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
            <TableCell align="center">{i18n.t("tags.table.id")}</TableCell>
              <TableCell align="center">{i18n.t("tags.table.name")}</TableCell>
              <TableCell align="center">{i18n.t("tags.table.color")}</TableCell>
              <TableCell align="center">{i18n.t("tags.table.contacts")}</TableCell>
              <TableCell align="center">{i18n.t("tags.table.actions")}</TableCell>
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
                    <div className={classes.customTableCell}>
                      <span
                        style={{
                          backgroundColor: tag.color,
                          width: 20,
                          height: 20,
                          alignSelf: "center",
                          borderRadius: 10
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell align="center">{tag.contacttag.length ? (<span>{tag.contacttag.length}</span>) : <span>0</span>}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditTag(tag)}
                    >
                      <Edit color="secondary" />
                    </IconButton>


                    <Can
                      role={user.profile}
                      perform="drawer-admin-items:view"
                      yes={() => (//Função que identifica o usuario e bloqueia a visão caso não seja admin
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setConfirmModalOpen(true);
                            setDeletingTag(tag);
                          }}
                        >
                          <DeleteOutline color="secondary" />
                        </IconButton>

                      )}
                    />

                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Tags;