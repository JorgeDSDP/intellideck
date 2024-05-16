import express from "express";
import {router as UserRouter} from "./routes/user.routes.ts";
import {router as DeckRouter} from "./routes/deck.routes.ts";
import {router as TopicRouter} from "./routes/topic.routes.ts";
import {router as TagRouter} from "./routes/tag.routes.ts";
import {router as CardRouter} from "./routes/card.routes.ts";

export const app = express();
app.use(express.json());
app.disable("x-powered-by");
app.use(express.urlencoded({extended: false}));
app.use('/api', UserRouter);
app.use('/api', DeckRouter);
app.use('/api', TopicRouter);
app.use('/api', TagRouter);
app.use('/api', CardRouter);