import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusModule } from '@nestjs/terminus';
import { envValidationSchema } from './config/env.validation';
import { HealthController } from './health.controller';
import { DriftModule } from './modules/drift/drift.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<number>('DB_PORT', 5432)),
        username: config.get<string>('DB_USERNAME', 'skydrift'),
        password: config.get<string>('DB_PASSWORD', 'skydrift_password'),
        database: config.get<string>('DB_NAME', 'skydrift_dev'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TerminusModule,
    DriftModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
