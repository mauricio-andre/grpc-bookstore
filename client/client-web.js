const { AuthorsClient, BookstoreClient } = require('../proto/bookstore_grpc_web_pb');
const { GetBookRequest, GetAuthorRequest } = require('../proto/bookstore_pb');;
const { Empty } = require('google-protobuf/google/protobuf/empty_pb');

const port = 8080;
const bookstoreClient = new BookstoreClient('http://localhost:' + port);
const authorsClient = new AuthorsClient('http://localhost:' + port);

bookstoreClient.listBook(new Empty(), {}, (error, response) => {
  if (error) return console.log(error);
  const books = response.getBooksList().map(book => book.toObject());
  const list = document.createElement('ul');
  books.forEach(book => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#" onclick="loadBook('${book.id}')" type="button">${book.title}</a>`;
    list.appendChild(li);
  });

  document.getElementById('books').appendChild(list);
});

document.loadBook = (bookId) => {
  bookstoreClient.getBook(new GetBookRequest().setBookid(bookId), {}, (error, response) => {
    if (error) return console.log(error);
    const book = response.getBooks().toObject();
    const result = document.querySelector('#result>div');
    result.innerHTML = `<pre>${JSON.stringify(book, null, 2)}</pre>`;
  });
};

authorsClient.listAuthor(new Empty(), {}, (error, response) => {
  if (error) return console.log(error);
  const authors = response.getAuthorsList().map(author => author.toObject());
  const list = document.createElement('ul');
  authors.forEach(author => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#" onclick="loadAuthor('${author.id}')" type="button">${author.name}</a>`;
    list.appendChild(li);
  });

  document.getElementById('authors').appendChild(list);
});

document.loadAuthor = (authorId) => {
  authorsClient.getAuthor(new GetAuthorRequest().setAuthorid(authorId), {}, (error, response) => {
    if (error) return console.log(error);
    const author = response.getAuthors().toObject();
    const result = document.querySelector('#result>div');
    result.innerHTML = `<pre>${JSON.stringify(author, null, 2)}</pre>`;
  });
};