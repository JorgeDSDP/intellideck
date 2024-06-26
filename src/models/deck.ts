import { Schema, model } from 'mongoose';
import {IUser} from "./user.ts";
import {ITopic} from "./topic.ts";
import {ITag} from "./tag.js";

export const DECK_DOCUMENT_NAME = 'deck';
export const DECK_COLLECTION_NAME = 'decks';
export interface IDeck {
    title : string;
    description : string;
    image : string;
    isPublished : boolean;
    avgDeckRating: number;
    publishDate: Date;
    creator? : IUser;
    topic : ITopic;
    tags: ITag[];
}

export const deckSchema = new Schema<IDeck>({
    title: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String },
    image: { type: Schema.Types.String },
    isPublished: { type: Schema.Types.Boolean, required: true },
    avgDeckRating: { type: Schema.Types.Number, min: 0, max: 10, default: 0, validate : {
            validator : Number.isInteger,
            message   : '{VALUE} is not an integer value'
        } },
    publishDate: {type: Schema.Types.Date},
    creator: { type: Schema.Types.ObjectId, ref: 'user' },
    topic: { type: Schema.Types.ObjectId, ref: 'topic' },
    tags: [{ type: Schema.Types.ObjectId, ref: 'tag' }]
});

export const Deck = model<IDeck>(DECK_DOCUMENT_NAME, deckSchema, DECK_COLLECTION_NAME);