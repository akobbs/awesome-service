import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TokenType } from '../types';
import { User } from '../../users/user.entity';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'text' })
  public token: string;

  @Column({
    type: 'enum',
    enum: TokenType,
  })
  type: TokenType;

  @Column('timestamp')
  expiresAt: Date;

  @ManyToOne(() => User, (user) => user.tokens)
  public user: User;
}
