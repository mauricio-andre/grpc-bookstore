const describe = require('ava');
const sinon = require("sinon");
const booksImpl = require("../src/handlers/bookstore");
const db = require("../src/db");

request = (data) => ({ request: data });

const initialData = {
  books: [["a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8", { "title": "Pensamentos sem sentido de um homem sem ideias", "author": "60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa", "description": "Um portal para minha mente", "price": 100000, "pages": 50, "id": "a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8" }]],
  authors: [["60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa",{"name":"Mauricio André","description":"Mauricio descrição","id":"60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa"}]]
};

const globalDb = new db(null, initialData);

const sandBox = sinon.createSandbox();

describe('Deve listar todos os livros', assert => {
  const dbSpy = sandBox.spy(globalDb);
  const impl = booksImpl(dbSpy);
  impl.ListBook(request({}), (error, response) => {
    assert.true(dbSpy.listBooks.calledOnce);
    assert.true(response.books.length === 1);
    assert.falsy(error);
  });

  sandBox.restore();
});

describe('Deve buscar um livro', assert => {
  const dbSpy = sandBox.spy(globalDb);
  const impl = booksImpl(dbSpy);
  impl.GetBook(request({ bookId: 'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8' }), (error, response) => {
    assert.true(dbSpy.getBook.calledOnce);
    assert.truthy(response.books);
    assert.is(response.books.id, 'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8');
    assert.falsy(error);
  });

  sandBox.restore();
});

describe('Erro ao buscar um livro inexistente', assert => {
  const dbSpy = sandBox.spy(globalDb);
  const impl = booksImpl(dbSpy);
  const bookId = 'não existe';
  impl.GetBook(request({ bookId }), (error, response) => {
    assert.true(dbSpy.getBook.calledOnce);
    assert.falsy(response);
    assert.truthy(error);
    assert.is(error.message, `Book ${bookId} not found`)
  });

  sandBox.restore();
});

describe('Erro ao deletar um livro inexistente', assert => {
  const spy = sandBox.spy(globalDb, 'deleteBook');
  sandBox.stub(globalDb, 'save').returns();
  sandBox.stub(globalDb, 'load').returns();

  const impl = booksImpl(globalDb);
  const bookId = 'não existe';
  impl.DeleteBook(request({ bookId }), (error, response) => {
    assert.false(spy.calledOnce);
    assert.falsy(response);
    assert.truthy(error);
    assert.is(error.message, `Book ${bookId} not found`)
    assert.true(globalDb.data.books.size === 1);
  });

  sandBox.restore();
});

describe('Deletar um item existente', assert => {
  const localDb = new db(null, initialData);
  const spy = sandBox.spy(localDb, 'deleteBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const bookId = 'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8';
  impl.DeleteBook(request({ bookId }), (error, response) => {
    assert.true(spy.calledOnce);
    assert.truthy(response);
    assert.falsy(error);
    assert.true(localDb.data.books.size === 0);
  });

  sandBox.restore();
});

describe('Atualizar um item existente', assert => {
  const localDb = new db(null, initialData);
  const spy = sandBox.spy(localDb, 'updateBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const data = {
    bookId: 'a06cc684511dfe6856ca0468bd20e1e1667c4dac7299d4274a6cae523d20e1e8',
    data: { title: 'teste' },
  };

  impl.UpdateBook(request(data), (error, response) => {
    assert.true(spy.calledOnce);
    assert.truthy(response);
    assert.falsy(error);
    assert.is(response.books.title, data.data.title);
    assert.is(response.books.id, data.bookId);
  });

  sandBox.restore();
});

describe('Erro ao atualizar um item inexistente', assert => {
  const localDb = new db(null, initialData);
  const spy = sandBox.spy(localDb, 'updateBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const data = {
    bookId: 'não existe',
    data: { title: 'teste' },
  };

  impl.UpdateBook(request(data), (error, response) => {
    assert.falsy(spy.calledOnce);
    assert.falsy(response);
    assert.truthy(error);
  });

  sandBox.restore();
});

describe('Não deve inserir um livro existente', assert => {
  const localDb = new db(null, initialData);
  const spy = sandBox.spy(localDb, 'addBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const data = {
    book: {
      author: '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
      title: 'Pensamentos sem sentido de um homem sem ideias',
    }
  };

  impl.CreateBook(request(data), (error, response) => {
    assert.true(spy.calledOnce);
    assert.falsy(response);
    assert.truthy(error);
    assert.regex(error.message, /already exists/);
  });

  sandBox.restore();
});

describe('Não deve incluir um livro de um autor inexistente', assert => {
  const localDb = new db(null, initialData);
  const spy = sandBox.spy(localDb, 'addBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const data = {
    book: {
      author: 'não existe',
      title: 'Pensamentos sem sentido de um homem sem ideias',
    }
  };

  impl.CreateBook(request(data), (error, response) => {
    assert.true(spy.calledOnce);
    assert.falsy(response);
    assert.truthy(error);
    assert.is(error.message, `Author "${data.book.author}" not found`);
  });

  sandBox.restore();
});

describe('Deve adicionar um novo livro', assert => {
  const localDb = new db(null, initialData);
  const spy = sandBox.spy(localDb, 'addBook');
  sandBox.stub(localDb, 'save').returns();
  sandBox.stub(localDb, 'load').returns();

  const impl = booksImpl(localDb);
  const data = {
    book: {
      author: '60026e67d2ee71405b92cd19fa5535287b6c065ba27562db1d1a7fb6d4c571aa',
      title: 'Pensamentos sem sentido de um homem sem ideias. Vol 2',
    }
  };

  impl.CreateBook(request(data), (error, response) => {
    assert.true(spy.calledOnce);
    assert.truthy(response);
    assert.falsy(error);
    assert.is(response.books.title, data.book.title);
    assert.true(localDb.data.books.size === 2);
  });

  sandBox.restore();
});