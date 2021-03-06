import { Server, ServerCredentials } from '@grpc/grpc-js';
import { AuthorsService, BookstoreService } from '../proto/bookstore_grpc_pb';
import DB from './db';
import { authorImpl, bookstoreImpl } from './handlers';
const Database = new DB();

const server = new Server();
server.addService(BookstoreService, bookstoreImpl(Database));
server.addService(AuthorsService, authorImpl(Database));

server.bindAsync(
  `0.0.0.0:${process.env.PORT || 50051}`,
  ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      throw err;
    }
    server.start();
    console.log(`Server listening on ${port}`);
  },
);
