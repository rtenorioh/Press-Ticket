import React from "react";
import { ListItemText, MenuItem, Typography, Box, Divider, Button, useTheme, IconButton } from "@mui/material";
import { Check, AccountTreeOutlined, ClearAll } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const QueueMenuItems = ({
  userQueues,
  selectedQueueIds = [],
  onChange,
  onClose
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleToggle = (queueId) => {
    const currentIndex = selectedQueueIds.indexOf(queueId);
    const newSelectedQueueIds = [...selectedQueueIds];
    
    if (currentIndex === -1) {
      newSelectedQueueIds.push(queueId);
    } else {
      newSelectedQueueIds.splice(currentIndex, 1);
    }
    
    onChange(newSelectedQueueIds);
  };
  
  const handleSelectAll = () => {
    if (userQueues?.length > 0) {
      const allQueueIds = userQueues.map(queue => queue.id);
      onChange(allQueueIds);
    }
  };
  
  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: "8px 16px",
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: "bold",
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AccountTreeOutlined fontSize="small" />
          {t("ticketsQueueSelect.placeholder")}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Button 
            size="small" 
            variant="text" 
            onClick={handleSelectAll}
            sx={{ 
              minWidth: 'auto', 
              padding: '4px 8px',
              fontSize: '0.75rem',
              textTransform: 'uppercase'
            }}
          >
            {t("all")}
          </Button>
          <IconButton 
            size="small" 
            onClick={handleClearAll}
            sx={{ 
              padding: '4px',
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
            title="Limpar seleção"
          >
            <ClearAll fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ maxHeight: '300px', overflowY: 'auto', padding: '4px 0' }}>
        {userQueues?.length > 0 ? (
          userQueues.map(queue => (
            <MenuItem 
              dense 
              key={queue.id} 
              onClick={() => handleToggle(queue.id)}
              sx={{ 
                borderRadius: theme.shape.borderRadius,
                margin: "4px 8px",
                padding: "4px 8px",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  transform: 'translateX(2px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: queue.color,
                  marginRight: '8px',
                  flexShrink: 0
                }} 
              />
              <ListItemText 
                primary={queue.name} 
                primaryTypographyProps={{ 
                  variant: 'body2',
                  style: { fontWeight: selectedQueueIds.indexOf(queue.id) > -1 ? 'bold' : 'normal' }
                }}
              />
              {selectedQueueIds.indexOf(queue.id) > -1 && (
                <Check fontSize="small" color="primary" sx={{ marginLeft: '4px' }} />
              )}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled sx={{ margin: "4px 8px" }}>
            <ListItemText primary={t("ticketsQueueSelect.noQueues")} />
          </MenuItem>
        )}
      </Box>
    </>
  );
};

export default QueueMenuItems;
