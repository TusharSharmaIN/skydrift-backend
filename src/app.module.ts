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
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');

        if (databaseUrl) {
          // Strip channel_binding if present to avoid driver handshake errors
          const cleanUrl = databaseUrl
            .replace('&channel_binding=require', '')
            .replace('?channel_binding=require', '');

          return {
            type: 'postgres',
            url: cleanUrl,
            autoLoadEntities: true,
            synchronize: true,
            ssl: {
              rejectUnauthorized: false,
            },
          };
        }

        // Local fallback
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USERNAME', 'skydrift'),
          password: config.get<string>('DB_PASSWORD', 'skydrift'),
          database: config.get<string>('DB_NAME', 'skydrift_dev'),
          autoLoadEntities: true,
          synchronize: true,
          ssl: false,
        };
      },
    }),
    TerminusModule,
    DriftModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
