import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('drifts')
export class Drift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  imageUrl: string;

  @Column()
  imaginedShape: string;

  @Column()
  cloudType: string;

  @Column()
  weatherForecast: string;

  @Column('text')
  poeticLore: string;

  @CreateDateColumn()
  createdAt: Date;
}
