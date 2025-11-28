import React from "react";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import { 
  Paper, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider,
  Box,
  Link
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { Can } from "../../components/Can";

import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import WhatsApp from "@mui/icons-material/WhatsApp";
import ContactPhoneOutlined from "@mui/icons-material/ContactPhoneOutlined";
import QuestionAnswerOutlined from "@mui/icons-material/QuestionAnswerOutlined";
import LocalOffer from "@mui/icons-material/LocalOffer";
import SyncAlt from "@mui/icons-material/SyncAlt";
import VideoLibraryOutlined from "@mui/icons-material/VideoLibraryOutlined";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import Code from "@mui/icons-material/Code";
import MenuBook from "@mui/icons-material/MenuBook";
import VpnKeyRounded from "@mui/icons-material/VpnKeyRounded";
import BugReportOutlined from "@mui/icons-material/BugReportOutlined";
import StorageIcon from "@mui/icons-material/Storage";
import MemoryIcon from '@mui/icons-material/Memory';
import CpuIcon from '@mui/icons-material/DeveloperBoard';
import DatabaseIcon from "@mui/icons-material/Storage";
import BackupIcon from "@mui/icons-material/Backup";
import HistoryIcon from "@mui/icons-material/History";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import QueueMonitorIcon from '@mui/icons-material/Assessment';
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import LabelOutlined from "@mui/icons-material/LabelOutlined";
import BlockIcon from "@mui/icons-material/Block";
import GroupIcon from '@mui/icons-material/Group';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';

const PREFIX = 'Documentation';

const classes = {
  container: `${PREFIX}-container`,
  paper: `${PREFIX}-paper`,
  title: `${PREFIX}-title`,
  subtitle: `${PREFIX}-subtitle`,
  section: `${PREFIX}-section`,
  card: `${PREFIX}-card`,
  cardHeader: `${PREFIX}-cardHeader`,
  cardContent: `${PREFIX}-cardContent`,
  icon: `${PREFIX}-icon`,
  divider: `${PREFIX}-divider`,
  listItem: `${PREFIX}-listItem`,
  link: `${PREFIX}-link`
};

const Root = styled('div')(({ theme }) => ({
  [`& .${classes.container}`]: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  [`& .${classes.paper}`]: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
  },
  [`& .${classes.title}`]: {
    marginBottom: theme.spacing(2),
    fontWeight: 600,
    textAlign: 'center',
    color: theme.palette.primary.main,
    padding: theme.spacing(2, 0),
  },
  [`& .${classes.subtitle}`]: {
    marginBottom: theme.spacing(2),
    fontWeight: 500,
    color: theme.palette.text.secondary,
    textAlign: 'center',
  },
  [`& .${classes.section}`]: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    fontWeight: 500,
  },
  [`& .${classes.subsection}`]: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontWeight: 500,
    color: theme.palette.primary.main,
  },
  [`& .${classes.card}`]: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    borderRadius: theme.shape.borderRadius * 2,
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
    },
  },
  [`& .${classes.cardHeader}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(1.5),
  },
  [`& .${classes.cardContent}`]: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  [`& .${classes.icon}`]: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  [`& .${classes.divider}`]: {
    margin: theme.spacing(2, 0),
  },
  [`& .${classes.listItem}`]: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  [`& .${classes.link}`]: {
    color: theme.palette.primary.main,
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

const Documentation = () => {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);

  const categories = [
    {
      title: t("documentation.general.title"),
      items: [
        {
          name: t("mainDrawer.listItems.dashboard"),
          description: t("documentation.general.dashboard"),
          icon: <DashboardOutlined />,
          path: "/"
        },
        {
          name: t("mainDrawer.listItems.tickets"),
          description: t("documentation.general.tickets"),
          icon: <WhatsApp />,
          path: "/tickets"
        },
        {
          name: t("mainDrawer.listItems.contacts"),
          description: t("documentation.general.contacts"),
          icon: <ContactPhoneOutlined />,
          path: "/contacts"
        },
        {
          name: t("mainDrawer.listItems.blockedContacts"),
          description: t("documentation.general.blockedContacts"),
          icon: <BlockIcon />,
          path: "/blocked-contacts"
        },
        {
          name: t("mainDrawer.listItems.quickAnswers"),
          description: t("documentation.general.quickAnswers"),
          icon: <QuestionAnswerOutlined />,
          path: "/quickAnswers"
        },
        {
          name: t("mainDrawer.listItems.tags"),
          description: t("documentation.general.tags"),
          icon: <LocalOffer />,
          path: "/tags"
        },
        {
          name: t("mainDrawer.listItems.clientStatus"),
          description: t("documentation.general.clientStatus"),
          icon: <LabelOutlined />,
          path: "/ClientStatus"
        },
        {
          name: t("mainDrawer.listItems.videos"),
          description: t("documentation.general.videos"),
          icon: <VideoLibraryOutlined />,
          path: "/videos"
        }
      ]
    },
    {
      title: t("documentation.administration.title"),
      items: [
        {
          name: t("mainDrawer.listItems.users"),
          description: t("documentation.administration.users"),
          icon: <PeopleAltOutlined />,
          path: "/users"
        },
        {
          name: t("mainDrawer.listItems.queues"),
          description: t("documentation.administration.queues"),
          icon: <AccountTreeOutlined />,
          path: "/queues"
        },
        {
          name: t("mainDrawer.listItems.channels"),
          description: t("documentation.administration.channels"),
          icon: <SyncAlt />,
          path: "/channels"
        },
        {
          name: t("mainDrawer.listItems.groups"),
          description: t("documentation.administration.groups"),
          icon: <GroupIcon />,
          path: "/group-management"
        },
        {
          name: t("mainDrawer.listItems.queueMonitor"),
          description: t("documentation.administration.queueMonitor"),
          icon: <QueueMonitorIcon />,
          path: "/queue-monitor"
        },
        {
          name: t("mainDrawer.listItems.settings"),
          description: t("documentation.administration.settings"),
          icon: <SettingsOutlined />,
          path: "/settings"
        }
      ]
    },
    {
      title: t("documentation.api.title"),
      items: [
        {
          name: t("mainDrawer.listItems.apidocs"),
          description: t("documentation.api.apidocs"),
          icon: <MenuBook />,
          path: "/apidocs"
        },
        {
          name: t("mainDrawer.listItems.apikey"),
          description: t("documentation.api.apikey"),
          icon: <VpnKeyRounded />,
          path: "/apikey"
        },
        {
          name: t("mainDrawer.listItems.api"),
          description: t("documentation.api.api"),
          icon: <Code />,
          path: "/api"
        }
      ]
    },
    {
      title: t("documentation.system.title"),
      items: [ 
        {
          name: t("mainDrawer.listItems.memoryUsage"),
          description: t("documentation.system.memoryUsage"),
          icon: <MemoryIcon />,
          path: "/memoryUsage"
        },
        {
          name: t("mainDrawer.listItems.cpuUsage"),
          description: t("documentation.system.cpuUsage"),
          icon: <CpuIcon />,
          path: "/cpuUsage"
        },
        {
          name: t("mainDrawer.listItems.diskSpace"),
          description: t("documentation.system.diskSpace"),
          icon: <StorageIcon />,
          path: "/diskSpace"
        },
        {
          name: t("mainDrawer.listItems.databaseStatus"),
          description: t("documentation.system.databaseStatus"),
          icon: <DatabaseIcon />,
          path: "/databaseStatus"
        },
        {
          name: t("mainDrawer.listItems.systemHealth"),
          description: t("documentation.system.systemHealth"),
          icon: <MonitorHeartIcon />,
          path: "/health-check"
        },
        {
          name: t("mainDrawer.listItems.networkStatus"),
          description: t("documentation.system.networkStatus"),
          icon: <NetworkCheckIcon />,
          path: "/network-status"
        }
      ]
    },
    {
      title: t("documentation.maintenance.title"),
      items: [
        {
          name: t("mainDrawer.listItems.backup"),
          description: t("documentation.maintenance.backup"),
          icon: <BackupIcon />,
          path: "/backup"
        },
        {
          name: t("mainDrawer.listItems.errorLogs"),
          description: t("documentation.maintenance.errorLogs"),
          icon: <BugReportOutlined />,
          path: "/errorLogs"
        },
        {
          name: t("mainDrawer.listItems.activityLogs"),
          description: t("documentation.maintenance.activityLogs"),
          icon: <HistoryIcon />,
          path: "/activity-logs"
        },
        {
          name: t("mainDrawer.listItems.systemUpdate"),
          description: t("documentation.maintenance.systemUpdate"),
          icon: <SystemUpdateAltIcon />,
          path: "/system-update"
        },
        {
          name: t("mainDrawer.listItems.versionCheck"),
          description: t("documentation.maintenance.versionCheck"),
          icon: <SystemUpdateIcon />,
          path: "/versionCheck"
        }
      ]
    }
  ];

  return (
    <Root>
      <Container maxWidth="lg" className={classes.container}>
        <Paper className={classes.paper}>
          <Typography variant="h4" className={classes.title}>
            {t("documentation.title")}
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            {t("documentation.subtitle")}
          </Typography>

          <Divider className={classes.divider} />

          {categories.map((category, categoryIndex) => {
            if (category.title === t("documentation.administration.title")) {
              return (
                <Can
                  key={`category-${categoryIndex}`}
                  role={user.profile}
                  perform="documentation-admin:view"
                  yes={() => (
                    <div>
                      <Typography variant="h5" className={classes.section}>
                        {category.title}
                      </Typography>
                      <Grid container spacing={3}>
                        {category.items.map((item, itemIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={`item-${categoryIndex}-${itemIndex}`}>
                            <Card className={classes.card}>
                              <CardHeader
                                title={
                                  <Box display="flex" alignItems="center">
                                    {React.cloneElement(item.icon, { style: { marginRight: 8 } })}
                                    <Typography variant="h6">{item.name}</Typography>
                                  </Box>
                                }
                                className={classes.cardHeader}
                              />
                              <CardContent className={classes.cardContent}>
                                <Typography variant="body2" color="textSecondary" component="p">
                                  {item.description}
                                </Typography>
                                <Box mt={2}>
                                  <Link component={RouterLink} to={item.path} className={classes.link}>
                                    {t("documentation.visitPage")}
                                  </Link>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                      <Divider className={classes.divider} />
                    </div>
                  )}
                />
              );
            } else if (category.title === t("documentation.api.title")) {
              return (
                <Can
                  key={`category-${categoryIndex}`}
                  role={user.profile}
                  perform="documentation-api:view"
                  yes={() => (
                    <div>
                      <Typography variant="h5" className={classes.section}>
                        {category.title}
                      </Typography>
                      <Grid container spacing={3}>
                        {category.items.map((item, itemIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={`item-${categoryIndex}-${itemIndex}`}>
                            <Card className={classes.card}>
                              <CardHeader
                                title={
                                  <Box display="flex" alignItems="center">
                                    {React.cloneElement(item.icon, { style: { marginRight: 8 } })}
                                    <Typography variant="h6">{item.name}</Typography>
                                  </Box>
                                }
                                className={classes.cardHeader}
                              />
                              <CardContent className={classes.cardContent}>
                                <Typography variant="body2" color="textSecondary" component="p">
                                  {item.description}
                                </Typography>
                                <Box mt={2}>
                                  <Link component={RouterLink} to={item.path} className={classes.link}>
                                    {t("documentation.visitPage")}
                                  </Link>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                      <Divider className={classes.divider} />
                    </div>
                  )}
                />
              );
            } else if (category.title === t("documentation.system.title")) {
              return (
                <Can
                  key={`category-${categoryIndex}`}
                  role={user.profile}
                  perform="documentation-system:view"
                  yes={() => (
                    <div>
                      <Typography variant="h5" className={classes.section}>
                        {category.title}
                      </Typography>
                      <Grid container spacing={3}>
                        {category.items.map((item, itemIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={`item-${categoryIndex}-${itemIndex}`}>
                            <Card className={classes.card}>
                              <CardHeader
                                title={
                                  <Box display="flex" alignItems="center">
                                    {React.cloneElement(item.icon, { style: { marginRight: 8 } })}
                                    <Typography variant="h6">{item.name}</Typography>
                                  </Box>
                                }
                                className={classes.cardHeader}
                              />
                              <CardContent className={classes.cardContent}>
                                <Typography variant="body2" color="textSecondary" component="p">
                                  {item.description}
                                </Typography>
                                <Box mt={2}>
                                  <Link component={RouterLink} to={item.path} className={classes.link}>
                                    {t("documentation.visitPage")}
                                  </Link>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                      <Divider className={classes.divider} />
                    </div>
                  )}
                />
              );  
            } else if (category.title === t("documentation.maintenance.title")) {
              return (
                <Can
                  key={`category-${categoryIndex}`}
                  role={user.profile}
                  perform="documentation-maintenance:view"
                  yes={() => (
                    <div>
                      <Typography variant="h5" className={classes.section}>
                        {category.title}
                      </Typography>
                      <Grid container spacing={3}>
                        {category.items.map((item, itemIndex) => (
                          <Grid item xs={12} sm={6} md={4} key={`item-${categoryIndex}-${itemIndex}`}>
                            <Card className={classes.card}>
                              <CardHeader
                                title={
                                  <Box display="flex" alignItems="center">
                                    {React.cloneElement(item.icon, { style: { marginRight: 8 } })}
                                    <Typography variant="h6">{item.name}</Typography>
                                  </Box>
                                }
                                className={classes.cardHeader}
                              />
                              <CardContent className={classes.cardContent}>
                                <Typography variant="body2" color="textSecondary" component="p">
                                  {item.description}
                                </Typography>
                                <Box mt={2}>
                                  <Link component={RouterLink} to={item.path} className={classes.link}>
                                    {t("documentation.visitPage")}
                                  </Link>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                      <Divider className={classes.divider} />
                    </div>
                  )}
                />
              );
            } else {
              return (
                <div key={`category-${categoryIndex}`}>
                  <Typography variant="h5" className={classes.section}>
                    {category.title}
                  </Typography>
                  <Grid container spacing={3}>
                    {category.items
                      .filter(item => {
                        // Filtrar Contatos Bloqueados para apenas admin
                        if (item.path === "/blocked-contacts") {
                          return user?.profile?.toUpperCase() === "ADMIN";
                        }
                        return true;
                      })
                      .map((item, itemIndex) => (
                      <Grid item xs={12} sm={6} md={4} key={`item-${categoryIndex}-${itemIndex}`}>
                        <Card className={classes.card}>
                          <CardHeader
                            title={
                              <Box display="flex" alignItems="center">
                                {React.cloneElement(item.icon, { style: { marginRight: 8 } })}
                                <Typography variant="h6">{item.name}</Typography>
                              </Box>
                            }
                            className={classes.cardHeader}
                          />
                          <CardContent className={classes.cardContent}>
                            <Typography variant="body2" color="textSecondary" component="p">
                              {item.description}
                            </Typography>
                            <Box mt={2}>
                              <Link component={RouterLink} to={item.path} className={classes.link}>
                                {t("documentation.visitPage")}
                              </Link>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  <Divider className={classes.divider} />
                </div>
              )
            }
          })}
          </Paper>
        </Container>
      </Root>
  );
};

export default Documentation;
