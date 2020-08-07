import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';

import Order from '@modules/orders/infra/typeorm/entities/Order';
import Product from '@modules/products/infra/typeorm/entities/Product';

@Entity('orders_products')
class OrdersProducts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @JoinColumn({ name: 'order_id' })
  @ManyToOne(() => Order, order => order.order_products)
  order: Order;

  @JoinColumn({ name: 'product_id' })
  @ManyToOne(() => Order, order => order.order_products)
  product: Product;

  @Column()
  product_id: string;

  @Column()
  order_id: string;

  @Column()
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default OrdersProducts;
