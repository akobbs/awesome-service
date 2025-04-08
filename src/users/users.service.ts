import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { DeleteUserDto } from './dto/deleteUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { PostgresError } from '../database/postgresError';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  public async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  public async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  public async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  public async changeEmailVerificationStatus(
    user: User,
    isEmailVerified: boolean,
  ) {
    return this.usersRepository.update(user.id, { isEmailVerified });
  }

  public async changePassword(user: User, newPassword: string) {
    return this.usersRepository.update(user.id, {
      password: newPassword,
    });
  }

  /**
   * @throws {ConflictException} - Throws when the email already exists
   * @throws {InternalServerErrorException} - Throws for unhandled errors
   */
  public async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const userToCreate = this.usersRepository.create(createUserDto);
      const newUser = await this.usersRepository.save(userToCreate);
      return newUser;
    } catch (error) {
      if (error.code === PostgresError.UNIQUE_VIOLATION) {
        throw new ConflictException('Email already exists');
      }

      throw new InternalServerErrorException();
    }
  }

  public async update(updateUserDto: UpdateUserDto): Promise<boolean> {
    const updateResult = await this.usersRepository.update(
      updateUserDto.id,
      updateUserDto,
    );

    return (updateResult.affected ?? 0) > 0;
  }

  public async delete(deleteUserDto: DeleteUserDto): Promise<boolean> {
    const deleteResult = await this.usersRepository.delete(deleteUserDto.id);
    return (deleteResult.affected ?? 0) > 0;
  }
}
