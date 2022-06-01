import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

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
                <h2>תיעוד לשליחת הודעות</h2>

                <h2 className={classes.color}>שיטות משלוח</h2>

                <p className={classes.text}>1. הודעות טקסט</p>
                <p className={classes.text}>2. הודעות מדיה</p>

                <h2 className={classes.color}>הוראות</h2>
                <p><b>הערות חשובות</b></p>
                <ul>
                    <li className={classes.text}>כדי לקבל את אסימון ה-API, היכנסו להגדרות והטוקן שלכם יהיה שם, בלעדיו לא ניתן יהיה לשלוח הודעות..</li>
                    <li className={classes.text}>למספר השולח אסור לכלול מסכה או תווים מיוחדים והוא חייב להיות מורכב מ:</li>
                    <br />
                    <ol>
                        <ul>
                            <li className={classes.text}>קידומת מדינה - לדוגמה: 972 (ישראל)</li>
                            <li className={classes.text}>DDD</li>
                            <li className={classes.text}>מספר</li>
                        </ul>
                    </ol>
                </ul>
                <h2 className={classes.color}>1. הודעות טקסט</h2>
                <p>להלן רשימה של מידע הדרוש לשליחת הודעות טקסט:</p>
                <p className={classes.textP}><b>כתובת אתר: </b>{process.env.REACT_APP_BACKEND_URL}/api/messages/send</p>
                <p className={classes.textP}><b>שיטה: </b>POST</p>
                <p className={classes.textP}><b>כותרות: </b>Authorization: Bearer (token) e Content-Type application/json</p>
                <p className={classes.textP}><b>Body: </b>"number": "972540000000", "body": "Test via api"</p>

                <h2 className={classes.color}>2. הודעות מדיה</h2>
                <p>להלן רשימה של מידע הדרוש לשליחת מדיה:</p>
                <p className={classes.textP}><b>כתובת אתר: </b>{process.env.REACT_APP_BACKEND_URL}/api/messages/send</p>
                <p className={classes.textP}><b>שיטה: </b>POST</p>
                <p className={classes.textP}><b>כותרות: </b>Authorization: Bearer (token) e Content-Type multipart/form-data</p>
                <p className={classes.textP}><b>Body: </b>"number": "9725400000000", "media": "here goes your media", "body": "Sent via api"</p>
            </Container>
        </div>
    );
};

export default Api;
