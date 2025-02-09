import { Injectable } from '@nestjs/common';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { OrderRepository } from './order.repository';
import { GetOrdersFilter } from './dto/filter-orders.input';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}
  async create(createOrderInput: CreateOrderInput) {
    //sending dummy customer id for now
    const order = await this.orderRepository.createOrder(createOrderInput);
    return order;
  }

  async findAll({
    page,
    limit,
    filter,
  }: {
    page: number;
    limit: number;
    filter?: GetOrdersFilter;
  }) {
    return this.orderRepository.getAllOrders({ page, limit, filter });
  }

  async findOne(id: string) {
    return this.orderRepository.getOrder(id);
  }

  async findMyOrders({
    page,
    limit,
    customerEmail,
  }: {
    page: number;
    limit: number;
    customerEmail: string;
  }) {
    const { orders, totalOrders } = await this.orderRepository.getAllOrders({
      limit: limit,
      page: page,
      filter: {
        customerEmail,
      },
    });
    return { orders, totalOrders };
  }

  update(id: number, updateOrderInput: UpdateOrderInput) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
