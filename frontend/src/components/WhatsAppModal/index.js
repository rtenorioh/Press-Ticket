import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  CircularProgress,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  FormGroup,
  Tooltip,
  Grid,
  MenuItem,
  InputLabel,
  Select,
  Checkbox,
} from "@material-ui/core";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },

  expediente: {
    display: "flex",
    flexWrap: "wrap",
  },
  tituloReceberMsg: {
    fontSize: 12,
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  reabrirTicket: {
    fontSize: 12,
    display: "flex",
    marginLeft: theme.spacing(2),
  },
  textSize: {
    fontSize: 12,
  },
  paperReceberMsg: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  diasSemana: {
    marginLeft: theme.spacing(1),
  },
  hora: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: 170,
  },
  textoExpediente: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(3),
    width: "100%",
  },
}));

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();
  const initialState = {
    name: "",
    greetingMessage: "",
    farewellMessage: "",
    ratingMessage: "",
    isDefault: false,
    isDisplay: false,
    transferTicketMessage: "",
    isGroup: false,
    inactiveMessage: "",
    sendInactiveMessage: false,
    timeInactiveMessage: "",
  };
  const [whatsApp, setWhatsApp] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);

  const [defineWorkHours, SetDefineWorkHours] = useState("");
  const [outOfWorkMessage, setOutOfWorkMessage] = useState("");

  const [StartDefineWorkHoursMonday, setStartDefineWorkHoursMonday] = useState('08:00');
  const [EndDefineWorkHoursMonday, setEndDefineWorkHoursMonday] = useState('18:00')
  const [StartDefineWorkHoursMondayLunch, setStartDefineWorkHoursMondayLunch] = useState('12:00')
  const [EndDefineWorkHoursMondayLunch, setEndDefineWorkHoursMondayLunch] = useState('13:00')

  const [StartDefineWorkHoursTuesday, setStartDefineWorkHoursTuesday] = useState('08:00')
  const [EndDefineWorkHoursTuesday, setEndDefineWorkHoursTuesday] = useState('18:00')
  const [StartDefineWorkHoursTuesdayLunch, setStartDefineWorkHoursTuesdayLunch] = useState('12:00')
  const [EndDefineWorkHoursTuesdayLunch, setEndDefineWorkHoursTuesdayLunch] = useState('13:00')

  const [StartDefineWorkHoursWednesday, setStartDefineWorkHoursWednesday] = useState('08:00')
  const [EndDefineWorkHoursWednesday, setEndDefineWorkHoursWednesday] = useState('18:00')
  const [StartDefineWorkHoursWednesdayLunch, setStartDefineWorkHoursWednesdayLunch] = useState('12:00')
  const [EndDefineWorkHoursWednesdayLunch, setEndDefineWorkHoursWednesdayLunch] = useState('13:00')

  const [StartDefineWorkHoursThursday, setStartDefineWorkHoursThursday] = useState('08:00')
  const [EndDefineWorkHoursThursday, setEndDefineWorkHoursThursday] = useState('18:00')
  const [StartDefineWorkHoursThursdayLunch, setStartDefineWorkHoursThursdayLunch] = useState('12:00')
  const [EndDefineWorkHoursThursdayLunch, setEndDefineWorkHoursThursdayLunch] = useState('13:00')

  const [StartDefineWorkHoursFriday, setStartDefineWorkHoursFriday] = useState('08:00')
  const [EndDefineWorkHoursFriday, setEndDefineWorkHoursFriday] = useState('18:00')
  const [StartDefineWorkHoursFridayLunch, setStartDefineWorkHoursFridayLunch] = useState('12:00')
  const [EndDefineWorkHoursFridayLunch, setEndDefineWorkHoursFridayLunch] = useState('13:00')

  const [StartDefineWorkHoursSaturday, setStartDefineWorkHoursSaturday] = useState("");
  const [EndDefineWorkHoursSaturday, setEndDefineWorkHoursSaturday] = useState("");
  const [StartDefineWorkHoursSaturdayLunch, setStartDefineWorkHoursSaturdayLunch] = useState("");
  const [EndDefineWorkHoursSaturdayLunch, setEndDefineWorkHoursSaturdayLunch] = useState("");

  const [StartDefineWorkHoursSunday, setStartDefineWorkHoursSunday] = useState("");
  const [EndDefineWorkHoursSunday, setEndDefineWorkHoursSunday] = useState("");
  const [StartDefineWorkHoursSundayLunch, setStartDefineWorkHoursSundayLunch] = useState("");
  const [EndDefineWorkHoursSundayLunch, setEndDefineWorkHoursSundayLunch] = useState("");

  // const [startWorkHour, setStartWorkHour] = useState("08:00");
  // const [endWorkHour, setEndWorkHour] = useState("17:30");
  // const [startWorkHourWeekend, setStartWorkHourWeekend] = useState("08:00");
  // const [endWorkHourWeekend, setEndWorkHourWeekend] = useState("17:30");
  const [seg, setSeg] = useState(true);
  const [ter, setTer] = useState(true);
  const [quar, setQuar] = useState(true);
  const [quin, setQuin] = useState(true);
  const [sex, setSex] = useState(true);
  const [sab, setSab] = useState(false);
  const [dom, setDom] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      try {
        const { data } = await api.get(`whatsapp/${whatsAppId}`);
        setWhatsApp(data);

        setSeg(data.monday);
        setTer(data.tuesday);
        setQuar(data.wednesday);
        setQuin(data.thursday);
        setSex(data.friday);
        setSab(data.saturday);
        setDom(data.sunday);
        setStartDefineWorkHoursMonday(data.StartDefineWorkHoursMonday);
        setEndDefineWorkHoursMonday(data.EndDefineWorkHoursMonday);
        setStartDefineWorkHoursMondayLunch(data.StartDefineWorkHoursMondayLunch);
        setEndDefineWorkHoursMondayLunch(data.EndDefineWorkHoursMondayLunch);

        setStartDefineWorkHoursTuesday(data.StartDefineWorkHoursTuesday);
        setEndDefineWorkHoursTuesday(data.EndDefineWorkHoursTuesday);
        setStartDefineWorkHoursTuesdayLunch(data.StartDefineWorkHoursTuesdayLunch);
        setEndDefineWorkHoursTuesdayLunch(data.EndDefineWorkHoursTuesdayLunch);

        setStartDefineWorkHoursWednesday(data.StartDefineWorkHoursWednesday);
        setEndDefineWorkHoursWednesday(data.EndDefineWorkHoursWednesday);
        setStartDefineWorkHoursWednesdayLunch(data.StartDefineWorkHoursWednesdayLunch);
        setEndDefineWorkHoursWednesdayLunch(data.EndDefineWorkHoursWednesdayLunch);

        setStartDefineWorkHoursThursday(data.StartDefineWorkHoursThursday);
        setEndDefineWorkHoursThursday(data.EndDefineWorkHoursThursday);
        setStartDefineWorkHoursThursdayLunch(data.StartDefineWorkHoursThursdayLunch);
        setEndDefineWorkHoursThursdayLunch(data.EndDefineWorkHoursThursdayLunch);

        setStartDefineWorkHoursFriday(data.StartDefineWorkHoursFriday);
        setEndDefineWorkHoursFriday(data.EndDefineWorkHoursFriday);
        setStartDefineWorkHoursFridayLunch(data.StartDefineWorkHoursFridayLunch);
        setEndDefineWorkHoursFridayLunch(data.EndDefineWorkHoursFridayLunch);

        setStartDefineWorkHoursSaturday(data.StartDefineWorkHoursSaturday);
        setEndDefineWorkHoursSaturday(data.EndDefineWorkHoursSaturday);
        setStartDefineWorkHoursSaturdayLunch(data.StartDefineWorkHoursSaturdayLunch);
        setEndDefineWorkHoursSaturdayLunch(data.EndDefineWorkHoursSaturdayLunch);

        setStartDefineWorkHoursSunday(data.StartDefineWorkHoursSunday);
        setEndDefineWorkHoursSunday(data.EndDefineWorkHoursSunday);
        setStartDefineWorkHoursSundayLunch(data.StartDefineWorkHoursSundayLunch);
        setEndDefineWorkHoursSundayLunch(data.EndDefineWorkHoursSundayLunch);



        SetDefineWorkHours(data.defineWorkHours);
        setOutOfWorkMessage(data.outOfWorkMessage);
        // setStartWorkHour(data.startWorkHour);
        // setEndWorkHour(data.endWorkHour);
        // setStartWorkHourWeekend(data.startWorkHourWeekend);
        // setEndWorkHourWeekend(data.endWorkHourWeekend);

        const whatsQueueIds = data.queues?.map(queue => queue.id);
        setSelectedQueueIds(whatsQueueIds);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId]);




  const handleChange = (e) => {
    if (e.target.value === "MON") {
      setSeg(e.target.checked);
    }
    if (e.target.value === "TUE") {
      setTer(e.target.checked);
    }
    if (e.target.value === "WED") {
      setQuar(e.target.checked);
    }
    if (e.target.value === "THU") {
      setQuin(e.target.checked);
    }
    if (e.target.value === "FRI") {
      setSex(e.target.checked);
    }
    if (e.target.value === "SAT") {
      setSab(e.target.checked);
    }
    if (e.target.value === "SUN") {
      setDom(e.target.checked);
    }

    if (e.target.value === "defineWorkHours") {
      SetDefineWorkHours(e.target.checked);
    }
  };

  const handleSaveWhatsApp = async values => {
    const whatsappData = {
      ...values, queueIds: selectedQueueIds,

      StartDefineWorkHoursMonday: StartDefineWorkHoursMonday,
      EndDefineWorkHoursMonday: EndDefineWorkHoursMonday,
      StartDefineWorkHoursMondayLunch: StartDefineWorkHoursMondayLunch,
      EndDefineWorkHoursMondayLunch: EndDefineWorkHoursMondayLunch,

      StartDefineWorkHoursTuesday: StartDefineWorkHoursTuesday,
      EndDefineWorkHoursTuesday: EndDefineWorkHoursTuesday,
      StartDefineWorkHoursTuesdayLunch: StartDefineWorkHoursTuesdayLunch,
      EndDefineWorkHoursTuesdayLunch: EndDefineWorkHoursTuesdayLunch,

      StartDefineWorkHoursWednesday: StartDefineWorkHoursWednesday,
      EndDefineWorkHoursWednesday: EndDefineWorkHoursWednesday,
      StartDefineWorkHoursWednesdayLunch: StartDefineWorkHoursWednesdayLunch,
      EndDefineWorkHoursWednesdayLunch: EndDefineWorkHoursWednesdayLunch,

      StartDefineWorkHoursThursday: StartDefineWorkHoursThursday,
      EndDefineWorkHoursThursday: EndDefineWorkHoursThursday,
      StartDefineWorkHoursThursdayLunch: StartDefineWorkHoursThursdayLunch,
      EndDefineWorkHoursThursdayLunch: EndDefineWorkHoursThursdayLunch,

      StartDefineWorkHoursFriday: StartDefineWorkHoursFriday,
      EndDefineWorkHoursFriday: EndDefineWorkHoursFriday,
      StartDefineWorkHoursFridayLunch: StartDefineWorkHoursFridayLunch,
      EndDefineWorkHoursFridayLunch: EndDefineWorkHoursFridayLunch,

      StartDefineWorkHoursSaturday: StartDefineWorkHoursSaturday,
      EndDefineWorkHoursSaturday: EndDefineWorkHoursSaturday,
      StartDefineWorkHoursSaturdayLunch: StartDefineWorkHoursSaturdayLunch,
      EndDefineWorkHoursSaturdayLunch: EndDefineWorkHoursSaturdayLunch,

      StartDefineWorkHoursSunday: StartDefineWorkHoursSunday,
      EndDefineWorkHoursSunday: EndDefineWorkHoursSunday,
      StartDefineWorkHoursSundayLunch: StartDefineWorkHoursSundayLunch,
      EndDefineWorkHoursSundayLunch: EndDefineWorkHoursSundayLunch,

      defineWorkHours: defineWorkHours,
      outOfWorkMessage: outOfWorkMessage,
      monday: seg,
      tuesday: ter,
      wednesday: quar,
      thursday: quin,
      friday: sex,
      saturday: sab,
      sunday: dom,
    };

    try {
      if (whatsAppId) {
        await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
      } else {
        await api.post("/whatsapp", whatsappData);
      }
      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleClose = () => {
    onClose();
    setWhatsApp(initialState);

    setStartDefineWorkHoursMonday();
    setEndDefineWorkHoursMonday();
    setStartDefineWorkHoursMondayLunch();
    setEndDefineWorkHoursMondayLunch();

    setStartDefineWorkHoursTuesday();
    setEndDefineWorkHoursTuesday();
    setStartDefineWorkHoursTuesdayLunch();
    setEndDefineWorkHoursTuesdayLunch();

    setStartDefineWorkHoursWednesday();
    setEndDefineWorkHoursWednesday();
    setStartDefineWorkHoursWednesdayLunch();
    setEndDefineWorkHoursWednesdayLunch();

    setStartDefineWorkHoursThursday();
    setEndDefineWorkHoursThursday();
    setStartDefineWorkHoursThursdayLunch();
    setEndDefineWorkHoursThursdayLunch();

    setStartDefineWorkHoursFriday();
    setEndDefineWorkHoursFriday();
    setStartDefineWorkHoursFridayLunch();
    setEndDefineWorkHoursFridayLunch();

    setStartDefineWorkHoursSaturday();
    setEndDefineWorkHoursSaturday();
    setStartDefineWorkHoursSaturdayLunch();
    setEndDefineWorkHoursSaturdayLunch();

    setStartDefineWorkHoursSunday();
    setEndDefineWorkHoursSunday();
    setStartDefineWorkHoursSundayLunch();
    setEndDefineWorkHoursSundayLunch();

    // SetDefineWorkHours();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {whatsAppId
            ? i18n.t("whatsappModal.title.edit")
            : i18n.t("whatsappModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={whatsApp}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveWhatsApp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.multFieldLine}>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                  />
                  <FormControlLabel
                    control={
                      <Field
                        as={Switch}
                        color="primary"
                        name="isDefault"
                        checked={values.isDefault}
                      />
                    }
                    label={i18n.t("whatsappModal.form.default")}
                  />
                  <FormControlLabel
                    control={
                      <Field
                        as={Switch}
                        color="primary"
                        name="isDisplay"
                        checked={values.isDisplay}
                      />
                    }
                    label={i18n.t("whatsappModal.form.display")}
                  />
                  <FormControlLabel
                    control={
                      <Field
                        as={Switch}
                        color="primary"
                        name="isGroup"
                        checked={values.isGroup}
                      />
                    }
                    label={i18n.t("whatsappModal.form.group")}
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("queueModal.form.greetingMessage")}
                    type="greetingMessage"
                    multiline
                    rows={5}
                    fullWidth
                    name="greetingMessage"
                    error={
                      touched.greetingMessage && Boolean(errors.greetingMessage)
                    }
                    helperText={
                      touched.greetingMessage && errors.greetingMessage
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.farewellMessage")}
                    type="farewellMessage"
                    multiline
                    rows={5}
                    fullWidth
                    name="farewellMessage"
                    error={
                      touched.farewellMessage && Boolean(errors.farewellMessage)
                    }
                    helperText={
                      touched.farewellMessage && errors.farewellMessage
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <div>
									<Field
										as={TextField}
										label={i18n.t("whatsappModal.form.ratingMessage")}
										type="ratingMessage"
										multiline
										rows={5}
										fullWidth
										name="ratingMessage"
										helperText={i18n.t("whatsappModal.form.instructionRatingMessage")}
										error={
											touched.instructionRatingMessage && Boolean(errors.instructionRatingMessage)
										}
										variant="outlined"
										margin="dense"
									/>
								</div> 
                <div>
                  <FormControlLabel
                    control={
                      <Field
                        as={Switch}
                        color="primary"
                        name="sendInactiveMessage"
                        checked={values.sendInactiveMessage}
                      />
                    }
                      label={i18n.t("whatsappModal.form.sendInactiveMessage")}
                   />
                </div>
                
                <div>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.inactiveMessage")}
                    type="inactiveMessage"
                    multiline
                    rows={4}
                    fullWidth
                    name="inactiveMessage"
                    error={
                      touched.inactiveMessage && Boolean(errors.inactiveMessage)
                    }
                    helperText={
                      touched.inactiveMessage && errors.inactiveMessage
                    }
                    variant="outlined"
                    margin="dense"
                  />
                </div>
                <Grid xs={12} md={12} item>
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.formControl}
                    >
                      <InputLabel id="timeInactiveMessage-selection-label">
                        {i18n.t("whatsappModal.form.timeInactiveMessage")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("whatsappModal.form.timeInactiveMessage")}
                        placeholder={i18n.t(
                          "whatsappModal.form.timeInactiveMessage"
                        )}
                        labelId="timeInactiveMessage-selection-label"
                        id="timeInactiveMessage"
                        name="timeInactiveMessage"
                      >
                        <MenuItem value={"0"}>Desabilitado</MenuItem>
                        <MenuItem value={"0.25"}>15 minutos</MenuItem>
                        <MenuItem value={"1"}>1 hora</MenuItem>
                        <MenuItem value={"4"}>4 horas</MenuItem>
                        <MenuItem value={"8"}>8 horas</MenuItem>
                        <MenuItem value={"12"}>12 horas</MenuItem>
                        <MenuItem value={"24"}>24 horas</MenuItem>
                        <MenuItem value={"36"}>36 horas</MenuItem>
                        <MenuItem value={"96"}>4 dias</MenuItem>
                        <MenuItem value={"168"}>7 dias</MenuItem>
                      </Field>
                    </FormControl>
                  </Grid>

                <div>
                  {/* Expediente */}

                  {defineWorkHours === true ? (


                    <div
                    // className={classes.textoExpediente}
                    >
                      <TextField
                        label={i18n.t("whatsappModal.form.outOfWorkMessage")}
                        rows={4}
                        multiline
                        fullWidth
                        name="outOfWorkMessage"
                        value={outOfWorkMessage}
                        error={
                          touched.outOfWorkMessage &&
                          Boolean(errors.outOfWorkMessage)
                        }
                        helperText={
                          touched.outOfWorkMessage &&
                          errors.outOfWorkMessage
                        }
                        variant="outlined"
                        margin="dense"

                        onChange={(e) => setOutOfWorkMessage(e.target.value)}
                      />

                    </div>
                  ) : (
                    ""
                  )}
                  <div ></div>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} className={classes.diasSemana}>
                      <FormControl component="fieldset">
                        <FormGroup
                          aria-label="position"
                          row
                          sx={{
                            width: {
                              xs: 100,
                              sm: 200,
                              md: 300,
                              lg: 600,
                              xl: 700,
                            },
                          }}
                        >
                          <Tooltip title={i18n.t("whatsappModal.form.longText")} placement="top">
                            {/* <FormControlLabel
                              value="defineWorkHours"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={defineWorkHours}
                                  onChange={handleChange}
                                />
                              }
                              label="Definir horário de expediente"
                              labelPlacement="end"

                            /> */}

                            <FormControlLabel
                              control={
                                <Field
                                  as={Switch}
                                  value="defineWorkHours"
                                  name="outOfWorkMessage"
                                  color="primary"
                                  checked={defineWorkHours}
                                  onChange={handleChange}
                                />
                              }
                              label="Definir horário de expediente"
                              labelPlacement="end"
                            />
                          </Tooltip>
                        </FormGroup>
                      </FormControl>
                    </Grid>
                  </Grid>
                  {defineWorkHours === true ? (
                    <>
                      <Grid item xs={12} sm={12} className={classes.diasSemana} >
                        <FormControl component="fieldset" sx={{ display: "flex", justifyContent: "center" }}>
                          <FormGroup
                            aria-label="position"
                            row
                            sx={{
                              width: {
                                xs: 100,
                                sm: 200,
                                md: 300,
                                lg: 600,
                                xl: 700,
                              },
                              justifyContent: "space-between",
                            }}
                          >
                            {/* _______________________________________________ */}
                            <FormControlLabel
                              value="MON"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={seg}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("whatsappModal.form.monday")}
                              labelPlacement="end"
                              style={{ marginRight: 25 }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.startWorkHour")}
                              name="StartDefineWorkHoursMonday"
                              value={StartDefineWorkHoursMonday}
                              onChange={(e) => setStartDefineWorkHoursMonday(e.target.value)}
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.startWorkHourLunch")}</mark>` }} />}
                              name="StartDefineWorkHoursMondayLunch"
                              value={StartDefineWorkHoursMondayLunch}
                              onChange={(e) =>
                                setStartDefineWorkHoursMondayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />

                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.endWorkHourLunch")}</mark>` }} />}
                              name="EndDefineWorkHoursMondayLunch"
                              value={EndDefineWorkHoursMondayLunch}
                              onChange={(e) =>
                                setEndDefineWorkHoursMondayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}

                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.endWorkHour")}
                              name="EndDefineWorkHoursMonday"
                              value={EndDefineWorkHoursMonday}
                              onChange={(e) =>
                                setEndDefineWorkHoursMonday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />

                            {/* ____________________________________________________________________________________________________________ */}

                            <FormControlLabel
                              value="TUE"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={ter}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("whatsappModal.form.tuesday")}
                              labelPlacement="end"
                              style={{ marginRight: 45 }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.startWorkHour")}
                              name="StartDefineWorkHoursTuesday"
                              value={StartDefineWorkHoursTuesday}
                              onChange={(e) =>
                                setStartDefineWorkHoursTuesday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.startWorkHourLunch")}</mark>` }} />}
                              name="StartDefineWorkHoursTuesdayLunch"
                              value={StartDefineWorkHoursTuesdayLunch}
                              onChange={(e) =>
                                setStartDefineWorkHoursTuesdayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />

                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.endWorkHourLunch")}</mark>` }} />}
                              name="EndDefineWorkHoursTuesdayLunch"
                              value={EndDefineWorkHoursTuesdayLunch}
                              onChange={(e) =>
                                setEndDefineWorkHoursTuesdayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.endWorkHour")}
                              name="EndDefineWorkHoursTuesday"
                              value={EndDefineWorkHoursTuesday}
                              onChange={(e) =>
                                setEndDefineWorkHoursTuesday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            {/* ____________________________________________________________________________________________________________ */}
                            <FormControlLabel
                              value="WED"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={quar}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("whatsappModal.form.wednesday")}
                              labelPlacement="end"
                              style={{ marginRight: 40 }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.startWorkHour")}
                              name="StartDefineWorkHoursWednesday"
                              value={StartDefineWorkHoursWednesday}
                              onChange={(e) =>
                                setStartDefineWorkHoursWednesday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.startWorkHourLunch")}</mark>` }} />}
                              name="StartDefineWorkHoursWednesdayLunch"
                              value={StartDefineWorkHoursWednesdayLunch}
                              onChange={(e) =>
                                setStartDefineWorkHoursWednesdayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />

                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.endWorkHourLunch")}</mark>` }} />}
                              name="EndDefineWorkHoursWednesdayLunch"
                              value={EndDefineWorkHoursWednesdayLunch}
                              onChange={(e) =>
                                setEndDefineWorkHoursWednesdayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.endWorkHour")}
                              name="EndDefineWorkHoursWednesday"
                              value={EndDefineWorkHoursWednesday}
                              onChange={(e) =>
                                setEndDefineWorkHoursWednesday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            {/* ____________________________________________________________________________________________________________ */}
                            <FormControlLabel
                              value="THU"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={quin}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("whatsappModal.form.thursday")}
                              labelPlacement="end"
                              style={{ marginRight: 40 }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.startWorkHour")}
                              name="StartDefineWorkHoursThursday"
                              value={StartDefineWorkHoursThursday}
                              onChange={(e) =>
                                setStartDefineWorkHoursThursday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.startWorkHourLunch")}</mark>` }} />}
                              name="StartDefineWorkHoursThursdayLunch"
                              value={StartDefineWorkHoursThursdayLunch}
                              onChange={(e) =>
                                setStartDefineWorkHoursThursdayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />

                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.endWorkHourLunch")}</mark>` }} />}
                              name="EndDefineWorkHoursThursdayLunch"
                              value={EndDefineWorkHoursThursdayLunch}
                              onChange={(e) =>
                                setEndDefineWorkHoursThursdayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.endWorkHour")}
                              name="EndDefineWorkHoursThursday"
                              value={EndDefineWorkHoursThursday}
                              onChange={(e) =>
                                setEndDefineWorkHoursThursday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            {/* ____________________________________________________________________________________________________________ */}
                            <FormControlLabel
                              value="FRI"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={sex}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("whatsappModal.form.friday")}
                              labelPlacement="end"
                              style={{ marginRight: 45 }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.startWorkHour")}
                              name="StartDefineWorkHoursFriday"
                              value={StartDefineWorkHoursFriday}
                              onChange={(e) =>
                                setStartDefineWorkHoursFriday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.startWorkHourLunch")}</mark>` }} />}
                              name="StartDefineWorkHoursFridayLunch"
                              value={StartDefineWorkHoursFridayLunch}
                              onChange={(e) =>
                                setStartDefineWorkHoursFridayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />

                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.endWorkHourLunch")}</mark>` }} />}
                              name="EndDefineWorkHoursFridayLunch"
                              value={EndDefineWorkHoursFridayLunch}
                              onChange={(e) =>
                                setEndDefineWorkHoursFridayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.endWorkHour")}
                              name="EndDefineWorkHoursFriday"
                              value={EndDefineWorkHoursFriday}
                              onChange={(e) =>
                                setEndDefineWorkHoursFriday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            {/* ____________________________________________________________________________________________________________ */}
                            <FormControlLabel
                              value="SAT"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={sab}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("whatsappModal.form.saturday")}
                              labelPlacement="end"
                              style={{ marginRight: 30 }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.startWorkHour")}
                              name="StartDefineWorkHoursSaturday"
                              value={StartDefineWorkHoursSaturday}
                              onChange={(e) =>
                                setStartDefineWorkHoursSaturday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.startWorkHourLunch")}</mark>` }} />}
                              name="StartDefineWorkHoursSaturdayLunch"
                              value={StartDefineWorkHoursSaturdayLunch}
                              onChange={(e) =>
                                setStartDefineWorkHoursSaturdayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />

                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.endWorkHourLunch")}</mark>` }} />}
                              name="EndDefineWorkHoursSaturdayLunch"
                              value={EndDefineWorkHoursSaturdayLunch}
                              onChange={(e) =>
                                setEndDefineWorkHoursSaturdayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.endWorkHour")}
                              name="EndDefineWorkHoursSaturday"
                              value={EndDefineWorkHoursSaturday}
                              onChange={(e) =>
                                setEndDefineWorkHoursSaturday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            {/* ____________________________________________________________________________________________________________ */}
                            <FormControlLabel
                              value="SUN"
                              control={
                                <Checkbox
                                  size="small"
                                  checked={dom}
                                  onChange={handleChange}
                                />
                              }
                              label={i18n.t("whatsappModal.form.sunday")}
                              labelPlacement="end"
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.startWorkHour")}
                              name="StartDefineWorkHoursSunday"
                              value={StartDefineWorkHoursSunday}
                              onChange={(e) =>
                                setStartDefineWorkHoursSunday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.startWorkHourLunch")}</mark>` }} />}
                              name="StartDefineWorkHoursSundayLunch"
                              value={StartDefineWorkHoursSundayLunch}
                              onChange={(e) =>
                                setStartDefineWorkHoursSundayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />

                            <TextField
                              className={classes.hora}
                              type="time"
                              label={<span dangerouslySetInnerHTML={{ __html: `<mark>${i18n.t("whatsappModal.form.endWorkHourLunch")}</mark>` }} />}
                              name="EndDefineWorkHoursSundayLunch"
                              value={EndDefineWorkHoursSundayLunch}
                              onChange={(e) =>
                                setEndDefineWorkHoursSundayLunch(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            <TextField
                              className={classes.hora}
                              type="time"
                              label={i18n.t("whatsappModal.form.endWorkHour")}
                              name="EndDefineWorkHoursSunday"
                              value={EndDefineWorkHoursSunday}
                              onChange={(e) =>
                                setEndDefineWorkHoursSunday(e.target.value)
                              }
                              InputLabelProps={{
                                shrink: true,
                                position: "top",
                              }}
                            />
                            {/* ____________________________________________________________________________________________________________ */}
                          </FormGroup>
                        </FormControl>
                      </Grid>

                    </>
                  ) : (
                    ""
                  )}
                </div>


                <QueueSelect
                  selectedQueueIds={selectedQueueIds}
                  onChange={selectedIds => setSelectedQueueIds(selectedIds)}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("whatsappModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {whatsAppId
                    ? i18n.t("whatsappModal.buttons.okEdit")
                    : i18n.t("whatsappModal.buttons.okAdd")}
                  {isSubmitting && (
                    <CircularProgress
                      size={24}
                      className={classes.buttonProgress}
                    />
                  )}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default React.memo(WhatsAppModal);