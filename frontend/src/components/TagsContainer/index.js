import { Chip, Paper, TextField, Autocomplete } from "@mui/material";
import { isArray, isString } from "lodash";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

export function TagsContainer({ contact }) {
    const { t } = useTranslation();
    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);

    const colorGenerator = () => {
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        return randomColor;
    };

    const createTag = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tags`, data);
            return responseData;
        } catch (err) {
            toastError(err);
        }
    }

    const loadTags = async () => {
        try {
            const { data } = await api.get(`/tags/list`);
            setTags(data);
        } catch (err) {
            toastError(err);
        }
    }

    const syncTags = async (data) => {
        try {
            const { data: responseData } = await api.post(`/tags/sync`, data);
            return responseData;
        } catch (err) {
            toastError(err, t);
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

    const onChange = async (value, reason) => {
        let optionsChanged = []
        if (reason === 'create-option') {
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
        } else {
            optionsChanged = value;
        }
        setSelecteds(optionsChanged);
        await syncTags({ contactId: contact.id, tags: optionsChanged });
    }

    return (
        <Paper sx={{ padding: 1.5 }}>
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selecteds}
                freeSolo
                onChange={(e, v, r) => onChange(v, r)}
                getOptionLabel={(option) => option.name}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            key={option?.name}
                            variant="outlined"
                            sx={{
                                backgroundColor: option.color || colorGenerator(),
                                textShadow: '1px 1px 1px #000',
                                color: 'white',
                            }}
                            label={option.name}
                            {...getTagProps({ index })}
                            size="small"
                        />
                    ))
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
