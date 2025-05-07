import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import useWhatsApps from "../../hooks/useWhatsApps";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import { Can } from "../Can";

const MaxWidthFormControl = styled(FormControl)(({ theme }) => ({
  width: "100%",
}));

const filterOptions = createFilterOptions({
  trim: true,
});

const TransferTicketModal = ({ modalOpen, onClose, ticketid, ticketWhatsappId }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const [queues, setQueues] = useState([]);
  const [allQueues, setAllQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState('');
  const [selectedWhatsapp, setSelectedWhatsapp] = useState(ticketWhatsappId);
  const { findAll: findAllQueues } = useQueues();
  const { loadingWhatsapps, whatsApps } = useWhatsApps();

  const { user: loggedInUser } = useContext(AuthContext);

  useEffect(() => {
    const loadQueues = async () => {
      const list = await findAllQueues();
      setAllQueues(list);
      setQueues(list);
    }
    loadQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam },
          });
          setOptions(data.users);
          setLoading(false);
        } catch (err) {
          setLoading(false);
          toastError(err);
        }
      };

      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, modalOpen]);

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setSelectedUser(null);
  };

  const handleSaveTicket = async e => {
    e.preventDefault();
    if (!ticketid) return;
    setLoading(true);
    try {
      let data = {};

      if (selectedUser) {
        data.userId = selectedUser.id
      }

      if (selectedQueue && selectedQueue !== null) {
        data.queueId = selectedQueue

        if (!selectedUser) {
          data.status = 'pending';
          data.userId = null;
          data.transf = true;
        }
      }

      if (selectedWhatsapp) {
        data.whatsappId = selectedWhatsapp;
      }

      await api.put(`/tickets/${ticketid}`, data);

      setLoading(false);
      navigate(`/tickets`);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
  };

  return (
    <Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
      <form onSubmit={handleSaveTicket}>
        <DialogTitle id="form-dialog-title">
          {t("transferTicketModal.title")}
        </DialogTitle>
        <DialogContent dividers>
          <Autocomplete
            sx={{ width: 300, marginBottom: 2.5 }}
            getOptionLabel={option => `${option.name}`}
            onChange={(e, newValue) => {
              setSelectedUser(newValue);
              if (newValue != null && Array.isArray(newValue.queues)) {
                setQueues(newValue.queues);
              } else {
                setQueues(allQueues);
                setSelectedQueue('');
              }
            }}
            options={options}
            filterOptions={filterOptions}
            freeSolo
            autoHighlight
            noOptionsText={t("transferTicketModal.noOptions")}
            loading={loading}
            renderInput={params => (
              <TextField
                {...params}
                label={t("transferTicketModal.fieldLabel")}
                variant="outlined"
                required
                autoFocus
                onChange={e => setSearchParam(e.target.value)}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
          <MaxWidthFormControl variant="outlined">
            <InputLabel>{t("transferTicketModal.fieldQueueLabel")}</InputLabel>
            <Select
              value={selectedQueue}
              onChange={(e) => setSelectedQueue(e.target.value)}
              label={t("transferTicketModal.fieldQueuePlaceholder")}
            >
              <MenuItem value={''}>&nbsp;</MenuItem>
              {queues?.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>{queue.name}</MenuItem>
              ))}
            </Select>
          </MaxWidthFormControl>
          <Can
            role={loggedInUser.profile}
            perform="ticket-options:transferWhatsapp"
            yes={() => (!loadingWhatsapps &&
              <MaxWidthFormControl variant="outlined" sx={{ marginTop: 2.5 }}>
                <InputLabel>{t("transferTicketModal.fieldConnectionLabel")}</InputLabel>
                <Select
                  value={selectedWhatsapp}
                  onChange={(e) => setSelectedWhatsapp(e.target.value)}
                  label={t("transferTicketModal.fieldConnectionPlaceholder")}
                >
                  {whatsApps.map((whasapp) => (
                    <MenuItem key={whasapp.id} value={whasapp.id}>{whasapp.name}</MenuItem>
                  ))}
                </Select>
              </MaxWidthFormControl>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={loading}
            variant="outlined"
          >
            {t("transferTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="submit"
            color="primary"
            loading={loading}
          >
            {t("transferTicketModal.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TransferTicketModal;
