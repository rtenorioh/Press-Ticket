import { useState, useEffect, useCallback } from "react";
import { Autocomplete, TextField, Chip, CircularProgress } from "@mui/material";
import api from "../../services/api";

const normalizeNumber = (n) => (n || "").replace(/\D/g, "");

/**
 * Autocomplete de seleção múltipla de contatos com busca server-side.
 *
 * Props:
 *  - value: Contact[]          contatos selecionados
 *  - onChange: (Contact[]) => void
 *  - excludeNumbers: string[]  números já membros do grupo (ficam desabilitados)
 *  - disabled: boolean
 *  - label: string
 */
const ContactsAutocomplete = ({
  value = [],
  onChange,
  excludeNumbers = [],
  disabled = false,
  label = "Participantes",
}) => {
  const [contacts, setContacts] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchContacts = useCallback(async (search) => {
    setLoading(true);
    try {
      const { data } = await api.get("/contacts/", {
        params: { searchParam: search, pageNumber: 1, isGroup: "false" },
      });
      setContacts(data.contacts || []);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts("");
  }, [fetchContacts]);

  useEffect(() => {
    const timer = setTimeout(() => fetchContacts(searchTerm), 350);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchContacts]);

  const handleInputChange = (_, newValue, reason) => {
    setInputValue(newValue);
    if (reason === "input") {
      setSearchTerm(newValue);
    }
  };

  return (
    <Autocomplete
      multiple
      options={contacts}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      getOptionLabel={(option) =>
        typeof option === "string"
          ? option
          : option.name
          ? `${option.name} (${option.number})`
          : option.number
      }
      isOptionEqualToValue={(option, val) => option.id === val.id}
      getOptionDisabled={(option) =>
        excludeNumbers.some(
          (n) => normalizeNumber(n) === normalizeNumber(option.number)
        )
      }
      filterOptions={(x) => x}
      noOptionsText="Nenhum contato encontrado"
      loading={loading}
      disabled={disabled}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip
            key={option.id}
            label={option.name || option.number}
            size="small"
            color="primary"
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={value.length === 0 ? "Buscar por nome ou número..." : ""}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={16} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default ContactsAutocomplete;
