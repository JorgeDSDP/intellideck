import supertest from "supertest";
import {expect, describe, it, jest} from '@jest/globals';
import {app} from "../../src/app.ts";
import {User} from "../../src/models/user.ts";
import {Middleware} from "../../src/middleware.ts";

jest.useFakeTimers();
const middleware = new Middleware();

const userPayload = {
    username: "Test",
    role: "USER"
}

describe("User", () => {
    describe("GET User by ID Method", () => {
        describe("User logged", () => {
            describe("Given user ID not existing", () => {
                it("should return a 404", async () => {
                    const userID = 'none';
                    await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/${userID}`)
                            .set({"Authorization": token}).then(response => {
                                expect(response.status).toEqual(404);
                            });
                    });
                });
            });

            describe("Given valid user ID", () => {
                it("should return a 200 and the user", async () => {
                    const userID = '66326642b6e5d026db70f695';
                    const responsePayload = {
                        _id: userID,
                        name: "Test",
                        username: "TestTesty",
                        email: "test@test.com",
                        password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                        role: "USER"
                    };
                    const createUserMock = jest.spyOn(User, "findById")
                        .mockResolvedValueOnce(responsePayload);
                    await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/${userID}`)
                            .set({"Authorization": token}).then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.objectContaining(responsePayload));
                            });
                    });
                });
            })
        });
        describe("User not logged", () => {
            describe("Given valid user ID and not sending token", () => {
                it("should return a 400 bad request", async () => {
                    const userID = '66326642b6e5d026db70f695';
                    await supertest(app).get(`/api/users/${userID}`)
                        .then(response => {
                            expect(response.status).toEqual(400);
                        });
                });
            });

            describe("Given valid user ID and sending invalid token", () => {
                it("should return a 401 unauthorized", async () => {
                    const userID = '66326642b6e5d026db70f695';
                    const invalidToken = "Bearer none"
                    await supertest(app).get(`/api/users/${userID}`)
                        .set({"Authorization": invalidToken})
                        .then(response => {
                            expect(response.status).toEqual(401);
                        });
                });
            })
        });
    })

    describe("GET Users Followed Method", () => {
        describe("User logged", () => {
            describe("Given users followed", () => {
                it("should return a 200 and the users", async () => {
                    const userID = '66326642b6e5d026db70f695';
                    const responsePayload = {
                        _id: userID,
                        name: "Test",
                        username: "TestTesty",
                        email: "test@test.com",
                        password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                        role: "USER"
                    };
                    const createUserMock = jest.spyOn(User, "find")
                        .mockResolvedValueOnce([responsePayload]);
                    await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/followed`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                            });
                    });
                });
            });

            describe("Given no users followed", () => {
                it("should return a 204", async () => {
                    const createUserMock = jest.spyOn(User, "find")
                        .mockResolvedValueOnce([]);
                    await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/followed`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(204);
                            });
                    });
                });
            });
        });
    })

    describe("GET Followers Method", () => {
        describe("User logged", () => {
            describe("Given followers exist", () => {
                it("should return a 200 and the users", async () => {
                    const userID = '66326642b6e5d026db70f695';
                    const responsePayload = {
                        _id: userID,
                        name: "Test",
                        username: "TestTesty",
                        email: "test@test.com",
                        password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                        role: "USER"
                    };
                    const createUserMock = jest.spyOn(User, "find")
                        .mockResolvedValueOnce([responsePayload]);
                    await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/followers/FollowedTestedUser`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(200);
                                expect(response.body).toMatchObject(expect.arrayContaining([expect.objectContaining(responsePayload)]));
                            });
                    });
                });
            });

            describe("Given no users exist", () => {
                it("should return a 204", async () => {
                    const createUserMock = jest.spyOn(User, "find")
                        .mockResolvedValueOnce([]);
                    await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                        await supertest(app).get(`/api/users/followers/FollowedTestedUser`).set({"Authorization": token})
                            .then(response => {
                                expect(response.status).toEqual(204);
                            });
                    });
                });
            });
        });
    })

    describe("POST User Method", () => {
        describe("Given user data is valid", () => {
            it("should return a 201 and the created object", async () => {
                const responsePayload = {
                    _id: "66326642b6e5d026db70f695",
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                    role: "USER"
                };
                const createUserMock = jest.spyOn(User, "create")
                    .mockReturnValueOnce(new Promise<any>((resolve: any, reject: any) => {
                        resolve(responsePayload);
                    }));

                await supertest(app).post(`/api/users/`).send({
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "12345678",
                    role: "USER"
                }).set({Accept: 'application/json', 'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(201);
                        expect(response.body).toMatchObject(expect.objectContaining({
                            _id: expect.any(String),
                            name: "Test",
                            username: "TestTesty",
                            email: "test@test.com",
                            password: expect.stringMatching(/^[$]2a[$]10[$].*$/),
                            role: "USER"
                        }));
                    });
            });
        });

        describe("Given user data is duplicated", () => {
            it("should return a 409", async () => {
                const createUserMock = jest.spyOn(User, "create")
                    .mockRejectedValueOnce(new Error());

                await supertest(app).post(`/api/users/`).send({
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "12345678",
                    role: "USER"
                }).set({Accept: 'application/json', 'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(409);
                    });
            });
        });
    });

    describe("POST Login Method", () => {
        describe("Given login data is valid", () => {
            it("should return a 200 and a jwt token", async () => {
                const responsePayload = {
                    _id: "66326642b6e5d026db70f695",
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "$2a$10$Xu39yMLoJEH/2bEkNRUFseMaICGmGMbTjJzlJttvEfW9cjjI.yOuW",
                    role: "USER"
                };
                const createUserMock = jest.spyOn(User, "findOne")
                    .mockResolvedValueOnce(responsePayload);

                await supertest(app).post(`/api/login/`).send({
                    username: "TestTesty",
                    password: "12345678"
                }).set({'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(200);
                        expect(response.body).toMatch(new RegExp(/^Bearer .*$/));
                    });
            });
        });

        describe("Given login data is invalid", () => {
            it("should return a 401", async () => {
                const responsePayload = {
                    _id: "66326642b6e5d026db70f695",
                    name: "Test",
                    username: "TestTesty",
                    email: "test@test.com",
                    password: "notASaltedPassword",
                    role: "USER"
                };
                const createUserMock = jest.spyOn(User, "findOne")
                    .mockResolvedValueOnce(responsePayload);

                await supertest(app).post(`/api/login/`).send({
                    username: "TestTesty",
                    password: "12345678"
                }).set({'Content-type': 'application/json'})
                    .then(response => {
                        expect(response.status).toEqual(401);
                    });
            });
        });
    });

    describe("PUT Follow Method", () => {
        describe("Given user is not followed", () => {
            describe("Given user is logged", () => {
                describe("Given user to follow exists", () => {
                    it("should return a 200 and the logged user following the user to follow", async () => {
                        const userID = '66326642b6e5d026db70f695';
                        const toFollowUsername = 'TestTestyToFollow';
                        const userToFollowPayload = {
                            _id: userID,
                            name: "TestToFollow",
                            username: toFollowUsername,
                            email: "test@tofollow.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                        };
                        const userPayload = {
                            _id: userID,
                            name: "Test",
                            username: "TestTesty",
                            email: "test@test.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                            followedUsers: [userToFollowPayload]
                        };
                        const userMock = jest.spyOn(User, "findOne")
                            .mockResolvedValueOnce(userToFollowPayload);
                        const user2Mock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(userPayload);
                        await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/follow`).send({
                                username: toFollowUsername
                            }).set({"Authorization": token, 'Content-type': 'application/json'})
                                .then(response => {
                                    expect(response.status).toEqual(200);
                                    expect(response.body).toMatchObject(expect.objectContaining(userPayload));
                                    expect(response.body.followedUsers.length).toBeGreaterThan(0);
                                    expect(response.body.followedUsers).toContainEqual(userToFollowPayload);
                                });
                        });
                    });
                });
            });

            describe("Given user is not logged", () => {
                it("should return a 401 unauthorized", async () => {
                    const toFollowUsername = 'TestTestyToFollow';
                    const invalidToken = "Bearer none"
                    await supertest(app).put(`/api/users/follow`).send({
                        username: toFollowUsername
                    }).set({"Authorization": invalidToken, 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(401);
                        });
                });
            });
        });

        describe("Given user is followed", () => {
            describe("Given user is logged", () => {
                describe("Given user to follow exists", () => {
                    it("should return a 400 bad request", async () => {
                        const userID = '66326642b6e5d026db70f695';
                        const toFollowUsername = 'TestTestyToFollow';
                        const userToFollowPayload = {
                            _id: userID,
                            name: "TestToFollow",
                            username: toFollowUsername,
                            email: "test@tofollow.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                        };
                        const userMock = jest.spyOn(User, "findOne")
                            .mockResolvedValueOnce(userToFollowPayload);
                        const user2Mock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(null);
                        await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/follow`).send({
                                username: toFollowUsername
                            }).set({"Authorization": token, 'Content-type': 'application/json'})
                                .then(response => {
                                    expect(response.status).toEqual(400);
                                });
                        });
                    });
                });
            });
        });
    });

    describe("PUT Unfollow Method", () => {
        describe("Given user is followed", () => {
            describe("Given user is logged", () => {
                describe("Given user to unfollow exists", () => {
                    it("should return a 200 and the logged user without the user to unfollow", async () => {
                        const userID = '66326642b6e5d026db70f695';
                        const toUnfollowUsername = 'TestTestyToFollow';
                        const userToUnfollowPayload = {
                            _id: userID,
                            name: "TestToUnfollow",
                            username: toUnfollowUsername,
                            email: "test@tounfollow.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                        };
                        const userPayload = {
                            _id: userID,
                            name: "Test",
                            username: "TestTesty",
                            email: "test@test.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                            followedUsers: []
                        };
                        const userMock = jest.spyOn(User, "findOne")
                            .mockResolvedValueOnce(userToUnfollowPayload);
                        const user2Mock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(userPayload);
                        await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/unfollow`).send({
                                username: toUnfollowUsername
                            }).set({"Authorization": token, 'Content-type': 'application/json'})
                                .then(response => {
                                    expect(response.status).toEqual(200);
                                    expect(response.body).toMatchObject(expect.objectContaining(userPayload));
                                    expect(response.body.followedUsers.length).toEqual(0);
                                });
                        });
                    });
                });
            });

            describe("Given user is not logged", () => {
                it("should return a 401 unauthorized", async () => {
                    const toUnfollowUsername = 'TestTestyToUnfollow';
                    const invalidToken = "Bearer none"
                    await supertest(app).put(`/api/users/unfollow`).send({
                        username: toUnfollowUsername
                    }).set({"Authorization": invalidToken, 'Content-type': 'application/json'})
                        .then(response => {
                            expect(response.status).toEqual(401);
                        });
                });
            });
        });

        describe("Given user is not followed", () => {
            describe("Given user is logged", () => {
                describe("Given user to unfollow exists", () => {
                    it("should return a 400 bad request", async () => {
                        const userID = '66326642b6e5d026db70f695';
                        const toUnfollowUsername = 'TestTestyToUnfollow';
                        const userToUnfollowPayload = {
                            _id: userID,
                            name: "TestToFollow",
                            username: toUnfollowUsername,
                            email: "test@tounfollow.com",
                            password: "$2a$10$lJaCyNyy.zpnDOTO9Gb2YOx6YO8EuBow3nTEVmn3vl58Ns46665Hi",
                            role: "USER",
                        };
                        const userMock = jest.spyOn(User, "findOne")
                            .mockResolvedValueOnce(userToUnfollowPayload);
                        const user2Mock = jest.spyOn(User, "findOneAndUpdate")
                            .mockResolvedValueOnce(null);
                        await middleware.generateToken(userPayload.username, userPayload.role).then(async (token: any) => {
                            await supertest(app).put(`/api/users/unfollow`).send({
                                username: toUnfollowUsername
                            }).set({"Authorization": token, 'Content-type': 'application/json'})
                                .then(response => {
                                    expect(response.status).toEqual(400);
                                });
                        });
                    });
                });
            });
        });
    });
})