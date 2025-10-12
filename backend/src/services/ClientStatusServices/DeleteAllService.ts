import ClientStatus from "../../models/ClientStatus";

const DeleteAllService = async (): Promise<void> => {
  await ClientStatus.destroy({ where: {}, truncate: true });
};

export default DeleteAllService;
