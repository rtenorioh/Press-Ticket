import PollVote from "../models/PollVote";
import Message from "../models/Message";
import Contact from "../models/Contact";
import { getIO } from "../libs/socket";
import { logger } from "../utils/logger";

interface PollVoteData {
  pollMessageId: string;
  voterId: string;
  voterName?: string;
  selectedOptions: Array<{ localId: number; name: string }>;
  timestamp: Date;
}

class PollVoteService {
  async createOrUpdate(data: PollVoteData): Promise<PollVote> {
    try {
      const { pollMessageId, voterId, voterName, selectedOptions, timestamp } = data;

      const [vote, created] = await PollVote.findOrCreate({
        where: {
          pollMessageId,
          voterId
        },
        defaults: {
          pollMessageId,
          voterId,
          voterName: voterName || voterId,
          selectedOptions: JSON.stringify(selectedOptions),
          timestamp
        }
      });

      if (!created) {
        await vote.update({
          selectedOptions: JSON.stringify(selectedOptions),
          timestamp
        });
      }

      logger.info(`[POLL_VOTE] Voto ${created ? 'criado' : 'atualizado'}: ${voterId} -> ${pollMessageId}`);

      const message = await Message.findByPk(pollMessageId);
      if (message) {
        const io = getIO();
        const votes = await this.getVotesByPollId(pollMessageId);
        
        logger.info(`[POLL_VOTE] Emitindo pollVoteUpdate para ticket ${message.ticketId}`);
        logger.info(`[POLL_VOTE] Total de votos: ${votes.length}`);
        
        io.to(message.ticketId.toString())
          .to(`ticket-${message.ticketId}`)
          .to("notification")
          .emit("pollVoteUpdate", {
            pollMessageId,
            votes,
            ticketId: message.ticketId
          });
      }

      return vote;
    } catch (error) {
      logger.error(`[POLL_VOTE] Erro ao criar/atualizar voto: ${error}`);
      throw error;
    }
  }

  async getVotesByPollId(pollMessageId: string) {
    try {
      const votes = await PollVote.findAll({
        where: { pollMessageId },
        order: [["timestamp", "DESC"]]
      });

      return votes.map(vote => ({
        id: vote.id,
        voterId: vote.voterId,
        voterName: vote.voterName,
        selectedOptions: JSON.parse(vote.selectedOptions),
        timestamp: vote.timestamp
      }));
    } catch (error) {
      logger.error(`[POLL_VOTE] Erro ao buscar votos: ${error}`);
      return [];
    }
  }

  async getVotesSummary(pollMessageId: string) {
    try {
      const message = await Message.findByPk(pollMessageId);
      if (!message || message.mediaType !== "poll") {
        return null;
      }

      const votes = await this.getVotesByPollId(pollMessageId);
      
      const bodyLines = message.body.split('\n');
      const pollName = bodyLines[0].replace('📊 Enquete: ', '');
      
      const optionsLines = bodyLines.slice(3);
      const pollOptions = optionsLines
        .filter(line => line.trim() !== '')
        .map((line, index) => {
          const match = line.match(/^\d+\.\s+(.+)$/);
          if (match) {
            return {
              localId: index,
              name: match[1]
            };
          }
          return null;
        })
        .filter((option): option is { localId: number; name: string } => option !== null);

      const optionVotes = await Promise.all(pollOptions.map(async option => {
        const votersForOption = votes.filter(vote =>
          vote.selectedOptions.some((selected: any) => selected.localId === option.localId)
        );
        
        const votersWithPhotos = await Promise.all(votersForOption.map(async v => {
          let profilePicUrl = null;
          
          try {
            const voterNumber = v.voterId.replace('@c.us', '').replace('@s.whatsapp.net', '');
            
            const contact = await Contact.findOne({
              where: { number: voterNumber }
            });
            
            if (contact && contact.profilePicUrl) {
              // Se já for uma URL completa (http/https), usa diretamente
              if (contact.profilePicUrl.startsWith('http://') || contact.profilePicUrl.startsWith('https://')) {
                profilePicUrl = contact.profilePicUrl;
              } else {
                // Se for apenas o nome do arquivo, constrói a URL local
                profilePicUrl = `${process.env.BACKEND_URL}:${process.env.PROXY_PORT}/public/${contact.profilePicUrl}`;
              }
            }
          } catch (err) {
            logger.error(`[POLL_VOTE] Erro ao buscar foto do contato ${v.voterId}: ${err}`);
          }
          
          return {
            id: v.voterId,
            name: v.voterName,
            timestamp: v.timestamp,
            profilePicUrl
          };
        }));
        
        return {
          localId: option.localId,
          name: option.name,
          count: votersForOption.length,
          voters: votersWithPhotos
        };
      }));

      return {
        pollName,
        totalVotes: votes.length,
        options: optionVotes,
        allVotes: votes
      };
    } catch (error) {
      logger.error(`[POLL_VOTE] Erro ao gerar resumo: ${error}`);
      return null;
    }
  }
}

export default new PollVoteService();
