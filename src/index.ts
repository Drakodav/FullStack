import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express";
import chalk from "chalk";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post.resolver";
import { UserResolver } from "./resolvers/user.resolver";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  // const post = orm.em.create(Post, {
  //   title: "my first post",
  // });
  // // instert now
  // await orm.em.persistAndFlush(post);

  // queries all posts
  // const posts = await orm.em.find(Post, {});
  // console.log(posts);

  const app = express();

  // this order is important
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    session({
      name: "c_id",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: "lax", //csrf
        secure: __prod__, // cookie only works in https
      },
      secret: "lkasjdhfauwefoahbrogif",
      resave: false,
      saveUninitialized: false,
    })
  );

  // create graphql endpoint on our app localhost:3000/graphql
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  });
  apolloServer.applyMiddleware({ app });

  app.get("/", (_, res) => {
    res.send("vlad says hello");
  });

  // listen on  localhost:3000
  app.listen(3000, () => {
    console.log(
      "server started on " + chalk.underline("http://localhost:3000")
    );
  });
};

main().catch((err) => {
  console.error(err);
});
