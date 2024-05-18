import express from 'express';
import {Middleware} from "../middleware.ts";
import {DeckController} from "../controllers/deck.controller.ts";
import {DeckTrainingController} from "../controllers/deck.training.controller.ts";
import {CardTrainingController} from "../controllers/card.training.controller.ts";

const router = express.Router();
const cardTrainingController = new CardTrainingController();
const deckController = new DeckController();
const deckTrainingController = new DeckTrainingController();
const middleware: Middleware = new Middleware();

router.put('/decks/:id/deckTraining/card/:cardId/show',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckTrainingController.getDeckTraining(req, res, next);
}, (req: any, res: any) => {
    return cardTrainingController.showHideCardTraining(req, res, true);
})

router.put('/decks/:id/deckTraining/card/:cardId/hide',(req: any, res: any, next: any) => {
    return middleware.isAuthenticated(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckController.verifyPublished(req, res, next);
}, (req: any, res: any, next: any) => {
    return deckTrainingController.getDeckTraining(req, res, next);
}, (req: any, res: any) => {
    return cardTrainingController.showHideCardTraining(req, res, false);
})

export{ router };