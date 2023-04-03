import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(2),
    },

    paper: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(2),
        display: "flex",
        alignItems: "center",
        marginBottom: 12,
    },

    settingOption: {
        marginLeft: "auto",
    },

    margin: {
        margin: theme.spacing(1),
    },

    color: {
        color: theme.palette.secondary.main,
    },

    text: {
        marginLeft: "42px",
        color: theme.palette.text.secondary,
    },

    textP: {
        marginLeft: "42px",
        color: theme.palette.text.secondary,
    },

}));

const Api = () => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Container>
                <h2>{i18n.t("api.title")}</h2>

                <h2 className={classes.color}>{i18n.t("api.shippingMethods.title")}</h2>

                <p className={classes.text}>1. {i18n.t("api.shippingMethods.text")}</p>
                <p className={classes.text}>2. {i18n.t("api.shippingMethods.file")}</p>

                <h2 className={classes.color}>{i18n.t("api.instructions.title")}</h2>
                <p><b>{i18n.t("api.instructions.observations")}</b></p>
                <ul>
                    <li className={classes.text}>{i18n.t("api.instructions.token")}</li>
                    <li className={classes.text}>{i18n.t("api.instructions.helpNumber.title")}</li>
                    <br />
                    <ol>
                        <ul>
                            <li className={classes.text}>{i18n.t("api.instructions.helpNumber.DDI")}</li>
                            <li className={classes.text}>{i18n.t("api.instructions.helpNumber.DDD")}</li>
                            <li className={classes.text}>{i18n.t("api.instructions.helpNumber.number")}</li>
                        </ul>
                    </ol>
                </ul>
                <h2 className={classes.color}>1. {i18n.t("api.shippingMethods.text")}</h2>
                <p>{i18n.t("api.instructions.exempleText")}</p>
                <p className={classes.textP}><b>URL: </b>{process.env.REACT_APP_BACKEND_URL}/api/send</p>
                <p className={classes.textP}><b>Metódo: </b>POST</p>
                <p className={classes.textP}><b>Headers: </b>Authorization: Bearer (token) e Content-Type application/json</p>
                <p className={classes.textP}><b>Body: </b><br></br><br></br>
                "number": "{i18n.t("api.instructions.helpNumber.fullNumber")}", <br></br>
                "body": "{i18n.t("api.instructions.helpNumber.body")}",<br></br>
                "whatsappId": "{i18n.t("api.instructions.helpNumber.queueId")}", <br></br>
                "queueId": "{i18n.t("api.instructions.helpNumber.queueId")}", <br></br>
                "tagsId": "{i18n.t("api.instructions.helpNumber.tagsId")}", <br></br>
                "userId": "{i18n.t("api.instructions.helpNumber.userId")}" <br></br>
                </p><br></br>
                
                


                <h2 className={classes.color}>2. {i18n.t("api.shippingMethods.file")}</h2>
                <p>{i18n.t("api.instructions.exempleFile")}</p>
                <p className={classes.textP}><b>URL: </b>{process.env.REACT_APP_BACKEND_URL}/api/send</p>
                <p className={classes.textP}><b>Metódo: </b>POST</p>
                <p className={classes.textP}><b>Headers: </b>Authorization: Bearer (token) e Content-Type multipart/form-data</p>
                <p className={classes.textP}><b>Body: </b><br></br><br></br>
                "number": "{i18n.t("api.instructions.helpNumber.fullNumber")}", <br></br>
                "medias": "{i18n.t("api.instructions.helpNumber.medias")}", <br></br>
                "body": "{i18n.t("api.instructions.helpNumber.body")}"</p>
            </Container>
        </div>
    );
};

export default Api;