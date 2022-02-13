function GetBook(database) {
  return (call, callback) => {
    try {
      const {bookId} = call.request;
      const book = assertBook(database, bookId);
      return callback(null, { books: book });
    } catch (error) {
      return callback(error, null);
    }
  };
}

function UpdateBook(database) {
  return (call, callback) => {
    try {
      const {bookId, data} = call.request;
      assertBook(database, bookId);
      const newBook = database.updateBook(bookId, data);
      database.save();
      return callback(null, { books: newBook });
    } catch (error) {
      return callback(error, null);
    }
  };
}

function ListBook (database) {
  return (_, callback) => {
    return callback(null, { books: database.listBooks() });
  };
}

function DeleteBook (database) {
  return (call, callback) => {
    try {
      const {bookId} = call.request;
      assertBook(bookId);
      database.deleteBook(database, bookId);
      database.save();
      return callback(null, {});
    } catch (error) {
      return callback(error, null);
    }
  };
}

function CreateBook(database) {
  return (call, callback) => {
    try {
      const {book} = call.request;
      const newBook = database.addBook(book);
      database.save();
      return callback(null, { books: newBook });
    } catch (error) {
      return callback(error, null);
    }
  };
}

function assertBook(database, id) {
  const book = database.getBook(id);
  if (!book)
    throw new Error(`Book ${id} not found`);

  return book;
}

module.exports = (databaseInstance) => ({
  GetBook: GetBook(databaseInstance),
  UpdateBook: UpdateBook(databaseInstance),
  DeleteBook: DeleteBook(databaseInstance),
  ListBook: ListBook(databaseInstance),
  CreateBook: CreateBook(databaseInstance),
});
