import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';

// modules imports
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CommonModule } from './common/common.module';
import { LoggerService } from './common/index';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      // validate,
      cache: true,
    }),
    RouterModule.register([
      { path: 'users', module: UsersModule },
      { path: 'auth', module: AuthModule },
    ]),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 60, // 60 requests per minute
      },
      {
        name: 'strict',
        ttl: 60000, // 1 minute
        limit: 10, // For sensitive endpoints
      },
      {
        name: 'auth',
        ttl: 900000, // 15 minutes
        limit: 5, // For login/signup
      },
    ]),
    MongooseModule.forRoot(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/thrive',
      {
        // Add these options for production:
        retryAttempts: 3,
        retryDelay: 1000,
        connectionFactory: (connection: Connection) => {
          const connectionState = connection.readyState;
          const states = [
            'disconnected',
            'connected',
            'connecting',
            'disconnecting',
            'uninitialized',
          ];

          console.log(`MongoDB Status: ${states[connectionState]}`);
          return connection;
        },
      },
    ),
    AuthModule,
    UsersModule,
    CommonModule,
    TerminusModule,
  ],
  providers: [LoggerService],
})
export class AppModule {
  constructor(private readonly logger: LoggerService) {}

  onModuleInit() {
    this.logger.log('AppModule initialized');
  }
}
