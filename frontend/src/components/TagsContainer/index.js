import { Chip, Paper, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useContext, useEffect, useState } from "react";
import { isArray, isString } from "lodash";
import toastError from "../../errors/toastError";
import api from "../../services/api";

import { AuthContext } from "../../context/Auth/AuthContext";


export function TagsContainer({ contact }) {

    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    const { user } = useContext(AuthContext);
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
            toastError(err);
        }
    }

    const onChange = async (value, reason) => {
        let optionsChanged = []
        if (reason === 'create-option') {
            if (isArray(value)) {
                for (let item of value) {
                    if (isString(item)) {
                        const newTag = await createTag({ name: item })
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
    const isRemoveTags = user.isRemoveTags === 'enabled';
    return (
        <Paper style={{ padding: 12 }}>

            <Autocomplete
                //clearOnBlur={false}
                disableClearable={true}
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
                            variant="outlined"
                            style={{ backgroundColor: option.color || '#eee', textShadow: '1px 1px 1px #000', color: 'white', padding: 5 }}
                            label={option.name}
                            {...(isRemoveTags && getTagProps({ index }))}
                            size="small"
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Tags" />//clearOnBlur={false} />
                )}
                PaperComponent={({ children }) => (
                    <Paper style={{ width: 400, marginLeft: 12 }}>
                        {children}
                    </Paper>
                )}
            />
        </Paper>
    )
}