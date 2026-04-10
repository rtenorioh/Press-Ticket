import { faker } from "@faker-js/faker";
import AppError from "../../../errors/AppError";
import Contact from "../../../models/Contact";
import CreateContactService from "../../../services/ContactServices/CreateContactService";
import { disconnect, truncate } from "../../utils/database";

describe("Contact", () => {
  beforeEach(async () => {
    await truncate();
  });

  afterEach(async () => {
    await truncate();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("should be able to create a new contact", async () => {
    const contact = await CreateContactService({
      name: faker.person.fullName(),
      number: faker.string.numeric(13)
    });

    expect(contact).toHaveProperty("id");
    expect(contact).toBeInstanceOf(Contact);
  });

  it("should store the correct name and number", async () => {
    const name = faker.person.fullName();
    const number = faker.string.numeric(13);

    const contact = await CreateContactService({ name, number });

    expect(contact.name).toBe(name);
    expect(contact.number).toBe(number);
  });

  it("should not be able to create a contact with duplicated number", async () => {
    const number = faker.string.numeric(13);

    await CreateContactService({
      name: faker.person.fullName(),
      number
    });

    await expect(
      CreateContactService({
        name: faker.person.fullName(),
        number
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should throw ERR_DUPLICATED_CONTACT for duplicate numbers", async () => {
    const number = faker.string.numeric(13);

    await CreateContactService({
      name: faker.person.fullName(),
      number
    });

    try {
      await CreateContactService({
        name: faker.person.fullName(),
        number
      });
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.message).toBe("ERR_DUPLICATED_CONTACT");
    }
  });

  it("should be able to create a contact with optional fields", async () => {
    const contact = await CreateContactService({
      name: faker.person.fullName(),
      number: faker.string.numeric(13),
      email: faker.internet.email(),
      address: faker.location.streetAddress()
    });

    expect(contact).toHaveProperty("id");
    expect(contact.email).toBeDefined();
  });
});
