const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const protoObject = protoLoader.loadSync(
  path.resolve(__dirname, '../proto/bookstore.proto'),
);

const protoDefinition = grpc.loadPackageDefinition(protoObject);

const port = 50051;

const bookstoreClient = new protoDefinition.Bookstore(
  `localhost:${port}`,
  grpc.credentials.createInsecure(),
);

const authorClient = new protoDefinition.Authors(
  `localhost:${port}`,
  grpc.credentials.createInsecure(),
);

const operations = {
  // Authors
  // Create Author
  CreateAuthor: () =>
    authorClient.CreateAuthor(
      {
        author: {
          name: 'Mauricio',
          image_url: '',
          description: 'Mauricio descrição',
        },
      },
      (error, response) => {
        console.log(error || response.authors);
      },
    ),

  // Get Author List
  ListAuthor: () =>
    authorClient.ListAuthor({}, (error, response) => {
      console.log(error || response.authors);
    }),

  // Get Author By Id
  GetAuthor: () =>
    authorClient.GetAuthor(
      {
        authorId:
          '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
      },
      (error, response) => {
        console.log(error || response.authors);
      },
    ),

  // Update Author
  UpdateAuthor: () =>
    authorClient.UpdateAuthor(
      {
        authorId:
          '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
        data: {
          name: 'Mauricio André',
          image_url: '',
          description: 'Mauricio descrição',
        },
      },
      (error, response) => {
        console.log(error || response.authors);
      },
    ),

  // Delete Author
  DeleteAuthor: () =>
    authorClient.DeleteAuthor(
      {
        authorId:
          '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
      },
      (error, response) => {
        console.log(error || response.authors);
      },
    ),

  // Books
  // Create Book
  CreateBook: () =>
    bookstoreClient.CreateBook(
      {
        book: {
          title: 'Pensamentos sem sentido de um homem sem ideias',
          author:
            '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
          description: 'Um portal para minha mente',
          image_url: '',
          price: 100000,
          pages: 50,
          published_date: new Date().getDate(),
        },
      },
      (error, response) => {
        console.log(error || response.books);
      },
    ),

  // Get Book List
  ListBook: () =>
    bookstoreClient.ListBook({}, (error, response) => {
      console.log(error || response.books);
    }),

  // Get Book By Id
  GetBook: () =>
    bookstoreClient.GetBook(
      {
        bookId:
          'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8',
      },
      (error, response) => {
        console.log(error || response.books);
      },
    ),

  // Update Book
  UpdateBook: () =>
    bookstoreClient.UpdateBook(
      {
        bookId:
          'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8',
        data: {
          title: 'Pensamentos sem sentido de um homem sem ideias',
          author:
            '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
          description: 'Um portal para minha mente',
          image_url: '',
          price: 100000,
          pages: 50,
          published_date: new Date().getDate(),
        },
      },
      (error, response) => {
        console.log(error || response.books);
      },
    ),

  // Delete Book
  DeleteBook: () =>
    bookstoreClient.DeleteBook(
      {
        bookId:
          'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8',
      },
      (error, response) => {
        console.log(error || response.books);
      },
    ),
};

operations.ListBook();
