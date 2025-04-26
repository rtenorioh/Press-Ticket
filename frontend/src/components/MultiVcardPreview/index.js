import {
  Box,
  styled
} from "@mui/material";
import React, { useEffect, useState } from 'react';
import VcardPreview from '../VcardPreview';

const Container = styled('div')(({ theme }) => ({
  backgroundColor: '#e6ffda',
  borderRadius: '8px',
  padding: '12px 14px',
  marginTop: '8px',
  marginBottom: '8px',
  boxShadow: '0 1px 1px rgba(0, 0, 0, 0.08)',
  position: 'relative',
  border: '1px solid rgba(0, 0, 0, 0.05)'
}));

const Title = styled('div')(({ theme }) => ({
  color: '#075E54',
  fontWeight: 600,
  fontSize: '15px',
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 0 8px 0',
  borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
}));

const ViewAllButton = styled('div')(({ theme }) => ({
  color: '#128c7e',
  fontSize: '14px',
  padding: '10px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  textAlign: 'center',
  marginTop: '10px',
  backgroundColor: 'rgba(18, 140, 126, 0.08)',
  width: '100%',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(18, 140, 126, 0.12)'
  }
}));

const ContactsContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
}));

const ContactCounter = styled('span')(({ theme }) => ({
  backgroundColor: '#128c7e',
  color: 'white',
  borderRadius: '12px',
  padding: '2px 8px',
  fontSize: '12px',
  marginLeft: '8px',
  fontWeight: 'normal'
}));

const MultiVcardPreview = ({ contacts }) => {
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
    <Box sx={{ marginTop: 1, marginBottom: 1 }}>
      <Container>
        <Title>
          {mainContactName}
          {otherContactsCount > 0 && (
            <ContactCounter>
              +{otherContactsCount}
            </ContactCounter>
          )}
        </Title>
        
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
          <ViewAllButton 
            onClick={() => setShowAllContacts(true)}
          >
            Ver todos os {processedContacts.length} contatos
          </ViewAllButton>
        )}
      </Container>
    </Box>
  );
};

export default MultiVcardPreview;
