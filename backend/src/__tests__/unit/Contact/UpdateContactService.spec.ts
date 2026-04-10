import { faker } from "@faker-js/faker";
import AppError from "../../../errors/AppError";
import CreateContactService from "../../../services/ContactServices/CreateContactService";
import UpdateContactService from "../../../services/ContactServices/UpdateContactService";
import { disconnect, truncate } from "../../utils/database";

describe("Contact - Update", () => {
  beforeEach(async () => {
    await truncate();
  });

  afterEach(async () => {
    await truncate();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("should be able to update a contact name", async () => {
    const contact = await CreateContactService({
      name: faker.person.fullName(),
      number: faker.string.numeric(13)
    });

    const newName = faker.person.fullName();
    const updated = await UpdateContactService({
      contactId: String(contact.id),
      contactData: { name: newName }
    });

    expect(updated.name).toBe(newName);
  });

  it("should be able to update a contact email", async () => {
    const contact = await CreateContactService({
      name: faker.person.fullName(),
      number: faker.string.numeric(13)
    });

    const newEmail = faker.internet.email();
    const updated = await UpdateContactService({
      contactId: String(contact.id),
      contactData: { email: newEmail }
    });

    expect(updated.email).toBe(newEmail);
  });

  it("should throw ERR_NO_CONTACT_FOUND for non-existing contact", async () => {
    await expect(
      UpdateContactService({
        contactId: String(faker.number.int({ min: 99000, max: 99999 })),
        contactData: { name: faker.person.fullName() }
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should throw ERR_NO_CONTACT_FOUND with correct message", async () => {
    try {
      await UpdateContactService({
        contactId: String(faker.number.int({ min: 99000, max: 99999 })),
        contactData: { name: faker.person.fullName() }
      });
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.message).toBe("ERR_NO_CONTACT_FOUND");
    }
  });
});
