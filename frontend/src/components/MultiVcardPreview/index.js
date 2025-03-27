import React, { useState, useEffect } from 'react';
import {
  Box,
  makeStyles
} from "@material-ui/core";
import VcardPreview from '../VcardPreview';

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: '#e6ffda',
    borderRadius: '8px',
    padding: '12px 14px',
    // maxWidth: '85%',
    marginTop: '8px',
    marginBottom: '8px',
    boxShadow: '0 1px 1px rgba(0, 0, 0, 0.08)',
    position: 'relative',
    border: '1px solid rgba(0, 0, 0, 0.05)'
  },
  title: {
    color: '#075E54',
    fontWeight: 600,
    fontSize: '15px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 0 8px 0',
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
  },
  viewAllButton: {
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
  },
  timestamp: {
    marginLeft: 'auto',
    fontSize: '12px',
    color: '#667781'
  },
  contactsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  contactCounter: {
    backgroundColor: '#128c7e',
    color: 'white',
    borderRadius: '12px',
    padding: '2px 8px',
    fontSize: '12px',
    marginLeft: '8px',
    fontWeight: 'normal'
  }
}));

const MultiVcardPreview = ({ contacts, timestamp }) => {
  const classes = useStyles();
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
    // console.warn("No valid contacts to display");
    return null;
  }
  
  const [firstContact, ...otherContacts] = processedContacts;
  const mainContactName = firstContact.name || "Contato";
  const otherContactsCount = otherContacts.length;
  
  let titleCard = mainContactName;
  if (otherContactsCount === 1) {
    titleCard = `${mainContactName} e 1 outro contato`;
  } else if (otherContactsCount > 1) {
    titleCard = `${mainContactName} e outros ${otherContactsCount} contatos`;
  }
  
  return (
    <Box sx={{ marginTop: 1, marginBottom: 1 }}>
      <div className={classes.container}>
        <div className={classes.title}>
          {mainContactName}
          {otherContactsCount > 0 && (
            <span className={classes.contactCounter}>
              +{otherContactsCount}
            </span>
          )}
          <span className={classes.timestamp}>
            {timestamp ? new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
          </span>
        </div>
        
        <div className={classes.contactsContainer}>
          {(showAllContacts ? processedContacts : [firstContact]).map((contact, index) => (
            <Box key={index}>
              <VcardPreview 
                contact={contact.name || "Contato"} 
                numbers={contact.number || "Número não disponível"} 
              />
            </Box>
          ))}
        </div>
        
        {otherContactsCount > 0 && !showAllContacts && (
          <div 
            className={classes.viewAllButton}
            onClick={() => setShowAllContacts(true)}
          >
            Ver todos os {processedContacts.length} contatos
          </div>
        )}
      </div>
    </Box>
  );
};

export default MultiVcardPreview;
