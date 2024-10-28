import { Chip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import Title from "./Title";

const useStyles = makeStyles((theme) => ({
    chip: {
        margin: theme.spacing(1),
        fontWeight: 500,
        color: "#fff",
        boxShadow: "0 2px 5p rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        '&:hover': {
            transform: "scale(1.05)",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)"
        }
    },
    tagContainer: {
        margin: theme.spacing(2, 0),
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    tagCounter: {
        fontSize: "0.8rem",
        marginLeft: theme.spacing(0.5),
        color: "#fff",
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
            <Title>{i18n.t("dashboard.tags.cloudTitle")} {tags.length}</Title>
            {tags.length > 0 ? (
                <div className={classes.tagContainer}>
                    {tags.map((tag) => (
                        <Chip
                            key={tag.id}
                            label={
                                <span>
                                    {tag.name}
                                    <span className={classes.tagCounter}> ({tag.usageCount})</span>
                                </span>
                            }
                            style={{
                                backgroundColor: tag.color,
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
