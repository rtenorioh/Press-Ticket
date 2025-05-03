import {
  Box,
  Paper,
  Typography,
  Button,
  styled
} from "@mui/material";
import React, { useEffect, useState } from 'react';
import VcardPreview from '../VcardPreview';
import { useTranslation } from "react-i18next";
import ContactsIcon from "@mui/icons-material/Contacts";

const Container = styled(Paper)(({ theme }) => ({
  width: "450px",
  maxWidth: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  backgroundColor: theme.palette.background.paper,
  margin: "0 auto"
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  width: "100%",
  flexDirection: "column"
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(1)
}));

const ContactsTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "1rem",
  color: theme.palette.primary.main,
  marginLeft: theme.spacing(1)
}));

const StyledContactsIcon = styled(ContactsIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: "1.5rem"
}));

const ContactsContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  width: "100%",
  marginBottom: theme.spacing(2)
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(1),
  textTransform: "uppercase",
  fontWeight: "bold",
  backgroundColor: theme.palette.primary.main,
  color: "#fff",
  transition: "all 0.3s ease",
  alignSelf: "center",
  margin: "0 auto",
  display: "flex",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled
  }
}));

const ContactCounter = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  borderRadius: "12px",
  padding: "2px 8px",
  fontSize: "0.75rem",
  marginLeft: theme.spacing(1),
  fontWeight: "normal",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center"
}));

const MultiVcardPreview = ({ contacts }) => {
  const { t } = useTranslation();
  const [showAllContacts, setShowAllContacts] = useState(false);
  const [processedContacts, setProcessedContacts] = useState([]);

  useEffect(() => {
    const processContacts = () => {
      try {
        if (!contacts) {
          console.warn("Contacts is undefined or null");
          return [];
        }
        
        let result = [];
        
        if (typeof contacts === 'string') {
          try {
            const cleanContacts = contacts.replace(/\\n/g, '').replace(/\\r/g, '').replace(/\\\\/g, '').replace(/\\"/g, '"');
            result = JSON.parse(cleanContacts);
          } catch (error) {
            console.error("Error parsing contacts string:", error);
            return [];
          }
        } 
        else if (Array.isArray(contacts)) {
          result = contacts;
        } 
        else if (typeof contacts === 'object' && contacts !== null) {
          result = [contacts];
        }
        
        if (!Array.isArray(result)) {
          console.warn("Result is not an array, converting to array");
          result = [result];
        }
        
        const validContacts = result
          .filter(contact => contact && (contact.name || contact.number))
          .map(contact => ({
            id: contact.id || 0,
            name: contact.name || "Contato",
            number: contact.number || "Número não disponível"
          }));
        
        return validContacts;
      } catch (error) {
        console.error("Error processing contacts:", error);
        return [];
      }
    };
    
    const result = processContacts();
    setProcessedContacts(result);
  }, [contacts]);
  
  if (!processedContacts || processedContacts.length === 0) {
    return null;
  }
  
  const [firstContact, ...otherContacts] = processedContacts;
  const mainContactName = firstContact.name || "Contato";
  const otherContactsCount = otherContacts.length;
  
  return (
    <Box sx={{ marginTop: 2, marginBottom: 2 }}>
      <Container elevation={2}>
        <ContentContainer>
          <TitleContainer>
            <StyledContactsIcon />
            <ContactsTitle variant="h6">
              {mainContactName}
              {otherContactsCount > 0 && (
                <ContactCounter>
                  +{otherContactsCount}
                </ContactCounter>
              )}
            </ContactsTitle>
          </TitleContainer>
          
          <ContactsContainer>
            {(showAllContacts ? processedContacts : [firstContact]).map((contact, index) => (
              <Box key={index}>
                <VcardPreview 
                  contact={contact.name || "Contato"} 
                  numbers={contact.number || "Número não disponível"} 
                />
              </Box>
            ))}
          </ContactsContainer>
          
          {otherContactsCount > 0 && !showAllContacts && (
            <StyledButton
              variant="contained"
              onClick={() => setShowAllContacts(true)}
              startIcon={<ContactsIcon />}
              size="small"
            >
              {t("multiVcardPreview.viewAll", "Ver todos os {{count}} contatos").replace("{{count}}", processedContacts.length)}
            </StyledButton>
          )}
        </ContentContainer>
      </Container>
    </Box>
  );
};

export default MultiVcardPreview;
