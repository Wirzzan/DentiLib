const request = require ("supertest")
const serverURL = "http://localhost:3000"

describe("POST - create User", () => {

    //Test : création d'un dentiste valide
    it("ça doit créer un nouveau dentiste", async() => {
        const res = await request(serverURL).post('/admin/user/createAccount').send({
                firstName: "dentiste1",
                lastName: "adminLastName",
                email: "dentiste1@test.com",
                password: "123456789",
                role: "DENTISTE",
                siret: "12345678900011"
            })

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Le dentiste a été créé');
            expect(res.body.user.role).toBe("DENTISTE");
    })

    //Test : création d'un prothésiste valide associé à un dentiste
    it("ça doit créer un nouveau prothésiste", async() => {
        const dentisteRes = await request(serverURL).post('/admin/user/createAccount').send({
            firstName: "dentiste2",
            lastName: "Dent",
            email: "dentiste2@test.fr",
            password: "password123",
            role: "DENTISTE"
    });
    const dentisteId = dentisteRes.body.user._id; // nouveau dentiste pour chopper l'id

    const res = await request(serverURL).post("/admin/user/createAccount").send({
      firstName: "proto1",
      lastName: "Proto",
      email: "proto1@test.fr",
      password: "password123",
      role: "PROTHESISTE",
      dentisteId
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Prothesiste created and linked to dentiste");
    expect(res.body.prothesiste.role).toBe("PROTHESISTE");
    expect(res.body.prothesiste.associatedUser).toBe(dentisteId);
    });

    //Test : Créer prothésiste sans dentisteId
    it("doit refuser la création d’un prothésiste sans dentisteId", async () => {
    const res = await request(serverURL).post("/admin/user/createAccount").send({
        firstName: "proto2",
        lastName: "Proto",
        email: "proto2@test.fr",
        password: "password123",
        role: "PROTHESISTE"
        });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("dentisteId is required for prothesiste");
    });

    //Test : Créer un prothésiste avec mauvais dentisteId
    it("doit refuser un dentisteId inexistant", async () => {
    const res = await request(serverURL).post("/admin/user/createAccount").send({
        firstName: "proto3",
        lastName: "Proto",
        email: "proto3@test.fr",
        password: "password123",
        role: "PROTHESISTE",
        dentisteId: "64b000000000000000000000"
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Dentiste not found");
    });

    //Test : Créer un prothésiste avec un dentisteId qui n'est pas un dentiste
    it("doit refuser si dentisteId ne correspond pas à un DENTISTE", async () => {
    // créer un admin
        const adminRes = await request(serverURL).post("/api/user/registerAdmin").send({
            firstName: "Admin",
            lastName: "Test",
            email: "adminProto@test.fr",
            password: "password123",
            role: "ADMIN"
        });
        const adminId = adminRes.body.user._id;

        const res = await request(serverURL).post("/admin/user/createAccount").send({
        firstName: "proto4",
        lastName: "Error",
        email: "proto4@test.fr",
        password: "password123",
        role: "PROTHESISTE",
        dentisteId: adminId
        });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Dentiste not found");
    });

    //Test 
    it("doit refuser la création avec un rôle invalide", async () => {
        const res = await request(serverURL).post("/admin/user/createAccount").send({
            firstName: "Bad",
            lastName: "Role",
            email: "badrole@test.fr",
            password: "password123",
            role: "PATIENT"
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Invalid role");
    });

    //Test

})
