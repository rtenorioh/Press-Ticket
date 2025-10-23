import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import openSocket from "../services/socket-io";

const useGroupEvents = (whatsappId) => {
  const [events, setEvents] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!whatsappId) return;

    const socket = openSocket();

    const handleGroupEvent = (data) => {
      if (data.action === "create" && data.groupEvent) {
        const event = data.groupEvent;
        
        setEvents(prev => [event, ...prev]);
        setUnreadCount(prev => prev + 1);

        const message = formatEventMessage(event);
        
        if (message) {
          toast.info(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      }
    };

    socket.on(`whatsapp-${whatsappId}:groupEvent`, handleGroupEvent);

    return () => {
      socket.off(`whatsapp-${whatsappId}:groupEvent`, handleGroupEvent);
    };
  }, [whatsappId]);

  const formatEventMessage = (event) => {
    const { eventType, participantName, groupId, newValue, performedByName } = event;

    switch (eventType) {
      case "PARTICIPANT_ADDED":
        return `${participantName} foi adicionado ao grupo${performedByName ? ` por ${performedByName}` : ''}`;
      
      case "PARTICIPANT_REMOVED":
        return `${participantName} foi removido do grupo${performedByName ? ` por ${performedByName}` : ''}`;
      
      case "PARTICIPANT_PROMOTED":
        return `${participantName} foi promovido a administrador${performedByName ? ` por ${performedByName}` : ''}`;
      
      case "PARTICIPANT_DEMOTED":
        return `${participantName} foi rebaixado de administrador${performedByName ? ` por ${performedByName}` : ''}`;
      
      case "GROUP_NAME_CHANGED":
        return `Nome do grupo alterado para: ${newValue}`;
      
      case "GROUP_DESCRIPTION_CHANGED":
        return `Descrição do grupo foi alterada`;
      
      case "GROUP_ANNOUNCE_CHANGED":
        return newValue === "true" 
          ? "Apenas administradores podem enviar mensagens"
          : "Todos podem enviar mensagens";
      
      case "GROUP_RESTRICT_CHANGED":
        return newValue === "true"
          ? "Apenas administradores podem editar informações"
          : "Todos podem editar informações";
      
      case "GROUP_JOINED":
        return `Você entrou no grupo`;
      
      case "GROUP_LEFT":
        return `Você saiu do grupo`;
      
      default:
        return null;
    }
  };

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const clearEvents = () => {
    setEvents([]);
    setUnreadCount(0);
  };

  return {
    events,
    unreadCount,
    markAsRead,
    clearEvents,
    formatEventMessage
  };
};

export default useGroupEvents;
