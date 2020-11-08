import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from 'type-graphql';
import { UserResolver } from "./resolvers/UserResolver";
import express from "express";
import { User } from "./entities/User";
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from "connect-redis";
import { COOKIE_NAME, __prod__ } from "./constants";
import cors from "cors";


const main = async() => {
  //sendEmail('hafizan.utm@gmail.com', 'hey');

  const conn = await createConnection({
    type: 'postgres',
    database: 'proto',
    username: 'postgres',
    password: 'postgres',
    logging: true,
    synchronize: true,
    entities: [User]
  })


  const app = express();

  const RedisStore = connectRedis(session)
  const redis = new Redis()


  app.use(
    cors({
      origin: "https://localhost:3000",
      credentials: true

    })
  )

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ 
        client: redis,
        disableTouch: true,

       }),
       cookie: {
         maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
         httpOnly: true,
         sameSite: 'lax',
         secure: __prod__
       },
      saveUninitialized: false,
      secret: 'qwertyuiop',
      resave: false,
    })
  )
  
  const apolloServer = new ApolloServer({ 
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
    context: ({req , res}) => ({req, res, redis}),
   })

  apolloServer.applyMiddleware({
    app,
    cors: { origin: "https://localhost:3000"},
  });
  
  app.listen(4000, () => {
    console.log("Server has started!")
  })
  

  
}

main()