import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'text' })
  public token: string;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  public user: User;
}
