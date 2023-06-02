import React, { useState, useEffect } from "react";

import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import { Typography, Avatar, Tab, Tabs } from "@material-ui/core";

import SpeedIcon from "@material-ui/icons/Speed";
import GroupIcon from "@material-ui/icons/Group";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PersonIcon from "@material-ui/icons/Person";
import AppBar from "@material-ui/core/AppBar";
import SentimentSatisfiedAltIcon  from "@mui/icons-material/SentimentSatisfiedAlt";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral";
import Score from "@material-ui/icons/Score";

import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { toast } from "react-toastify";


//import Chart from "./Chart";
import ButtonWithSpinner from "../../components/ButtonWithSpinner";
import TabPanel from "../../components/TabPanel";
import { UsersFilter } from "../../components/UsersFilter";
import QueueSelect from "../../components/QueueSelect";

//import CardCounter from "../../components/Dashboard/CardCounter";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import { isArray } from "lodash";

import useDashboard from "../../hooks/useDashboard";

import { isEmpty } from "lodash";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  tab: {
    paddingTop: theme.spacing(8),
    display: "flex",
    alignItems: "center",
    height: "111px",
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
    container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    maxWidth: "1150px",
    minWidth: "xs",
  },
  cardContainer1: {
    backgroundColor: "#eef1fdff",
    width: "350px",
    height: "111px",
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    minHeight: "48px",
  },
  cardContainer2: {
    backgroundColor: "#fff8e8ff",
    width: "350px",
    height: "111px",
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    minHeight: "48px",
  },
  cardContainer3: {
    backgroundColor: "#e6f8f3ff",
    width: "350px",
    height: "111px",
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    minHeight: "48px",
  },
  cardContainer4: {
    backgroundColor: "#fbe7edff",
    width: "350px",
    height: "111px",
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    minHeight: "48px",
  },
  cardContainer5: {
    backgroundColor: "#e6f8f3ff",
    width: "350px",
    height: "111px",
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    minHeight: "48px",
  },
  cardContainer6: {
    backgroundColor: "#eef1fdff",
    width: "350px",
    height: "111px",
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    minHeight: "48px",
  },
  cardContainer7: {
    backgroundColor: "#eef1fdff",
    //width: "350px",
    height: "111px",
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    minHeight: "48px",
    justifyItems: "center",
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    height: 340,
    overflowY: "hidden",
    ...theme.scrollbarStyles,
    border: "1px solid #dce4ec",
  },
  cardAvatar: {
    paddingLeft: "17px",
  },
  cardAvatar1: {
    color: "#5578eb",
    width: "93px",
    height: "100px",
    display: "flex",
    fontSize: "71px",
    backgroundColor: "#eef1fdff",
  },
  cardAvatar2: {
    color: "#ffb822ff",
    backgroundColor: "#fff8e8ff",
    width: "93px",
    height: "100px",
    display: "flex",
    fontSize: "71px",
  },
  cardAvatar3: {
    color: "#0abb87ff",
    backgroundColor: "#e6f8f3ff",
    width: "93px",
    height: "100px",
    display: "flex",
    fontSize: "71px",
  },
  cardAvatar4: {
    color: "#fa7070ff",
    backgroundColor: "#fbe7edff",
    width: "93px",
    height: "100px",
    display: "flex",
    fontSize: "71px",
  },
  cardAvatar5: {
    color: "#0abb87ff",
    backgroundColor: "#e6f8f3ff",
    width: "93px",
    height: "100px",
    display: "flex",
    fontSize: "71px",
  },
  cardAvatar6: {
    color: "#5578eb",
    backgroundColor: "#eef1fdff",
    width: "93px",
    height: "100px",
    display: "flex",
    fontSize: "71px",
  },
  cardTitle: {
    color: theme.palette.text.primary,
    fontSize: "13px",
    width: "220px",
    paddingLeft: "16px",
  },
  cardSubtitle2: {
    color: grey[600],
    fontSize: "1.75rem",
    paddingLeft: "16px",
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "1.75rem",
    paddingLeft: "16px",
  },
  alignRight: {
    textAlign: "right",
  },
  alignLeft: {
    textAlign: "left",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  attendants: {
    backgroundColor: "#4287f5"
  }
}));

