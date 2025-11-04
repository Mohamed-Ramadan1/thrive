import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/fanous_app', {
      connectionFactory: (connection: Connection) => {
        console.log('🔵 ConnectionFactory called'); // Add this first

        connection.on('connected', () => {
          console.log('✅ MongoDB connection established');
        });

        connection.on('disconnected', () => {
          console.log('❌ MongoDB disconnected');
        });

        connection.on('error', (error) => {
          console.error('⚠️ MongoDB connection error:', error);
        });

        // Add immediate state check
        console.log('🔍 Connection state:', connection.readyState);
        // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting

        return connection;
      },
    }),
  ],
})
export class AppModule {}
