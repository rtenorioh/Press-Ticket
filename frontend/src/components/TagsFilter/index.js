import React, { useState, useEffect } from "react";
import { Autocomplete, Chip, Paper, TextField } from "@mui/material";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const TagsFilter = ({ onFiltered, initialTags = [] }) => {

    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState(initialTags);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const { data } = await api.get(`/tags/list`);
                if (isMounted) {
                    setTags(data);
                }
            } catch (err) {
                if (isMounted) {
                    toastError(err);
                }
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (initialTags && initialTags.length > 0) {
            setSelecteds(initialTags);
        }
    }, [initialTags]);

    const onChange = async (value) => {
        setSelecteds(value);
        onFiltered(value);
    }

    return (
        <Paper sx={{ padding: 1 }}>
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selecteds}
                onChange={(e, v) => onChange(v)}
                getOptionLabel={(option) => option.name}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="outlined"
                            sx={{ 
                                backgroundColor: option.color || '#eee', 
                                textShadow: '1px 1px 1px #000', 
                                color: 'white' 
                            }}
                            label={option.name}
                            {...getTagProps({ index })}
                            size="small"
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Filtro por Tags" />
                )}
            />
        </Paper>
    )
}

export default TagsFilter;
