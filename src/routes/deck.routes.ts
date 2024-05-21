import express from 'express';
import {Middleware} from "../middleware.ts";
import {DeckController} from "../controllers/deck.controller.ts";
import {UserController} from "../controllers/user.controller.ts";
import {TagController} from "../controllers/tag.controller.ts";
import {TopicController} from "../controllers/topic.controller.ts";
import {CardController} from "../controllers/card.controller.ts";
import {DeckTrainingController} from "../controllers/deck.training.controller.ts";
import {CardTrainingController} from "../controllers/card.training.controller.ts";

const router = express.Router();
const deckController = new DeckController();
const userController = new UserController();
const tagController = new TagController();
const topicController = new TopicController();
const cardController = new CardController();
const deckTrainingController = new DeckTrainingController();
const cardTrainingController = new CardTrainingController();
const middleware: Middleware = new Middleware();

router.post('/decks',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return deckController.postDeck(req, res);
})

router.get('/decks/today',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckTrainingController.getDeckTrainingsOfUser(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardTrainingController.getCardTrainingsForToday(req, res, next);
}, (req: any, res: any) => {
    return deckController.getDecksForToday(req, res);
})

router.get('/decks/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return deckController.getUserDecks(req, res);
})

router.put('/decks/follow',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
},(req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.putFollowDeck(req, res, next);
}, (req: any, res: any) => {
    return userController.validateFollowUnfollow(req, res);
})

router.put('/decks/unfollow',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
},(req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return userController.putUnfollowDeck(req, res, next);
}, (req: any, res: any) => {
    return userController.validateFollowUnfollow(req, res);
})

router.get('/decks/followed/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any) => {
    return userController.getDecksFollowed(req, res);
})

router.put('/decks/:id',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyCreator(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyUnpublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return topicController.validateTopic(req, res, next);
}, (req: any, res: any, next: any) => {
    return tagController.validateTags(req, res, next);
}, (req: any, res: any) => {
    return deckController.updateDeck(req, res);
})

router.put('/decks/:id/publish',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyCreator(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyUnpublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return cardController.getCardsOfDeck(req, res, next);
}, (req: any, res: any) => {
    return deckController.publishDeck(req, res);
})

export{ router };