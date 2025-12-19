const request = require ("supertest")
const serverURL = "http://localhost:3000"
let tokenAdmin;

describe("POST - create Admin", () => {

    //Test : création d'un admin valide
    it("ça doit créer un nouvel admin", async() => {
        const res = await request(serverURL).post('/api/user/registerAdmin').send({
                email: "admin_test@gmail.com",
                firstName: "admin",
                lastName: "adminLastName",
                password: "123456789" 
            })

            expect(res.statusCode).toBe(201);
            expect(res.body.user.email).toBe("admin_test@gmail.com");
    })

    //Test : créer un admin avec un email qui existe déjà
    it("créer un admin avec un mail qui existe déjà", async () => {
        const res = await request(serverURL).post('/api/user/registerAdmin').send({
                email: "admin_test@gmail.com",
                firstName: "admin",
                lastName: "adminLastName",
                password: "123456789" 
            })

            expect(res.statusCode).toBe(409);
            expect(res.body.message).toBe("Email déjà utilisé");

    })

    //TEST : créer un admin avec un email invalide
    it("ça doit retourner un message d'erreur", async () => {
        const res = await request(serverURL).post('/api/user/registerAdmin').send({
                email: "admin_test",
                firstName: "admin",
                lastName: "adminLastName",
                password: "123456789" 
            })

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Email invalide");

    })

    //TEST : créer un admin avec un mdp < 6
    it("ça doit retourner un message d'erreur", async () => {
        const res = await request(serverURL).post('/api/user/registerAdmin').send({
                email: "admin_test@gmail.com",
                firstName: "admin",
                lastName: "adminLastName",
                password: "123" 
            })

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Le mot de passe doit contenir plus de 6 caractères");

    })
})

describe("POST - Login", () => {
    
    //TEST : Login admin valide
    it("ça doit retourner un message de succès avec les informations requises en cas de succès", async () => {
        const res = await request(serverURL)
            .post("/api/user/login")
            .send({
                email: "admin_test@gmail.com",
                password: "123456789" 
            })
            expect(res.statusCode).toBe(200);
            expect(res.body.token).toBeDefined();
            expect(res.body.role).toBe("ADMIN");

            tokenAdmin = res.body.token
    })

    //TEST : Login mot de passe invalide
    it("ça doit retourner une erreur en cas de faux mot de passe", async () => {
        const res = await request(serverURL)
            .post("/api/user/login")
            .send({
                email: "admin_test@gmail.com",
                password: "mdp invalide" 
            })
            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe("Mot de passe incorrect");
    })

    //TEST : Login avec email invalide
    it("ça doit retourner une erreur en cas d'utilisateur inexistant", async () => {
        const res = await request(serverURL)
            .post("/api/user/login")
            .send({
                email: "faux_admin_test@gmail.com",
                password: "mdp invalide" 
            })
            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("L'utilisateur n'existe pas");
    })

    //TEST : Login admin sans email
    it("ça doit retourner une erreur en cas de champ email vide", async () => {
        const res = await request(serverURL)
            .post("/api/user/login")
            .send({
                email: "",
                password: "mdp invalide" 
            })
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Tous les champs sont requis");
    })

        //TEST : Login admin sans mot de passe
    it("ça doit retourner une erreur en cas de champ mdp vide", async () => {
        const res = await request(serverURL)
            .post("/api/user/login")
            .send({
                email: "admin_test@gmail.com",
                password: "" 
            })
            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe("Tous les champs sont requis");
    })
})

describe("DELETE - delete User", () => {
    //Test : Supprimer un admin
    it("ça doit supprimer un admin", async() => {
        const res = await request(serverURL)
            .delete('/api/user/delete')
            .set("Authorization",`Bearer ${tokenAdmin}`)

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe("Utilisateur supprimé avec succès");
    })

    //TEST : Suppression sans token
    it("ça doit retourner un message d'erreur en cas de suppression sans token", async() => {
        const res = await request(serverURL)
            .delete('/api/user/delete')

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toBe("Token manquant ou invalide");
    })

    //Test : Supprimer d'un utilisateur qui n'existe pas
    it("ça doit retourner un message d'erreur en cas d'user not found", async() => {
        const res = await request(serverURL)
            .delete('/api/user/delete')
            .set("Authorization",`Bearer ${tokenAdmin}`)

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Utilisateur non trouvé");
    })
    
})