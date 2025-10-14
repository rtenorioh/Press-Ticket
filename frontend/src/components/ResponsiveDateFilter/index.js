import React from 'react';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(1),
  }
}));

const DateFieldsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: '100%',
  background: theme.palette.mode === 'dark' 
    ? theme.palette.background.paper
    : `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.background.paper} 100%)`,
  borderRadius: 12,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 16px 0 rgba(0, 0, 0, 0.4)'
    : '0 4px 16px 0 rgba(80, 80, 160, 0.1)',
  border: theme.palette.mode === 'dark' 
    ? `1px solid ${theme.palette.divider}` 
    : 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.palette.mode === 'dark'
      ? '0 6px 20px 0 rgba(0, 0, 0, 0.5)'
      : '0 6px 20px 0 rgba(80, 80, 160, 0.14)',
  },
  '& .MuiInputBase-root': {
    color: theme.palette.text.primary,
    background: 'transparent',
    borderRadius: 12,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.9rem',
    }
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.primary,
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.9rem',
    }
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' 
      ? theme.palette.divider
      : theme.palette.primary.light,
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
}));

const ResponsiveDateFilter = ({ startDateLabel, endDateLabel, startDate, endDate, onStartDateChange, onEndDateChange }) => {
  return (
    <FilterContainer>
      <DateFieldsContainer>
        <StyledTextField
          label={startDateLabel}
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          size="small"
        />
        <StyledTextField
          label={endDateLabel}
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          size="small"
        />
      </DateFieldsContainer>
    </FilterContainer>
  );
};

export default ResponsiveDateFilter;
