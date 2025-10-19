import React from "react";
import ErrorLogService from "../../services/ErrorLogService";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        
        try {
            ErrorLogService.logError({
                message: error.message || "Erro não identificado",
                stack: error.stack,
                component: this.props.componentName || "ErrorBoundary",
                severity: "error"
            }).catch(err => {
                console.error("Falha ao registrar erro:", err);
            });
        } catch (logError) {
            console.error("Erro ao tentar registrar erro:", logError);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ 
                    padding: "20px", 
                    textAlign: "center", 
                    backgroundColor: "#f8d7da", 
                    color: "#721c24",
                    borderRadius: "4px",
                    margin: "20px"
                }}>
                    <h2>Ops! Algo deu errado.</h2>
                    <p>Ocorreu um erro inesperado. Este erro foi registrado automaticamente.</p>
                    <p>Por favor, tente recarregar a página ou voltar para a página inicial.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#721c24",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            marginRight: "10px"
                        }}
                    >
                        Recarregar Página
                    </button>
                    <button 
                        onClick={() => window.location.href = "/"} 
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer"
                        }}
                    >
                        Voltar para o Início
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
