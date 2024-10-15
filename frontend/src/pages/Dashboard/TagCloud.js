import { Chip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import Title from "./Title";

const useStyles = makeStyles((theme) => ({
    chip: {
        margin: theme.spacing(0.5),
        fontWeight: 500,
    },
}));

const TagCloud = () => {
    const classes = useStyles();
    const [tags, setTags] = useState([]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const { data } = await api.get("/tags-with-count");
                setTags(data.tags);
            } catch (err) {
                console.error("Error fetching tags: ", err);
            }
        };

        fetchTags();
    }, []);

    return (
        <div>
            <h2><Title>{i18n.t("dashboard.tags.cloudTitle")} {tags.length}</Title></h2>
            {tags.length > 0 ? (
                <div>
                    {tags.map((tag) => (
                        <Chip
                            key={tag.id}
                            label={`${tag.name} (${tag.usageCount})`}
                            style={{
                                backgroundColor: tag.color,
                                borderRadius: "8px",
                                padding: "6px 12px",
                            }}
                            className={classes.chip}
                        />
                    ))}
                </div>
            ) : (
                <p>{i18n.t("dashboard.tags.noTags")}</p>
            )}
        </div>
    );
};

export default TagCloud;
