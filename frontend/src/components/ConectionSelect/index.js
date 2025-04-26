import { Chip, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const ChipsDiv = styled('div')({
  display: "flex",
  flexWrap: "wrap",
});

const StyledChip = styled(Chip)({
  margin: 2,
});

const ConectionSelect = ({ selectedWhatsappIds, onChange }) => {
  const [whatsapps, setWhatsapps] = useState([]);
  const { t } = useTranslation();
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;

    (async () => {
      try {
        const { data } = await api.get("/whatsapp");
        setWhatsapps(data);
        loaded.current = true;
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  const handleChange = e => {
    onChange(e.target.value);
  };

  return (
    <div style={{ marginTop: 6 }}>
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel>{t("whatsappSelect.inputLabel")}</InputLabel>
        <Select
          multiple
          label={t("whatsappSelect.inputLabel")}
          value={selectedWhatsappIds}
          onChange={handleChange}
          inputProps={{
            'aria-label': t("whatsappSelect.inputLabel"),
          }}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
          }}
          renderValue={selected => (
            <ChipsDiv>
              {selected?.length > 0 &&
                selected.map(id => {
                  const whatsapp = whatsapps.find(q => q.id === id);
                  return whatsapp ? (
                    <StyledChip
                      key={id}
                      sx={{ backgroundColor: whatsapp.color || "#f0f0f0" }}
                      variant="outlined"
                      label={whatsapp.name}
                    />
                  ) : null;
                })}
            </ChipsDiv>
          )}
        >
          {whatsapps.map(whatsapp => (
            <MenuItem key={whatsapp.id} value={whatsapp.id}>
              {whatsapp.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ConectionSelect;
