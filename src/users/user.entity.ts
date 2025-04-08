import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RefreshToken } from '../auth/entities/refreshToken.entity';
import { Exclude } from 'class-transformer';
import { Token } from '../auth/entities/token.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public email: string;

  @Column()
  public name: string;

  @Column()
  @Exclude()
  public password: string;

  @Column({ default: false })
  @Exclude()
  public isEmailVerified: boolean = false;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  public refreshTokens: RefreshToken[];

  @OneToMany(() => Token, (token) => token.user)
  public tokens: Token[];
}
