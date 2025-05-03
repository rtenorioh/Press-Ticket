import { Chip, FormControl, MenuItem, Select, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const ChipsDiv = styled('div')(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(0.5),
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.25),
  borderRadius: theme.spacing(2),
  '& .MuiChip-label': {
    fontWeight: 500,
  }
}));

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
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
        {t("whatsappSelect.inputLabel")}
      </Typography>
      <FormControl fullWidth variant="outlined">
        <Select
          multiple
          value={selectedWhatsappIds}
          onChange={handleChange}
          displayEmpty
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
    </Box>
  );
};

export default ConectionSelect;
