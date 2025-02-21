import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { Product } from "src/product/entities/product.entity";

@ObjectType()
export class OrderItem {
  @Field(() => String)
  productId: String;
  @Field(() => Int)
  quantity: number;
  @Field(() => Product)
  product: Product;
}

@ObjectType()
export class Order {
  @Field(() => String)
  id: string;

  @Field(() => [OrderItem])
  orderItems: OrderItem[];

  @Field(() => String)
  customerEmail: string;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  paymentId: string;

  @Field(() => String, { nullable: true })
  paymentStatus: string;
}
