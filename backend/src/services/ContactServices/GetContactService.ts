import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import CreateContactService from "./CreateContactService";
import Tag from "../../models/Tag";

interface ExtraInfo {
    name: string;
    value: string;
}

interface Request {
    name: string;
    number: string;
    address?: string;
    email?: string;
    profilePicUrl?: string;
    extraInfo?: ExtraInfo[];
}

const GetContactService = async ({ name, number }: Request): Promise<Contact> => {
    const numberExists = await Contact.findOne({
        where: { number },
        include: [
            "extraInfo",
            {
                model: Tag,
                as: "tags",
                attributes: ["id", "name", "color"]
            }
        ]
    });

    if (!numberExists) {
        const contact = await CreateContactService({
            name,
            number,
        });

        if (contact == null)
            throw new AppError("CONTACT_NOT_FIND");
        else {
            const newContact = await Contact.findByPk(contact.id, {
                include: [
                    "extraInfo",
                    {
                        model: Tag,
                        as: "tags",
                        attributes: ["id", "name", "color"]
                    }
                ]
            });
            
            return newContact || contact;
        }
    }

    return numberExists;
};

export default GetContactService;