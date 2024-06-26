import {CardTraining} from "../models/card.training.ts";
import {StatusCodes} from "http-status-codes";
import sanitize from "mongo-sanitize";

export class CardTrainingController {
    private MILLISECONDS_PER_DAY: number = 86400000;

    async getCardTrainingsOfDeckTraining(req: any, res: any, next: any) {
        CardTraining.find({
            deckTraining: req.deckTraining._id
        }).populate('card').populate('deckTraining').exec()
            .then((data: any) => {
            req.cards = data;
            next();
        }).catch((e: any) => {
            next(e);
        });
    }

    async getCardTrainingsForToday(req: any, res: any, next: any) {
        let today = new Date();
        let day = (today.getDate() < 10) ? "0" + today.getDate() : today.getDate();
        let month = (today.getMonth() + 1 < 10) ? "0" + (today.getMonth() + 1) : today.getMonth() + 1;
        let lowerDate = new Date(today.getFullYear() + "-" + month + "-" + day);
        let deckTrainingIds = (!req.deckTrainings) ? [] : req.deckTrainings.map((dt: any) => dt._id);
        deckTrainingIds.push((!req.deckTraining) ? undefined : req.deckTraining._id);

        CardTraining.find({
            deckTraining: {$in: deckTrainingIds},
            nextTraining: {"$lte": new Date(lowerDate.getTime() + this.MILLISECONDS_PER_DAY - 1)}
        }).populate('card').populate('deckTraining').exec()
            .then((data: any) => {
            req.cards = data;
            next();
        }).catch((e: any) => {
            next(e);
        });
    }

    async verifyCardTrainings(req: any, res: any) {
        if (req.cards.length == 0) {
            res.status(StatusCodes.NO_CONTENT).json();
        } else {
            res.status(StatusCodes.OK).json(req.cards);
        }
    }

    async postCardTraining(req: any, card: any) {
        let isShown: boolean;
        let i = (!req.body.cards) ? -1 : req.body.cards.findIndex((bodyCard: any) => bodyCard.id == card._id);
        if (i > -1) {
            isShown = req.body.cards[i].isShown;
        } else isShown = true;
        let cardTraining = new CardTraining({
            deckTraining: req.deckTraining._id,
            card: card._id,
            nextTraining: new Date(),
            isShown: sanitize(isShown),
            box: 1
        });

        return CardTraining.create(cardTraining);
    }

    async postCardTrainings(req: any, res: any, next: any) {
        let allPromises = req.cards.map((card: any) => {
            return this.postCardTraining(req, card);
        });
        Promise.all(allPromises).then(() => {
            res.status(StatusCodes.CREATED).json(req.deckTraining);
        }).catch((e: any) => {
            next(e);
        });
    }

    async deleteCardTrainingsDeckDeletion(req: any, res: any, next: any) {
        let deckTrainingIds = (!req.deckTrainings) ? [] : req.deckTrainings.map((dt: any) => dt._id);
        CardTraining.deleteMany({deckTraining: {$in: deckTrainingIds}})
            .then(() => {
                res.status(StatusCodes.NO_CONTENT).json();
            })
            .catch((e: any) => {
                next(e);
            });
    }

    async deleteCardTrainings(req: any, res: any, next: any) {
        let allPromises = req.cards.map((card: any) => {
            return this.deleteCardTraining(req, card);
        });
        Promise.all(allPromises).then(() => {
            res.status(StatusCodes.NO_CONTENT).json();
        }).catch((e: any) => {
            next(e);
        });
    }

    async deleteCardTraining(req: any, card: any) {
        return CardTraining.findOneAndDelete({
            deckTraining: req.deckTraining._id,
            card: card._id
        });
    }

    async putCardTrainings(req: any, res: any, next: any) {
        let allPromises = req.cards.map((card: any) => {
            return this.putCardTraining(req, card);
        });
        Promise.all(allPromises).then(() => {
            res.status(StatusCodes.OK).json(req.deckTraining);
        }).catch((e: any) => {
            next(e);
        });
    }

    async putCardTraining(req: any, card: any) {
        let putCard: any = req.body.cards?.find((bodyCard: any) => bodyCard.id == card.card._id);
        let box;
        if (!putCard && req.body.resetDate != "true")
            return;
        else if(!putCard && (req.body.resetDate == "true"))
        {
            box = 1;
        } else {
            box = putCard.box;
        }

        box = (box > req.deckTraining.boxAmount)? -1 : box;
        let nextTraining = (req.body.resetDate == "true")? new Date(): this.calculateNextSession(sanitize(box))
        return CardTraining.findOneAndUpdate({
                deckTraining: req.deckTraining._id,
                card: card.card._id
            }, {
                box: sanitize(box),
                nextTraining: nextTraining
            },
            {returnOriginal: false, runValidators: true, omitUndefined: true});
    }

    async showHideCardTraining(req: any, res: any, next: any, isShown: any) {
        CardTraining.findOneAndUpdate({
                deckTraining: req.deckTraining._id,
                card: req.params.cardId
            }, {
                isShown: isShown
            },
            {returnOriginal: false, runValidators: true, omitUndefined: true})
            .then((data: any) => {
                if (!data) {
                    res.status(StatusCodes.NOT_FOUND).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                next(e);
            })
    }

    calculateNextSession(box: number) {
        const dateToday = new Date();
        return new Date(dateToday.getTime() + this.MILLISECONDS_PER_DAY * this.fibonacciSequencePosition(box));
    }

    fibonacciSequencePosition(position: number): any {
        let i;
        let fib = [1, 2];

        for (i = 2; i < position; i++) {
            fib[i] = fib[i - 2] + fib[i - 1];
        }
        return (position == 1) ? 1 : fib.at(-1);
    }
}