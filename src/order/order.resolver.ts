import { HttpException, HttpStatus, UseGuards } from "@nestjs/common";
import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Role } from "@prisma/client";
import { Roles } from "src/common/decorators/role.decorator";
import { GqlAuthGuard } from "src/common/guards/auth.guard";
import { RolesGuard } from "src/common/guards/role.guard";
import { CreateOrderInput } from "./dto/create-order.input";
import { CreateOrderOutput } from "./dto/create-order.output";
import { GetOrdersFilter } from "./dto/filter-orders.input";
import { GetOrdersOutput } from "./dto/get-orders.output";
import { Order } from "./entities/order.entity";
import { OrderService } from "./order.service";

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(() => CreateOrderOutput)
  async createOrder(
    @Args("createOrderInput") createOrderInput: CreateOrderInput,
  ) {
    const order = await this.orderService.create(createOrderInput);

    return {
      data: {
        id: order.id,
        totalPayableAmount: order.totalPayableAmount,
        status: order.status,
        paymentId: order.paymentId,
        orderType: order.type,
      },
    };
  }

  @Query(() => GetOrdersOutput, { name: "orders" })
  async findAll(
    @Args("limit", { type: () => Int }) limit: number,
    @Args("page", { type: () => Int }) page: number,
    @Args("filter", { type: () => GetOrdersFilter, nullable: true })
    filter: GetOrdersFilter,
  ) {
    const { orders, totalOrders } = await this.orderService.findAll({
      limit,
      page,
      filter,
    });

    return {
      pagination: {
        limit,
        page,
        total: totalOrders,
      },
      data: orders,
    };
  }

  @Query(() => Order, { name: "order" })
  async findOne(
    @Args("id", { type: () => String }) id: string,
  ): Promise<Order> {
    const order = await this.orderService.findOne(id);
    if (!order)
      throw new HttpException("order not found", HttpStatus.NOT_FOUND);
    return {
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentId: order.payment?.[0]?.id,
      customerEmail: order.customerEmail,
      orderItems: order.orderItems,
      paymentStatus: order.payment?.[0]?.status,
    };
  }

  @Roles(Role.USER)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Query(() => GetOrdersOutput, { name: "myOrders" })
  async findMyOrders(
    @Args("limit", { type: () => Int }) limit: number,
    @Args("page", { type: () => Int }) page: number,
    @Context() context: any,
  ) {
    const user = context.req.user;
    const email = user.email;
    const { orders, totalOrders } = await this.orderService.findMyOrders({
      limit,
      page,
      customerEmail: email,
    });
    return {
      pagination: {
        limit,
        page,
        total: totalOrders,
      },
      data: orders,
    };
  }

  @Mutation(() => String)
  async createToken(
    @Args("email", { type: () => String }) customerEmail: string,
  ) {
    const link = await this.orderService.createAndSendCustomerTokenViaEmail({
      customerEmail,
    });
    return link;
  }

  @Roles(Role.USER)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Mutation(() => Order, { name: "cancelOrder" })
  cancelOrder(
    @Args("id", { type: () => String }) id: string,
    @Context() context: any,
    @Args("reason", { type: () => String! }) reason?: string,
  ) {
    const user = context.req.user;
    const email = user.email;
    return this.orderService.cancelOrder(id, email, reason);
  }

  @Roles(Role.SELLER)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Mutation(() => Order, { name: "completeOrder" })
  competeOrder(@Args("id", { type: () => String }) id: string) {
    return this.orderService.completeOrder(id);
  }

  @Roles(Role.SELLER)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Mutation(() => String)
  async deleteOrder(@Args("id", { type: () => String }) id: string) {
    await this.orderService.deleteOrder(id);
    return `deleted order ${id} successfully`;
  }
}
