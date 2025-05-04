import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ContentsModule } from './contents/contents.module';
import { AuthModule } from './auth/auth.module';
import { ContentController } from './content.controller';
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';
import { ContentGateway } from './content.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    AuthModule,
    UsersModule,
    ContentsModule,
  ],
  controllers: [AppController, ContentController, S3Controller],
  providers: [AppService, S3Service, ContentGateway],
})
export class AppModule {}
