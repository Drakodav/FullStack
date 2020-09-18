import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express";
import chalk from "chalk";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

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

  // create graphql endpoint on our app localhost:3000/graphql
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
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
