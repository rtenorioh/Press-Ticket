import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Divider,
  Grid,
  IconButton
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogTitle-root': {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
    backgroundColor: '#f5f5f5',
  },
}));

const FieldGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const GroupTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1),
  fontSize: '0.95rem',
}));

const ExportFieldsModal = ({ open, onClose, onExport, t }) => {
  const availableFields = [
    { id: 'id', label: t("contacts.exportModal.fields.id"), group: 'basic', default: true },
    { id: 'name', label: t("contacts.exportModal.fields.name"), group: 'basic', default: true },
    { id: 'number', label: t("contacts.exportModal.fields.number"), group: 'basic', default: true },
    { id: 'email', label: t("contacts.exportModal.fields.email"), group: 'basic', default: true },
    { id: 'cpf', label: t("contacts.exportModal.fields.cpf"), group: 'personal', default: false },
    { id: 'birthdate', label: t("contacts.exportModal.fields.birthdate"), group: 'personal', default: false },
    { id: 'gender', label: t("contacts.exportModal.fields.gender"), group: 'personal', default: false },
    { id: 'status', label: t("contacts.exportModal.fields.status"), group: 'basic', default: true },
    { id: 'address', label: t("contacts.exportModal.fields.address"), group: 'address', default: false },
    { id: 'addressNumber', label: t("contacts.exportModal.fields.addressNumber"), group: 'address', default: false },
    { id: 'addressComplement', label: t("contacts.exportModal.fields.addressComplement"), group: 'address', default: false },
    { id: 'neighborhood', label: t("contacts.exportModal.fields.neighborhood"), group: 'address', default: false },
    { id: 'city', label: t("contacts.exportModal.fields.city"), group: 'address', default: false },
    { id: 'state', label: t("contacts.exportModal.fields.state"), group: 'address', default: false },
    { id: 'zip', label: t("contacts.exportModal.fields.zip"), group: 'address', default: false },
    { id: 'country', label: t("contacts.exportModal.fields.country"), group: 'address', default: false },
    { id: 'isGroup', label: t("contacts.exportModal.fields.isGroup"), group: 'basic', default: false },
    { id: 'profilePicUrl', label: t("contacts.exportModal.fields.profilePicUrl"), group: 'basic', default: false },
    { id: 'extraInfo', label: t("contacts.exportModal.fields.extraInfo"), group: 'custom', default: false },
    { id: 'tags', label: t("contacts.exportModal.fields.tags"), group: 'basic', default: true },
    { id: 'createdAt', label: t("contacts.exportModal.fields.createdAt"), group: 'dates', default: false },
    { id: 'updatedAt', label: t("contacts.exportModal.fields.updatedAt"), group: 'dates', default: false },
    { id: 'lastContactAt', label: t("contacts.exportModal.fields.lastContactAt"), group: 'dates', default: false },
  ];

  const [selectedFields, setSelectedFields] = useState(
    availableFields.filter(f => f.default).map(f => f.id)
  );

  const handleToggleField = (fieldId) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldId)) {
        return prev.filter(id => id !== fieldId);
      } else {
        return [...prev, fieldId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedFields(availableFields.map(f => f.id));
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
  };

  const handleExport = () => {
    onExport(selectedFields);
    onClose();
  };

  const groups = {
    basic: { title: t("contacts.exportModal.groups.basic"), fields: [] },
    personal: { title: t("contacts.exportModal.groups.personal"), fields: [] },
    address: { title: t("contacts.exportModal.groups.address"), fields: [] },
    custom: { title: t("contacts.exportModal.groups.custom"), fields: [] },
    dates: { title: t("contacts.exportModal.groups.dates"), fields: [] },
  };

  availableFields.forEach(field => {
    if (groups[field.group]) {
      groups[field.group].fields.push(field);
    }
  });

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">{t("contacts.exportModal.title")}</Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckBoxIcon />}
            onClick={handleSelectAll}
          >
            {t("contacts.exportModal.selectAll")}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CheckBoxOutlineBlankIcon />}
            onClick={handleDeselectAll}
          >
            {t("contacts.exportModal.deselectAll")}
          </Button>
          <Box sx={{ ml: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              {t("contacts.exportModal.selectedCount", { 
                count: selectedFields.length, 
                total: availableFields.length 
              })}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {Object.entries(groups).map(([groupKey, group]) => {
          if (group.fields.length === 0) return null;
          
          return (
            <FieldGroup key={groupKey}>
              <GroupTitle>{group.title}</GroupTitle>
              <Grid container spacing={1}>
                {group.fields.map(field => (
                  <Grid item xs={12} sm={6} md={4} key={field.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedFields.includes(field.id)}
                          onChange={() => handleToggleField(field.id)}
                          size="small"
                        />
                      }
                      label={<Typography variant="body2">{field.label}</Typography>}
                    />
                  </Grid>
                ))}
              </Grid>
            </FieldGroup>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t("contacts.exportModal.buttons.cancel")}
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          color="primary"
          disabled={selectedFields.length === 0}
        >
          {t("contacts.exportModal.buttons.export", { count: selectedFields.length })}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ExportFieldsModal;
