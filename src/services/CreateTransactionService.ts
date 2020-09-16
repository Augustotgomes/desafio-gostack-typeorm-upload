import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title, 
    value, 
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsReporitory = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsReporitory.getBalance();
    
    if (type === "outcome" && total < value) {
      throw new AppError("you do not have money");
    }


    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if(!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
    }

    await categoryRepository.save(transactionCategory);


    const transaction = transactionsReporitory.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsReporitory.save(transaction); 
    return transaction;


  }
}

export default CreateTransactionService;
