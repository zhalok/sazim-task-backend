import { Field, Float, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Product {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Float)
  price: number;

  @Field(() => Int)
  stock: number;

  @Field(() => [String], { defaultValue: [] })
  categories: string[];
}
