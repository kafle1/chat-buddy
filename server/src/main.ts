import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  AsyncApiDocumentBuilder,
  AsyncApiModule,
  AsyncServerObject,
} from 'nestjs-asyncapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const asyncApiServer: AsyncServerObject = {
    url: 'http://localhost:6000',
    protocol: 'socket.io',
    protocolVersion: '4',
    description:
      'Allows you to connect using the websocket protocol to our Socket.io server.',
    security: [{ 'user-password': [] }],
    variables: {
      port: {
        description: 'Secure connection (TLS) is available through port 443.',
        default: '443',
      },
    },
    bindings: {},
  };

  const asyncApiOptions = new AsyncApiDocumentBuilder()
    .setTitle('Chat Buddy')
    .setDescription('The Chat Buddy API : Fully fledged chat application')
    .setVersion('1.0')
    .setDefaultContentType('application/json')
    .addSecurity('user-password', { type: 'userPassword' })
    .addServer('chat-buddy-server', asyncApiServer)
    .build();

  const asyncapiDocument = await AsyncApiModule.createDocument(
    app,
    asyncApiOptions,
  );
  await AsyncApiModule.setup('/async-api', app, asyncapiDocument);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
