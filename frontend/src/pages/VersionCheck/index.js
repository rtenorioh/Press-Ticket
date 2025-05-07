import React, { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box, 
  Button,
  CircularProgress,
  Link
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import { AuthContext } from "../../context/Auth/AuthContext";
import { getVersionInfo } from "../../services/versionService";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import toastError from "../../errors/toastError";
import { Can } from "../../components/Can";

const MainPaper = styled(Paper)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "scroll",
  ...(theme.scrollbarStyles || {}),
}));

const CardWrapper = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const VersionCard = styled(Card)(({ theme, status }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
  borderRadius: 10,
  border: status === "updated" || status === "latest" 
    ? `2px solid ${theme.palette.success.main}`
    : status === "outdated"
      ? `2px solid ${theme.palette.error.main}`
      : `2px solid ${theme.palette.divider}`,
  backgroundColor: status === "updated" || status === "latest" 
    ? theme.palette.success.light + "20"
    : status === "outdated"
      ? theme.palette.error.light + "20"
      : theme.palette.background.paper,
  "&:hover": {
    boxShadow: "0 8px 30px 0 rgba(0,0,0,0.15)",
    transform: "translateY(-5px)",
  }
}));

const VersionIcon = styled(Box)(({ theme, status }) => ({
  position: "absolute",
  top: 15,
  right: 15,
  width: 40,
  height: 40,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: status === "updated" || status === "latest" 
    ? theme.palette.success.main
    : status === "outdated"
      ? theme.palette.error.main
      : theme.palette.success.main,
  color: "#fff",
  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
}));

const VersionValue = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: 700,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const MessageBox = styled(Paper)(({ theme, type }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: type === "success"
    ? theme.palette.success.light + "30"
    : theme.palette.warning.light + "30",
  borderLeft: type === "success"
    ? `4px solid ${theme.palette.success.main}`
    : `4px solid ${theme.palette.warning.main}`,
  borderRadius: 4,
}));

const VersionCheck = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [versionInfo, setVersionInfo] = useState({
    currentVersion: "",
    latestVersion: "",
    needsUpdate: false
  });

  useEffect(() => {
    const fetchVersionInfo = async () => {
      try {
        setLoading(true);
        const data = await getVersionInfo();
        setVersionInfo(data);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVersionInfo();
  }, []);

  const handleRefreshVersion = async () => {
    try {
      setLoading(true);
      toast.dismiss();
      const data = await getVersionInfo();
      setVersionInfo(data);
      toast.success(t("versionCheck.success"));
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{t("versionCheck.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRefreshVersion}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SystemUpdateIcon />}
          >
            {t("versionCheck.checkUpdates")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <MainPaper variant="outlined">
        <Container maxWidth="lg">
          <Typography variant="h6" gutterBottom>
            {t("versionCheck.statusTitle")}
          </Typography>
          
          {loading ? (
            <Box display="flex" justifyContent="center" my={8}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <CardWrapper container spacing={4}>
                <Grid item xs={12} md={6}>
                  <VersionCard status={versionInfo.needsUpdate ? "outdated" : "updated"}>
                    <VersionIcon status={versionInfo.needsUpdate ? "outdated" : "updated"}>
                      {versionInfo.needsUpdate ? (
                        <ErrorIcon />
                      ) : (
                        <CheckCircleIcon />
                      )}
                    </VersionIcon>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {t("versionCheck.currentVersion")}
                      </Typography>
                      <VersionValue color={versionInfo.needsUpdate ? "error" : "success"}>
                        {versionInfo.currentVersion || "N/A"}
                      </VersionValue>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {versionInfo.needsUpdate 
                          ? t("versionCheck.outdated")
                          : t("versionCheck.upToDate")}
                      </Typography>
                    </CardContent>
                  </VersionCard>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <VersionCard status="latest">
                    <VersionIcon status="latest">
                      <CheckCircleIcon />
                    </VersionIcon>
                    <CardContent>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {t("versionCheck.latestVersion")}
                      </Typography>
                      <VersionValue>
                        {versionInfo.latestVersion || "N/A"}
                      </VersionValue>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {t("versionCheck.latestAvailable")}
                      </Typography>
                    </CardContent>
                  </VersionCard>
                </Grid>
              </CardWrapper>

              {versionInfo.needsUpdate ? (
                <MessageBox type="warning">
                  <Box display="flex" alignItems="flex-start">
                    <ErrorIcon color="warning" style={{ marginRight: 16, marginTop: 4 }} />
                    <div>
                      <Typography variant="h6" gutterBottom>
                        {t("versionCheck.updateAvailable")}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {t("versionCheck.updateMessage")}
                      </Typography>
                      <Can
                        role={user?.profile}
                        perform="version-check:show"
                        yes={() => (
                          <>
                            <Typography variant="body2" color="textSecondary">
                              {t("versionCheck.repositoryLink")}: 
                              <Link 
                                href="https://github.com/rtenorioh/Press-Ticket" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ marginLeft: 8 }}
                              >
                                {t("versionCheck.repository")}
                              </Link>
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {t("versionCheck.updateLink")}: 
                              <Link 
                                href="https://github.com/rtenorioh/Press-Ticket/blob/main/docs/INSTALL_AUTOMATICO_VPS.md" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ marginLeft: 8 }}
                              >
                                {t("versionCheck.update")}
                              </Link>
                            </Typography>
                          </>
                        )}
                      />
                    </div>
                  </Box>
                </MessageBox>
              ) : (
                <MessageBox type="success">
                  <Box display="flex" alignItems="flex-start">
                    <CheckCircleIcon color="success" style={{ marginRight: 16, marginTop: 4 }} />
                    <div>
                      <Typography variant="h6" gutterBottom>
                        {t("versionCheck.upToDateTitle")}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {t("versionCheck.upToDateMessage")}
                      </Typography>
                    </div>
                  </Box>
                </MessageBox>
              )}
            </>
          )}
        </Container>
      </MainPaper>
    </MainContainer>
  );
};

export default VersionCheck;