const Dashboard = () => {
  const [tab, setTab] = useState("Indicadores");
  const classes = useStyles();
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedQueues, setSelectedQueues] = useState([]);
  const [period, setPeriod] = useState(0);
  const [dateFrom, setDateFrom] = useState(
    moment("1", "D").format("YYYY-MM-DD")
  );
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();
  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleChangePeriod(value) {
    setPeriod(value);
  }

  async function handleChangeFilterType(value) {
    setFilterType(value);
    if (value === 1) {
      setPeriod(0);
    } else {
      setDateFrom("");
      setDateTo("");
    }
  }

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };


  const handleChangeTab = (e, newValue) => {
    setTab(newValue);
  };

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateFrom) && moment(dateFrom).isValid()) {
      params = {
        ...params,
        date_from: moment(dateFrom).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateTo) && moment(dateTo).isValid()) {
      params = {
        ...params,
        date_to: moment(dateTo).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(selectedUsers)) {
       params = {
        ...params,
        userId: selectedUsers,
      };
    }

    if (!isEmpty(selectedQueues)) {
      params = {
       ...params,
       queueId: selectedQueues,
     };
   }


    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);

    const counters = JSON.parse(data.counters);
    const attendants = JSON.parse(data.attendants);
    setCounters(counters);
    if (isArray(attendants)) {
      setAttendants(attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function fetchData() {
    }
    fetchData();
  }, [])
  
  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  function renderFilters() {
    if (filterType === 1) {
      return (
        <>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Data Inicial"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Data Final"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={classes.fullWidth}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </>
      );
    } else {
      return (
        <Grid item xs={12} sm={6} md={4}>
          <FormControl className={classes.selectContainer}>
            <InputLabel id="period-selector-label">Período</InputLabel>
            <Select
              labelId="period-selector-label"
              id="period-selector"
              value={period}
              onChange={(e) => handleChangePeriod(e.target.value)}
            >
              <MenuItem value={0}>Nenhum selecionado</MenuItem>
              <MenuItem value={3}>Últimos 3 dias</MenuItem>
              <MenuItem value={7}>Últimos 7 dias</MenuItem>
              <MenuItem value={15}>Últimos 15 dias</MenuItem>
              <MenuItem value={30}>Últimos 30 dias</MenuItem>
              <MenuItem value={60}>Últimos 60 dias</MenuItem>
              <MenuItem value={90}>Últimos 90 dias</MenuItem>
            </Select>
            <FormHelperText>Selecione o período desejado</FormHelperText>
          </FormControl>
        </Grid>
      );
    }
  }

  return (
    <div>
      <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3} className={classes.container}>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl className={classes.selectContainer}>
              <InputLabel id="period-selector-label">Tipo de Filtro</InputLabel>
              <Select
                labelId="period-selector-label"
                value={filterType}
                onChange={(e) => handleChangeFilterType(e.target.value)}
              >
                <MenuItem value={1}>Filtro por Data</MenuItem>
                <MenuItem value={2}>Filtro por Período</MenuItem>
              </Select>
              <FormHelperText>Selecione o período desejado</FormHelperText>
            </FormControl>
          </Grid>

          {renderFilters()}

          <Grid item xs={12}  md={4} style={{ marginLeft: '-10px' }}>
            <UsersFilter onFiltered={handleSelectedUsers} />
          </Grid>

          <Grid item xs={6}  md={4} style={{ marginTop: '-15px' }}>
            <QueueSelect 
              selectedQueueIds={selectedQueues} 
              onChange={values => setSelectedQueues(values)} 
            />          
          </Grid>

          <Grid item xs={12} className={classes.alignRight}>
            <ButtonWithSpinner
              loading={loading}
              onClick={() => fetchData()}
              variant="contained"
              color="primary"
            >
              Filtrar
            </ButtonWithSpinner>
          </Grid>

          <AppBar position="static">
            <Grid container width="100%" >
              <Tabs
                value={tab}
                onChange={handleChangeTab}                
                aria-label="primary tabs example"
                variant="fullWidth"
              >
                <Tab value="Indicadores" label="Indicadores" />
                <Tab value="NPS" label="NPS" />
                <Tab value="Atendentes" label="Atendentes" />
              </Tabs>
            </Grid>
          </AppBar>

          <TabPanel
            className={classes.container}
            value={tab}
            name={"Indicadores"}
          >
            <Container maxWidth="lg" className={classes.container}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                <Paper className={classes.cardContainer1} elevation={0}>
                  <div>
                    <Typography
                      variant="subtitle1"
                      component="p"
                      className={classes.cardSubtitle}
                    >
                      <span translate="no">{counters.supportPending}</span>
                    </Typography>
                    <Typography
                      variant="h6"
                      component="h2"
                      className={classes.cardTitle}
                    >
                      {"Aguardando"}
                    </Typography>
                  </div>
                  <div className={classes.cardAvatar}>
                    <Avatar className={classes.cardAvatar1}>
                      {<GroupIcon />}
                    </Avatar>
                  </div>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Paper className={classes.cardContainer2} elevation={0}>
                  <div>
                    <Typography
                      variant="subtitle1"
                      component="p"
                      className={classes.cardSubtitle}
                    >
                      {counters.supportHappening}
                    </Typography>
                    <Typography
                      variant="h6"
                      component="h2"
                      className={classes.cardTitle}
                    >
                      {"Em atendimento"}
                    </Typography>
                  </div>
                  <div className={classes.cardAvatar}>
                    <Avatar className={classes.cardAvatar2}>
                      {<AssignmentIcon fontSize="inherit" />}
                    </Avatar>
                  </div>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Paper className={classes.cardContainer3} elevation={0}>
                  <div>
                    <Typography
                      variant="subtitle1"
                      component="p"
                      className={classes.cardSubtitle}
                    >
                      {counters.supportFinished}
                    </Typography>
                    <Typography
                      variant="h6"
                      component="h2"
                      className={classes.cardTitle}
                    >
                      {"Resolvidos"}
                    </Typography>
                  </div>
                  <div className={classes.cardAvatar}>
                    <Avatar className={classes.cardAvatar3}>
                      {<AssignmentIcon fontSize="inherit" />}
                    </Avatar>
                  </div>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Paper className={classes.cardContainer4} elevation={0}>
                  <div>
                    <Typography
                      variant="subtitle1"
                      component="p"
                      className={classes.cardSubtitle}
                    >
                      {counters.leads}
                    </Typography>
                    <Typography
                      variant="h6"
                      component="h2"
                      className={classes.cardTitle}
                    >
                      {"Leads"}
                    </Typography>
                  </div>
                  <div className={classes.cardAvatar}>
                    <Avatar className={classes.cardAvatar4}>
                      {<PersonIcon fontSize="inherit" />}
                    </Avatar>
                  </div>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Paper className={classes.cardContainer5} elevation={0}>
                  <div>
                    <Typography
                      variant="subtitle1"
                      component="p"
                      className={classes.cardSubtitle}
                    >
                      {formatTime(counters.avgSupportTime)}
                    </Typography>
                    <Typography
                      variant="h6"
                      component="h2"
                      className={classes.cardTitle}
                    >
                      {"T.M. de Atendimento"}
                    </Typography>
                  </div>
                  <div className={classes.cardAvatar}>
                    <Avatar className={classes.cardAvatar5}>
                      {<SpeedIcon fontSize="inherit" />}
                    </Avatar>
                  </div>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Paper className={classes.cardContainer6} elevation={0}>
                  <div>
                    <Typography
                      variant="subtitle1"
                      component="p"
                      className={classes.cardSubtitle}
                    >
                      {formatTime(counters.avgWaitTime)}
                    </Typography>
                    <Typography
                      variant="h6"
                      component="h2"
                      className={classes.cardTitle}
                    >
                      {"T.M. de Espera"}
                    </Typography>
                  </div>
                  <div className={classes.cardAvatar}>
                    <Avatar className={classes.cardAvatar6}>
                      {<SpeedIcon fontSize="inherit" />}
                    </Avatar>
                  </div>
                </Paper>
              </Grid>
              </Grid>
            </Container>
          </TabPanel>

          <TabPanel
            className={classes.container}
            value={tab}
            name={"NPS"}
          >
            <Container 
               width="lg%" 
               className={classes.container} 
              //  alignContent="center"
            >
            <Grid 
              container 
              spacing={3} >
            <Grid item  xs={12} sm={6} md={4}>
              <Paper className={classes.cardContainer5} elevation={0}>
                <div>
                  <Typography
                    variant="subtitle1"
                    component="p"
                    className={classes.cardSubtitle}
                  >
                    {Number(counters.npsPromotersPerc/100).toLocaleString(undefined,{style:'percent'})}
                  </Typography>
                  <Typography
                    variant="h6"
                    component="h2"
                    className={classes.cardTitle}
                  >
                    {"Promotores"}
                  </Typography>
                </div>
                <div className={classes.cardAvatar}>
                  <Avatar className={classes.cardAvatar5}>
                    {<SentimentSatisfiedAltIcon  fontSize="inherit" />}
                  </Avatar>
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper className={classes.cardContainer2} elevation={0}>
                <div>
                  <Typography
                    variant="subtitle1"
                    component="p"
                    className={classes.cardSubtitle}
                  >
                    {Number(counters.npsPassivePerc/100).toLocaleString(undefined,{style:'percent'})}
                  </Typography>
                  <Typography
                    variant="h6"
                    component="h2"
                    className={classes.cardTitle}
                  >
                    {"Neutros"}
                  </Typography>
                </div>
                <div className={classes.cardAvatar}>
                  <Avatar className={classes.cardAvatar2}>
                    {<SentimentNeutralIcon fontSize="inherit" />}
                  </Avatar>
                </div>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper className={classes.cardContainer4} elevation={0}>
                <div>
                  <Typography
                    variant="subtitle1"
                    component="p"
                    className={classes.cardSubtitle}
                  >
                    {Number(counters.npsDetractorsPerc/100).toLocaleString(undefined,{style:'percent'})}
                  </Typography>
                  <Typography
                    variant="h6"
                    component="h2"
                    className={classes.cardTitle}
                  >
                    {"Dretatores"}
                  </Typography>
                </div>
                <div className={classes.cardAvatar}>
                  <Avatar className={classes.cardAvatar4}>
                    {<SentimentVeryDissatisfiedIcon fontSize="inherit" />}
                  </Avatar>
                </div>
              </Paper>
            </Grid>

            </Grid>
          </Container>

          <Container
            width="lg%" 
            className={classes.container} 
          >
          <Grid container spacing={3} >
           <Grid item  xs={12} sm={6} md={4} >
              <Paper 
             className={classes.cardContainer7} elevation={0}    
              >
                <div>
                  <Typography
                    variant="subtitle1"
                    component="p"
                    className={classes.cardSubtitle}
                  >
                    {Number(counters.npsScore/100).toLocaleString(undefined,{style:'percent'})}
                  </Typography>
                  <Typography
                    variant="h6"
                    component="h2"
                    className={classes.cardTitle}
                  >
                    {"Score"}
                  </Typography>
                </div>
                <div className={classes.cardAvatar}>
                  <Avatar className={classes.cardAvatar6}>
                    {<Score fontSize="inherit" />}
                  </Avatar>
                </div>
              </Paper>
             </Grid>
            </Grid>
          </Container>
 
          </TabPanel>
          
          <TabPanel
            className={classes.container}
            value={tab}
            name={"Atendentes"}
          >
            <Container width="100%" className={classes.container}>
              <Grid container width="100%">
                <Grid item xs={12}>
                  {attendants.length ? (
                    <TableAttendantsStatus
                      attendants={attendants}
                      loading={loading}
                    />
                  ) : null}
              </Grid>
              </Grid>
            </Container>
          </TabPanel>
        </Grid>
      </Container>
    </div>
  );
};

export default Dashboard;