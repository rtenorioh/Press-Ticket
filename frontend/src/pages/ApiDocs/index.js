import { styled } from "@mui/material/styles";
import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const Root = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(1),
  height: 'calc(100vh - 80px)',
  overflow: 'hidden',
  gap: theme.spacing(1),
}));

const StyledIframe = styled('iframe')({
  border: 'none',
  width: '100%',
  flex: 1,
  minHeight: '0',
});

const ApiDocs = () => {
  const [iframeError, setIframeError] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  const normalizedUrl = backendUrl.replace(/^https:\/\/(localhost|127\.0\.0\.1)/, 'http://$1');
  const urlapi = `${normalizedUrl}/api-docs/`;

  if (!backendUrl) {
    return <div>Erro: REACT_APP_BACKEND_URL não configurado</div>;
  }

  const handleOpenNewTab = () => {
    window.open(urlapi, '_blank', 'noopener,noreferrer');
  };

  return (
    <Root>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          size="small"
          endIcon={<OpenInNewIcon />}
          onClick={handleOpenNewTab}
        >
          Abrir em nova aba
        </Button>
      </Box>

      {iframeError ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Não foi possível carregar a documentação nesta janela.
          </Typography>
          <Button variant="contained" endIcon={<OpenInNewIcon />} onClick={handleOpenNewTab}>
            Abrir Documentação da API
          </Button>
        </Box>
      ) : (
        <StyledIframe
          title="Documentação da API"
          src={urlapi}
          allow="fullscreen"
          onError={() => setIframeError(true)}
        />
      )}
    </Root>
  );
};

export default ApiDocs;