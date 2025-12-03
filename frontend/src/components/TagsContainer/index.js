import { Chip, Paper, TextField, Autocomplete, createFilterOptions } from "@mui/material";
import { isArray, isString } from "lodash";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

export function TagsContainer({ contact }) {
    const { t } = useTranslation();
    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    
    const filter = createFilterOptions();

    const colorGenerator = () => {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        return randomColor;
    };

    const createTag = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tags`, data);
            return responseData;
        } catch (err) {
            toastError(err, t);
        }
    }

    const loadTags = async () => {
        try {
            const { data } = await api.get(`/tags/list`);
            setTags(data);
        } catch (err) {
            toastError(err, t);
        }
    }

    const syncTags = async (data) => {
        try {
            const payload = {
                ...data,
                tags: Array.isArray(data.tags) ? data.tags : []
            };
            
            const { data: responseData } = await api.post(`/tags/sync`, payload);
            return responseData;
        } catch (err) {
            if (err.response?.data?.error === "Nenhuma tag válida fornecida") {
                return { message: "Tags removidas com sucesso" };
            } else {
                toastError(err, t);
            }
        }
    }

    useEffect(() => {
        if (contact) {
            async function fetchData() {
                await loadTags();
                if (Array.isArray(contact.tags)) {
                    setSelecteds(contact.tags);
                }
            }
            fetchData();
        }
    }, [contact]);

    const onChange = async (event, value, reason) => {
        let optionsChanged = []
        
        if (reason === 'createOption') {
            if (isArray(value)) {
                for (let item of value) {
                    if (isString(item)) {
                        const newTag = await createTag({ name: item, color: colorGenerator() })
                        optionsChanged.push(newTag);
                    } else {
                        optionsChanged.push(item);
                    }
                }
            }
            await loadTags();
        } else if (reason === 'removeOption' || reason === 'clear') {
            optionsChanged = Array.isArray(value) ? value : [];
        } else {
            optionsChanged = value || [];
        }
        
        if (!optionsChanged) optionsChanged = [];
        
        setSelecteds(optionsChanged);
        await syncTags({ contactId: contact.id, tags: optionsChanged });
    }

    return (
        <Paper sx={{ padding: 1.5 }}>
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selecteds || []}
                freeSolo
                selectOnFocus
                handleHomeEndKeys
                clearOnBlur
                clearOnEscape
                onChange={(e, v, r) => onChange(e, v, r)}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                filterOptions={(options, params) => {
                    const filtered = filter(options, params);
                    const { inputValue } = params;
                    const isExisting = options.some((option) => inputValue === option.name);
                    if (inputValue !== '' && !isExisting) {
                        filtered.push(inputValue);
                    }
                    
                    return filtered;
                }}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                        const isString = typeof option === 'string';
                        const tagName = isString ? option : option?.name;
                        const tagColor = isString ? colorGenerator() : option?.color || colorGenerator();
                        
                        return (
                            <Chip
                                key={isString ? `tag-${index}` : option?.name}
                                variant="outlined"
                                sx={{
                                    backgroundColor: tagColor,
                                    textShadow: '1px 1px 1px #000',
                                    color: 'white',
                                }}
                                label={tagName}
                                {...getTagProps({ index })}
                                size="small"
                            />
                        );
                    })
                }
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Tags" />
                )}
                PaperComponent={({ children }) => (
                    <Paper sx={{ width: 400, marginLeft: 1.5 }}>
                        {children}
                    </Paper>
                )}
            />
        </Paper>
    )
}
