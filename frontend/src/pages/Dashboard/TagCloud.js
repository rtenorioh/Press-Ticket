import { Chip, Paper, Box, Typography } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Title from "./Title";

const ChartPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2, 1.5, 1.5, 1.5),
    background: theme.palette.mode === 'dark' 
      ? theme.palette.background.paper
      : `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.background.paper} 100%)`,
    borderRadius: 18,
    boxShadow: theme.palette.mode === 'dark'
      ? "0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 2px 8px 0 rgba(0, 0, 0, 0.3)"
      : "0 8px 32px 0 rgba(80, 80, 160, 0.12), 0 2px 8px 0 rgba(80, 80, 160, 0.08)",
    marginBottom: theme.spacing(1),
    overflow: 'unset',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: theme.palette.mode === 'dark' 
      ? `2px solid ${theme.palette.divider}` 
      : `1px solid ${theme.palette.grey[200]}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: theme.palette.mode === 'dark'
        ? "0 12px 40px 0 rgba(0, 0, 0, 0.6), 0 4px 12px 0 rgba(0, 0, 0, 0.4)"
        : "0 12px 40px 0 rgba(80, 80, 160, 0.16), 0 4px 12px 0 rgba(80, 80, 160, 0.12)",
      transform: 'translateY(-2px)',
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(1.5, 1, 1, 1),
    },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
    margin: theme.spacing(1),
    fontWeight: 500,
    color: "#fff",
    borderRadius: "8px",
    background: theme.palette.primary.dark,
    boxShadow: "0 2px 8px 0 rgba(80, 80, 160, 0.10)",
    transition: "transform 0.2s, box-shadow 0.2s",
    '&:hover': {
        transform: "scale(1.07)",
        boxShadow: "0 4px 12px rgba(80,80,160,0.14)"
    }
}));

const TagContainer = styled(Box)(({ theme }) => ({
    margin: theme.spacing(2, 0),
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 60,
}));

const TagCounter = styled('span')(({ theme }) => ({
    fontSize: "0.8rem",
    marginLeft: theme.spacing(0.5),
    color: "#fff",
}));

const TagCloud = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
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

    const handleViewContacts = (tag) => {
        navigate('/contacts', { state: { tagFilter: tag } });
    };

    return (
        <ChartPaper>
            <Box display="flex" alignItems="center" width="100%" mb={1}>
                <Title sx={{ flex: 1, mb: 0 }}>{t("dashboard.tags.cloudTitle")} {tags.length}</Title>
            </Box>
            {tags.length > 0 ? (
                <TagContainer>
                    {tags.map((tag) => (
                        <StyledChip
                            key={tag.id}
                            label={
                                <span>
                                    {tag.name}
                                    <TagCounter> ({tag.usageCount})</TagCounter>
                                </span>
                            }
                            onClick={() => handleViewContacts(tag)}
                            sx={{
                                backgroundColor: tag.color,
                                color: theme.palette.getContrastText(tag.color || theme.palette.primary.dark),
                                fontWeight: 500,
                                fontSize: '1rem',
                                minWidth: 80,
                                justifyContent: 'center',
                            }}
                        />
                    ))}
                </TagContainer>
            ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4, mb: 4 }}>
                    {t("dashboard.tags.noTags")}
                </Typography>
            )}
        </ChartPaper>
    );
};

export default TagCloud;
