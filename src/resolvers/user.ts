import { MyContext } from "src/types";
import { Resolver, Ctx, Arg, Mutation, InputType, Field } from "type-graphql";
import { User } from "src/entities/User";

@InputType()
class UsernamePassordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@Resolver()
export class PostResolver {
  @Mutation(() => String)
  async register(
    @Arg("options") options: UsernamePassordInput,
    @Ctx() { em }: MyContext
  ) {
    const user = em.create(User, { username: options.username });
    await em.persistAndFlush(user);

    return "bye";
  }
}
