import { RouteHandler } from 'fastify'
import { AnimationDb } from '../db'
import { awaitAll } from '../services';

export const get: RouteHandler = async (req, res) => {
    const db = new AnimationDb();
    const all = await awaitAll(db.all());
    res.send(all);
}

export const post: RouteHandler = (req, res) => {

}