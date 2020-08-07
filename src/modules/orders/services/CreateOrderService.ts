import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError(`This customer doesn't exists`);
    }

    const productsId = products.map(product => ({ id: product.id }));

    const existentProducts = await this.productsRepository.findAllById(
      productsId,
    );

    if (existentProducts.length !== products.length) {
      throw new AppError(`Some poducts in your list doesn't exists`);
    }

    const mappedProducts = products.map(product => {
      const productData = existentProducts.find(item => item.id === product.id);

      if ((productData?.quantity || 0) < product.quantity) {
        throw new AppError('Invalid quantity');
      }

      if (productData) productData.quantity -= product.quantity;

      return {
        product_id: product.id,
        price: productData?.price || 0,
        quantity: product?.quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: mappedProducts,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
